const { MatchResult } = require('../classes/matchResultWrappers/MatchResult');
const { TeamResult } = require('../classes/matchResultWrappers/TeamResult');
const { MATCH_RESULT_ACTUAL_AMOUNT } = require("../utils/Constants");

// TODO: adapt algorithm to account for more than two teams
// TODO: fetch kFactor from Server
function contructMatchResultWrapper(winningTeamIndex, match)
{
    const K_FACTOR = 32; // Maximum amount to be won/lost

    const matchResult = new MatchResult();
    matchResult.matchMapId = match.map.id;
    matchResult.gameId = match.game.gameId;
    matchResult.winningTeam = match.teams[winningTeamIndex].teamConfigId;
    matchResult.winningTeamIndex = winningTeamIndex;

    let losingTeams = [];
    let winningTeam = match.teams[winningTeamIndex];

    let winningTeamResult = new TeamResult(winningTeam);
    winningTeamResult.setResult("Won");

    for (let i = 0; i < match.teams.length; i++)
    {
        if (i === Number(winningTeamIndex))
        {
            matchResult.addTeamResult(winningTeamResult);
            continue;
        }

        let targetTeam = match.teams[i];
        losingTeams.push(targetTeam);

        let newTeamResult = new TeamResult(targetTeam);
        newTeamResult.setResult("Lost");
        newTeamResult.setRatingPoints(Math.round(calculateScoreChange(
            K_FACTOR,
            MATCH_RESULT_ACTUAL_AMOUNT.LOST,
            calculateExpectedScore(targetTeam.teamRating, winningTeam.teamRating)
        )));

        matchResult.addTeamResult(newTeamResult)
    }

    let expectedScore = calculateExpectedScore(winningTeam.teamRating, losingTeams[0].teamRating);
    winningTeamResult.setRatingPoints(Math.round(calculateScoreChange(
        K_FACTOR,
        MATCH_RESULT_ACTUAL_AMOUNT.WON,
        expectedScore
    )));

    return matchResult;
}

function calculateExpectedScore(targetRating, opposingRating)
{
    let teamDifference = (opposingRating - targetRating);
    let exponent = teamDifference / 400;
    let denominator = 1 + Math.pow(10, exponent);
    let expectedScore = (1 / denominator);

    return expectedScore;
}

function calculateScoreChange(kFactor, actualScore, expectedScore)
{
    return (kFactor * (actualScore - expectedScore));
}

module.exports = { contructMatchResultWrapper, calculateExpectedScore, calculateScoreChange };