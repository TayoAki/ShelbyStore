import { MedusaService } from "@medusajs/framework/utils"
import Release from "./models/release"
import ReleaseReminder from "./models/release-reminder"

class ReleaseModuleService extends MedusaService({
  Release,
  ReleaseReminder,
}) {}

export default ReleaseModuleService
