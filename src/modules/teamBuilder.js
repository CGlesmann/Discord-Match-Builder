const { Team, TeamMember, TeamMemberRoleRating, Match } = require("./matchBuilderClasses.js");

async function run(playersToUse, targetGameData)
{
    console.log("===========Initializing Team Builder===========");
    const rawPlayerServerData = await getPlayerDataFromServer(playersToUse, targetGameData.gameId);
    if (!rawPlayerServerData || rawPlayerServerData.length === 0)
    {
        throw { message: "No Players were found on the server" };
    }

    let unsortedTeamMembers = constructTeamMembers(rawPlayerServerData);
    let match = constructMatchObject(playersToUse.length, targetGameData);

    executeInitialPlacings(unsortedTeamMembers, match);
    executeTeamBalance(match);

    console.log("\n===========Match Generation Completed===========\n")
    return match;
}

async function getPlayerDataFromServer(playersToUse, targetGameId)
{
    console.log("Fetching Player Data from Server...");

    const rawServerResponse = await require("../modules/salesforceDataReader.js").getAllTeamBuildingData(playersToUse.toString(), targetGameId);
    return rawServerResponse.availableTeamMembers;
}

function constructTeamMembers(rawPlayerServerData)
{
    console.log("Constructing Team Members from Server Data...");

    let unsortedTeamMembers = [];
    for (let playerData of rawPlayerServerData)
    {
        let teamMemberRatings = [];
        let primaryRoleIndex = -1, currentIndex = 0;
        for (let roleRating of playerData.roleRatings)
        {
            if (roleRating.isPrimary)
            {
                console.log(`Setting ${playerData.name}'s primary role to ${roleRating.role} (Index: ${currentIndex})`);
                primaryRoleIndex = currentIndex;
            }

            teamMemberRatings.push(new TeamMemberRoleRating(
                roleRating.id,
                roleRating.role,
                roleRating.value,
                roleRating.isPrimary
            ));

            currentIndex++;
        }

        unsortedTeamMembers.push(new TeamMember(
            playerData.name,
            playerData.discordNameTag,
            primaryRoleIndex,
            teamMemberRatings
        ));
    }

    return unsortedTeamMembers;
}

function constructMatchObject(playerCount, targetGameData)
{
    console.log("\nConstructing Base Match Object...");

    let match = new Match(targetGameData.gameTeamConfigs.length);
    match.game = targetGameData;

    let accumulatedMaxPlayerCount = 0;
    for (let teamConfig of targetGameData.gameTeamConfigs)
    {
        if (teamConfig.isTeamRequired || accumulatedMaxPlayerCount < playerCount)
        {
            accumulatedMaxPlayerCount += teamConfig.maxteamSize;

            console.log(`Creating '${teamConfig.teamName}' team`);
            match.addTeam(new Team(match, teamConfig));
        }
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

        console.log(`Adding ${targetMember.teamMemberName} to '${match.teams[weakestTeamIndex].teamName}' (Index: ${weakestTeamIndex})`);

        match.addTeamMember(targetMember, weakestTeamIndex);
        unsortedTeamMembers.splice(targetMemberIndex, 1);

        // Add Blank Space in Log after each player is placed
        console.log('');
    }
}

function executeTeamBalance(match)
{
    console.log("\n===========Starting Team Balance===========")

    let balanceThreshold = 50; //TODO: Replace this hard coded value with one from the server
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

        console.log(`${targetPlayer.teamMemberName}: ${targetPlayer.memberRoleRatings[targetPlayer.selectedMemberRoleIndex].roleName} -> ${targetPlayer.memberRoleRatings[targetRoleIndex].roleName}`);
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