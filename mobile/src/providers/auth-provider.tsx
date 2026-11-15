import AsyncStorage from "@react-native-async-storage/async-storage"
import type { HttpTypes } from "@medusajs/types"
import { useQueryClient } from "@tanstack/react-query"
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"

import { sdk } from "@/lib/medusa"

import { useCart } from "./cart-provider"

export type Customer = HttpTypes.StoreCustomer

type RegisterInput = { first_name: string; last_name: string; email: string; password: string }

type AuthContextValue = {
  customer: Customer | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (input: RegisterInput) => Promise<void>
  logout: () => Promise<void>
}

const TOKEN_KEY = "shelby.auth_token"
const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const { transferToCustomer, reset: resetCart } = useCart()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadCustomer = useCallback(async () => {
    try {
      const { customer: me } = await sdk.store.customer.retrieve()
      setCustomer(me)
      return me
    } catch {
      setCustomer(null)
      return null
    }
  }, [])

  useEffect(() => {
    ;(async () => {
      const token = await AsyncStorage.getItem(TOKEN_KEY).catch(() => null)
      if (token) await loadCustomer()
      setIsLoading(false)
    })()
  }, [loadCustomer])

  const afterSignIn = useCallback(async () => {
    const me = await loadCustomer()
    if (!me) throw new Error("Signed in, but we couldn't load your account.")
    await transferToCustomer()
    await queryClient.invalidateQueries({ queryKey: ["orders"] })
  }, [loadCustomer, queryClient, transferToCustomer])

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await sdk.auth.login("customer", "emailpass", { email: email.trim(), password })
      if (typeof result !== "string") throw new Error("This sign-in method isn't supported in the app.")
      await afterSignIn()
    },
    [afterSignIn]
  )

  const register = useCallback(
    async ({ first_name, last_name, email, password }: RegisterInput) => {
      const cleanEmail = email.trim()
      await sdk.auth.register("customer", "emailpass", { email: cleanEmail, password })
      await sdk.store.customer.create({ email: cleanEmail, first_name: first_name.trim(), last_name: last_name.trim() })
      const result = await sdk.auth.login("customer", "emailpass", { email: cleanEmail, password })
      if (typeof result !== "string") throw new Error("Account created. Please sign in.")
      await afterSignIn()
    },
    [afterSignIn]
  )

  const logout = useCallback(async () => {
    try {
      await sdk.auth.logout()
    } catch {
      // Token is cleared locally either way.
    }
    await AsyncStorage.removeItem(TOKEN_KEY).catch(() => undefined)
    setCustomer(null)
    await resetCart({ keepAttribution: true })
    queryClient.removeQueries({ queryKey: ["orders"] })
  }, [queryClient, resetCart])

  const value = useMemo(
    () => ({ customer, isLoading, login, register, logout }),
    [customer, isLoading, login, register, logout]
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>")
  return ctx
}
