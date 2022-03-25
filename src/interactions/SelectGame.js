const { BaseInteraction } = require("./base/BaseInteraction");
const { ApplicationCacheManager } = require("../managers/applicationCacheManager.js");

const { APPLICATION_CACHE_KEYS } = require("../utils/Constants.js");

class SelectGameInteraction extends BaseInteraction
{
    async executeInteraction(interactionObject, interactionInfo)
    {
        const targetMessageId = interactionInfo.interactionArguments[0];

        const matchGenerationRequestList = ApplicationCacheManager.retrieveCacheData(APPLICATION_CACHE_KEYS.MATCH_GENERATION_REQUESTS);
        const targetMatchGenerationRequest = matchGenerationRequestList.getMatchGenerationRequest(targetMessageId);

        const targetGameId = interactionObject.values[0];
        const gameIdToGameData = ApplicationCacheManager.retrieveCacheData(APPLICATION_CACHE_KEYS.ALL_GAME_DATA);
        const targetGameData = gameIdToGameData.get(targetGameId);

        targetMatchGenerationRequest.setTargetGameData(targetGameData);
        await targetMatchGenerationRequest.initializeMatchGenerationScreen();
        targetMatchGenerationRequest.updateGenerationScreen(interactionObject);
    }
}

module.exports = SelectGameInteraction.buildExportObject();