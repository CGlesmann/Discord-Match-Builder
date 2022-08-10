const { BaseInteraction } = require("./base/BaseInteraction");
const { ApplicationCacheManager } = require("../managers/applicationCacheManager");
const { APPLICATION_CACHE_KEYS } = require("../utils/Constants");

class GenerateAnotherMatchInteraction extends BaseInteraction
{
    async executeInteraction(interactionObject, interactionInfo)
    {
        const targetMessageId = interactionInfo.interactionArguments[0];

        const matchGenerationRequestList = ApplicationCacheManager.retrieveCacheData(APPLICATION_CACHE_KEYS.MATCH_GENERATION_REQUESTS);
        const targetMatchGenerationRequest = matchGenerationRequestList.getMatchGenerationRequest(targetMessageId);

        await targetMatchGenerationRequest.generateMatchInstance();
        targetMatchGenerationRequest.updateGenerationScreen(interactionObject);
    }
}

module.exports = GenerateAnotherMatchInteraction.buildExportObject();