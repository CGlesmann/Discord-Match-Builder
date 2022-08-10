class TeamMemberRoleRating
{
    roleRatingDBId;
    roleName;
    roleRating;
    isPrimary;

    constructor(roleRatingDBId, roleName, roleRating, isPrimary)
    {
        this.roleRatingDBId = roleRatingDBId;
        this.roleName = roleName;
        this.roleRating = roleRating;
        this.isPrimary = isPrimary;
    }
}

module.exports = { TeamMemberRoleRating };