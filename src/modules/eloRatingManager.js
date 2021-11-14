class MatchResult
{
    teamResults;

    constructor()
    {
        this.teamResults = [];
    }

    addTeamResult(teamResult)
    {
        this.teamResults.push(teamResult);
    }
}

class TeamResult
{
    roleRatingUpdates;
    result;

    constructor(team)
    {
        this.roleRatingUpdates = [];
        for (let teamMember of team.teamMembers)
        {
            this.roleRatingUpdates.push(new RoleRatingUpdate(
                teamMember.discordId,
                teamMember.memberRoleRatings[teamMember.selectedMemberRoleIndex].roleName
            ));
        }
    }

    setResult(result)
    {
        this.result = result;
    }

    setRatingPoints(pointsEarned)
    {
        //this.ratingPointsEarned = pointsEarned;
        for (let roleRatingUpdate of this.roleRatingUpdates)
        {
            roleRatingUpdate.ratingChange = pointsEarned;
        }
    }
}

class RoleRatingUpdate
{
    playerDiscordId;
    roleName;
    ratingChange;

    constructor(playerDiscordId, roleName)
    {
        this.playerDiscordId = playerDiscordId;
        this.roleName = roleName;
        this.ratingChange = 0;
    }

    updateRatingChange(newRatingChange)
    {
        this.ratingChange = newRatingChange;
    }
}

// TODO: adapt algorithm to account for more than two teams
// TODO: fetch kFactor from Server
function contructMatchResultWrapper(winningTeamIndex, match)
{
    const K_FACTOR = 32; // Maximum amount to be won/lost
    const WIN_ACTUAL_AMOUNT = 1;
    const DRAW_ACTUAL_AMOUNT = 0.5;
    const LOSE_ACTUAL_AMOUNT = 0;
    const matchResult = new MatchResult();

    let losingTeams = [];
    let winningTeam = match.teams[winningTeamIndex];

    let winningTeamResult = new TeamResult(winningTeam);
    winningTeamResult.setResult("Won");

    for (let i = 0; i < match.teams.length; i++)
    {
        if (i === winningTeamIndex)
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
            LOSE_ACTUAL_AMOUNT,
            calculateExpectedScore(targetTeam.teamRating, winningTeam.teamRating)
        )));

        matchResult.addTeamResult(newTeamResult)
    }

    let expectedScore = calculateExpectedScore(winningTeam.teamRating, losingTeams[0].teamRating);
    winningTeamResult.setRatingPoints(Math.round(calculateScoreChange(
        K_FACTOR,
        WIN_ACTUAL_AMOUNT,
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