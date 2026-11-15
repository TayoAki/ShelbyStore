import { Module } from "@medusajs/framework/utils"
import ReleaseModuleService from "./service"

export const RELEASE_MODULE = "release"

export default Module(RELEASE_MODULE, {
  service: ReleaseModuleService,
})
