const { BaseInteraction } = require("./base/BaseInteraction");
const { ApplicationCacheManager } = require("../managers/applicationCacheManager");
const { APPLICATION_CACHE_KEYS } = require("../utils/Constants");

class ScrollMatchCarouselInteraction extends BaseInteraction
{
    async executeInteraction(interactionObject, interactionInfo)
    {
        const [targetMessageId, scrollDirection] = interactionInfo.interactionArguments;

        const matchGenerationRequestList = ApplicationCacheManager.retrieveCacheData(APPLICATION_CACHE_KEYS.MATCH_GENERATION_REQUESTS);
        const targetMatchGenerationRequest = matchGenerationRequestList.getMatchGenerationRequest(targetMessageId);

        targetMatchGenerationRequest.scrollCurrentMatchDisplay(interactionObject, scrollDirection);
    }
}

module.exports = ScrollMatchCarouselInteraction.buildExportObject();