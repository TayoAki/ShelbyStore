import Constants from "expo-constants"
import * as Device from "expo-device"
import * as Notifications from "expo-notifications"
import { Platform } from "react-native"

/**
 * Returns an Expo push token for drop reminders, or null when push isn't possible
 * (web, simulator, no EAS projectId configured, or permission denied). Never throws:
 * email reminders still work without it.
 */
export async function getPushTokenSilently(): Promise<string | null> {
  try {
    if (Platform.OS === "web" || !Device.isDevice) return null
    const projectId =
      (Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined)?.eas?.projectId ??
      Constants.easConfig?.projectId
    if (!projectId) return null

    let { status } = await Notifications.getPermissionsAsync()
    if (status !== "granted") {
      status = (await Notifications.requestPermissionsAsync()).status
    }
    if (status !== "granted") return null

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("drops", {
        name: "Drops",
        importance: Notifications.AndroidImportance.DEFAULT,
      })
    }
    const { data } = await Notifications.getExpoPushTokenAsync({ projectId })
    return data
  } catch {
    return null
  }
}
