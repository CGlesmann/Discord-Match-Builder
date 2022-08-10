class MatchResult
{
    teamResults;
    matchMapId;
    gameId;

    winningTeam;
    winningTeamIndex;

    constructor()
    {
        this.teamResults = [];
    }

    addTeamResult(teamResult)
    {
        this.teamResults.push(teamResult);
    }
}

module.exports = { MatchResult };