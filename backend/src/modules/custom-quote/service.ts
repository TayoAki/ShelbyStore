import { MedusaService } from "@medusajs/framework/utils"
import CustomQuote from "./models/custom-quote"

class CustomQuoteModuleService extends MedusaService({ CustomQuote }) {}

export default CustomQuoteModuleService
