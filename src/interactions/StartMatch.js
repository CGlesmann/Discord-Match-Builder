const { BaseInteraction } = require("./base/BaseInteraction");
const { ApplicationCacheManager } = require("../managers/applicationCacheManager.js");
const { InProgressMatchTrackerList } = require("../classes/applicationCacheWrappers/InProgressMatchTrackerList.js");

const { APPLICATION_CACHE_KEYS } = require("../utils/Constants.js");

class StartMatchInteraction extends BaseInteraction
{
    async executeInteraction(interactionObject, interactionInfo)
    {
        const targetMessageId = interactionInfo.interactionArguments[0];

        const matchGenerationRequestList = ApplicationCacheManager.retrieveCacheData(APPLICATION_CACHE_KEYS.MATCH_GENERATION_REQUESTS);
        const targetMatchGenerationRequest = matchGenerationRequestList.getMatchGenerationRequest(targetMessageId);

        let newInProgressMatchTracker = targetMatchGenerationRequest.startMatch(interactionObject);

        matchGenerationRequestList.deleteMatchGenerationRequest(targetMatchGenerationRequest.message.id);
        this.cacheNewInProgressMatchTracker(targetMessageId, newInProgressMatchTracker);
    }

    cacheNewInProgressMatchTracker(messageId, newInProgressMatchTracker)
    {
        let inProgressMatchTrackerList = ApplicationCacheManager.retrieveCacheData(APPLICATION_CACHE_KEYS.IN_PROGRESS_MATCH_TRACKERS);
        if (!inProgressMatchTrackerList)
        {
            inProgressMatchTrackerList = new InProgressMatchTrackerList();

            inProgressMatchTrackerList.addInProgressMatchTracker(messageId, newInProgressMatchTracker);
            ApplicationCacheManager.addDataToCache(
                APPLICATION_CACHE_KEYS.IN_PROGRESS_MATCH_TRACKERS,
                inProgressMatchTrackerList,
                0
            );

            return;
        }

        inProgressMatchTrackerList.addInProgressMatchTracker(messageId, newInProgressMatchTracker);
        return;
    }
}

module.exports = StartMatchInteraction.buildExportObject();