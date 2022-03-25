const { BaseInteraction } = require("./base/BaseInteraction");
const { ApplicationCacheManager } = require("../managers/applicationCacheManager");
const { MatchCompletedScreen } = require("../ui/screens/MatchCompletedScreen");
const { contructMatchResultWrapper } = require("../modules/eloRatingManager");
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
        console.log(JSON.stringify(generatedMatchResult, null, 4));
        //postMatchResult(generatedMatchResult);

        let matchCompletedScreen = new MatchCompletedScreen(targetInProgressMatchTracker, generatedMatchResult);
        interactionObject.update(matchCompletedScreen.getCompletedMatchScreen(interactionObject.message.embeds[0]));

        return;
    }
}

module.exports = ReportMatchResultInteraction.buildExportObject();