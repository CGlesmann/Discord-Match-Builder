const { RoleRatingUpdate } = require('./RoleRatingUpdate');

class TeamResult
{
    roleRatingUpdates;
    result;

    constructor(team)
    {
        this.roleRatingUpdates = [];
        for (let teamMember of team.teamMembers)
        {
            this.roleRatingUpdates.push(new RoleRatingUpdate(teamMember));
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
            roleRatingUpdate.role_rating_change = pointsEarned;
        }
    }
}

module.exports = { TeamResult };