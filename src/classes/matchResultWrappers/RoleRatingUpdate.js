class RoleRatingUpdate
{
    player_role_rating;
    game_team;

    match; // This is added After Match Insert
    role_rating_change;
    old_role_rating;

    constructor(teamMember)
    {
        this.player_role_rating = teamMember.memberRoleRatings[teamMember.selectedMemberRoleIndex].roleRatingDBId;
        this.old_role_rating = teamMember.memberRoleRatings[teamMember.selectedMemberRoleIndex].roleRating;
        this.game_team = teamMember.team.teamConfigId;

        this.role_rating_change = 0;
        this.match = null;
    }

    updateRatingChange(newRatingChange)
    {
        this.role_rating_change = newRatingChange;
    }

    setMatchResultId(matchId)
    {
        this.match = matchId;
    }
}

module.exports = { RoleRatingUpdate };