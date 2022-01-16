class MatchResult
{
    teamResults;
    matchMapId;
    gameId;
    winningTeam;

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