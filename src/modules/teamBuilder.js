const { Team, TeamMember, TeamMemberRoleRating, Match } = require("./matchBuilderClasses.js");

async function run(playersToUse)
{
    console.log("===========Initializing Team Builder===========");
    const rawPlayerServerData = await getPlayerDataFromServer(playersToUse);
    if (!rawPlayerServerData || rawPlayerServerData.length === 0)
    {
        throw { message: "No Players were found on the server" };
    }

    let unsortedTeamMembers = constructTeamMembers(rawPlayerServerData);
    let match = constructMatchObject(4, 2); // TODO: Replace hard coded Max Team Size/Team Count with Data from Server

    executeInitialPlacings(unsortedTeamMembers, match);
    executeTeamBalance(match);

    console.log("\n===========Match Successfully Generated===========\n")
    return match;
}

async function getPlayerDataFromServer(playersToUse)
{
    console.log("Fetching Player Data from Server...");

    const rawServerResponse = await require("../modules/salesforceDataReader.js").getAllTeamBuildingData(playersToUse.toString());
    return rawServerResponse.availableTeamMembers;
}

function constructTeamMembers(rawPlayerServerData)
{
    console.log("Constructing Team Members from Server Data...");

    let unsortedTeamMembers = [];
    for (let playerData of rawPlayerServerData)
    {
        let teamMemberRatings = [];
        for (let roleRating of playerData.roleRatings)
        {
            teamMemberRatings.push(new TeamMemberRoleRating(
                roleRating.role,
                roleRating.value
            ));
        }

        unsortedTeamMembers.push(new TeamMember(
            playerData.name,
            playerData.discordNameTag,
            playerData.primaryRole,
            teamMemberRatings
        ));
    }

    return unsortedTeamMembers;
}

function constructMatchObject(maxTeamSize, maxTeamCount)
{
    console.log("Constructing Base Match Object...");

    let match = new Match(maxTeamCount);
    for (let i = 0; i < maxTeamCount; i++)
    {
        match.addTeam(new Team(
            `${i + 1}`,
            maxTeamSize
        ));
    }

    return match;
}

function executeInitialPlacings(unsortedTeamMembers, match)
{
    console.log("\n===========Starting Initial Placements===========");
    while (unsortedTeamMembers.length > 0)
    {
        let targetMemberIndex = Math.floor(Math.random() * unsortedTeamMembers.length);
        let targetMember = unsortedTeamMembers[targetMemberIndex];
        let weakestTeamIndex = match.getWeakestTeamIndex(true);

        console.log(`Adding ${targetMember.teamMemberName} to Team ${weakestTeamIndex}`);

        match.addTeamMember(targetMember, weakestTeamIndex);
        unsortedTeamMembers.splice(targetMemberIndex, 1);
    }
}

function executeTeamBalance(match)
{
    console.log("\n===========Starting Team Balance===========")

    let balanceThreshold = 200; //TODO: Replace this hard coded value with one from the server
    if (match.getBalanceThreshold() <= balanceThreshold)
    {
        console.log("Skipping Balance as initial placements are already balanced");
        return;
    }

    let membersThatCanBeBalanced;
    do
    {
        let strongestTeamIndex = match.getStrongestTeamIndex(false);
        membersThatCanBeBalanced = getMembersThatCanBeBalanced(match, strongestTeamIndex);

        if (membersThatCanBeBalanced.length === 0)
        {
            console.log("Could not balance teams");
            break;
        }

        targetPlayerIndex = Math.round(Math.random() * (membersThatCanBeBalanced.length - 1));
        targetPlayer = membersThatCanBeBalanced[targetPlayerIndex];

        let targetRoleIndex = targetPlayer.getNextLowestRoleIndex()

        console.log(`Setting ${targetPlayer.teamMemberName} from ${targetPlayer.memberRoleRatings[targetPlayer.selectedMemberRoleIndex].roleName} to ${targetPlayer.memberRoleRatings[targetRoleIndex].roleName}`);
        targetPlayer.updateTeamMemberRole(targetRoleIndex);
    }
    while (membersThatCanBeBalanced.length > 0 && match.getBalanceThreshold() > balanceThreshold);
}

function getMembersThatCanBeBalanced(match, teamIndex)
{
    let membersThatCanBeBalanced = [];
    let targetTeam = match.teams[teamIndex].teamMembers;

    for (let teamMember of targetTeam)
    {
        if (teamMember.selectedMemberRoleIndex === teamMember.getNextLowestRoleIndex()) { continue; }
        membersThatCanBeBalanced.push(teamMember);
    }

    return membersThatCanBeBalanced;
}

module.exports = { run };