const { BaseInteraction } = require("./base/BaseInteraction");
const { ApplicationCacheManager } = require("../managers/applicationCacheManager");
const { MatchCompletedScreen } = require("../ui/screens/MatchCompletedScreen");
const { contructMatchResultWrapper } = require("../managers/eloRatingManager");
const { postMatchResult } = require("../interfaces/databaseInterface");
const { APPLICATION_CACHE_KEYS } = require("../utils/Constants");

class ReportMatchResultInteraction extends BaseInteraction
{
    async executeInteraction(interactionObject, interactionInfo)
    {
        const [winningTeamIndex, messageId] = interactionInfo.interactionArguments;

        const inProgressMatchTrackerList = ApplicationCacheManager.retrieveCacheData(APPLICATION_CACHE_KEYS.IN_PROGRESS_MATCH_TRACKERS);
        const targetInProgressMatchTracker = inProgressMatchTrackerList.getInProgressMatchTracker(messageId);
        targetInProgressMatchTracker.match.endMatch();

        const generatedMatchResult = contructMatchResultWrapper(winningTeamIndex, targetInProgressMatchTracker.match);
        postMatchResult(generatedMatchResult);

        let matchCompletedScreen = new MatchCompletedScreen(targetInProgressMatchTracker, generatedMatchResult);
        interactionObject.update(matchCompletedScreen.getCompletedMatchScreen(interactionObject.message.embeds[0]));

        return;
    }
}

module.exports = ReportMatchResultInteraction.buildExportObject();