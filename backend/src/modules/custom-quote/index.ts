import { Module } from "@medusajs/framework/utils"
import CustomQuoteModuleService from "./service"

export const CUSTOM_QUOTE_MODULE = "custom_quote"

export default Module(CUSTOM_QUOTE_MODULE, {
  service: CustomQuoteModuleService,
})
