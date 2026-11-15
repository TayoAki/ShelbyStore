import { MedusaService } from "@medusajs/framework/utils"
import ContentEpisode from "./models/content-episode"
import ContentSeries from "./models/content-series"

class ContentModuleService extends MedusaService({
  ContentSeries,
  ContentEpisode,
}) {}

export default ContentModuleService
