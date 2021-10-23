const { bold, italic } = require('@discordjs/builders');

async function run(playersToUse, gameConfig)
{
    const rawServerResponse = await require("../modules/salesforceDataReader.js").getAllTeamBuildingData(playersToUse.toString());

    const availablePlayerMemberData = rawServerResponse.availableTeamMembers;
    const baseAIObject = rawServerResponse.AIData;
    const processConfig = JSON.parse(JSON.stringify(rawServerResponse.processConfig));

    if (!availablePlayerMemberData || availablePlayerMemberData.length === 0)
    {
        return [
            {
                name: "Error",
                value: "Could not retrieve data from the server"
            }
        ];
    }

    let allAvailableTeamMembers = constructAvailableTeamMemberData(playersToUse, availablePlayerMemberData, gameConfig["aiCount"], baseAIObject);

    let finalTeamRosters = constructBaseTeamRosterObject();
    executeInitialPlacings(allAvailableTeamMembers, finalTeamRosters);
    executeTeamBalance(allAvailableTeamMembers, finalTeamRosters, processConfig);

    return finalTeamRosters;
}

function executeInitialPlacings(allAvailableTeamMembers, finalTeamRosters)
{
    while (allAvailableTeamMembers.length > 0)
    {
        let targetIndex = Math.floor(Math.random() * allAvailableTeamMembers.length);
        let targetPlayer = allAvailableTeamMembers[targetIndex];

        targetPlayer.selectedRace = targetPlayer.getPrimaryRaceIndex();
        finalTeamRosters.addTeamMember(targetPlayer, finalTeamRosters.getWeakestTeamIndex(true));

        allAvailableTeamMembers.splice(targetIndex, 1);
    }
}

function executeTeamBalance(allAvailableTeamMembers, finalTeamRosters, processConfig)
{
    let balanceThreshold = Number(processConfig.differenceThreshold);
    if (finalTeamRosters.getBalanceThreshold() <= balanceThreshold)
    {
        console.log("Skipping Balance as initial placements are already balanced");
        return;
    }

    let membersThatCanBeBalanced;
    do
    {
        let strongestTeamIndex = finalTeamRosters.getStrongestTeamIndex(false);
        membersThatCanBeBalanced = getMembersThatCanBeBalanced(finalTeamRosters, strongestTeamIndex);

        if (membersThatCanBeBalanced.length === 0)
        {
            console.log("Could not balance teams");
            break;
        }

        targetPlayerIndex = Math.round(Math.random() * (membersThatCanBeBalanced.length - 1));
        targetPlayer = membersThatCanBeBalanced[targetPlayerIndex];

        let targetRaceIndex = targetPlayer.getNextLowestRace()

        console.log(`Setting ${targetPlayer.name} from ${targetPlayer.raceRatings[targetPlayer.selectedRace].race} to ${targetPlayer.raceRatings[targetRaceIndex].race}`);
        targetPlayer.selectedRace = targetRaceIndex;
    }
    while (membersThatCanBeBalanced.length > 0 && finalTeamRosters.getBalanceThreshold() > balanceThreshold);
}

function getMembersThatCanBeBalanced(finalTeamRosters, teamIndex)
{
    let membersThatCanBeBalanced = [];
    let targetTeam = finalTeamRosters.finalTeams[teamIndex].teamMembers;

    for (let teamMember of targetTeam)
    {
        if (teamMember.selectedRace === teamMember.getNextLowestRace())
        {
            continue;
        }

        membersThatCanBeBalanced.push(teamMember);
    }

    return membersThatCanBeBalanced;
}

function constructAvailableTeamMemberData(playersToUse, availablePlayerMemberData, amountOfAIPlayers, baseAIObject)
{
    let allTeamMembers = [];

    for (let player of availablePlayerMemberData)
    {
        if (playersToUse.includes(player.name))
        {
            let newPlayerObject = { ...player };
            addStateTrackingMemberProperties(newPlayerObject)

            allTeamMembers.push(newPlayerObject);
        }
    }

    for (let i = 0; i < amountOfAIPlayers; i++)
    {
        let newAIObject = { ...baseAIObject };
        addStateTrackingMemberProperties(newAIObject);

        allTeamMembers.push(newAIObject);
    }

    return allTeamMembers;
}

function addStateTrackingMemberProperties(targetMember)
{
    targetMember["selectedRace"] = -1;
    targetMember["displayPlayer"] = function ()
    {
        let nameString = `${this.name} - `;
        let raceString = `${this.raceRatings[this.selectedRace].race}`;

        return nameString + (this.getPrimaryRaceIndex() !== this.selectedRace ? bold(italic(raceString)) : raceString);
    };
    targetMember["getPrimaryRaceIndex"] = function ()
    {
        for (let raceIndex in this.raceRatings)
        {
            if (this.raceRatings[raceIndex].race == this.primaryRace)
            {
                return raceIndex;
            }
        }
    };
    targetMember["getNextLowestRace"] = function ()
    {
        let currentSelectedRaceScore = this.raceRatings[this.selectedRace].value;
        let newLowestRaceIndex = this.selectedRace;
        let nextLowestRaceDifference = Infinity;

        for (let raceKey in this.raceRatings)
        {
            if (raceKey === this.selectedRace)
            {
                continue;
            }

            let scoreToCheck = this.raceRatings[raceKey].value;
            if (scoreToCheck <= currentSelectedRaceScore)
            {
                let difference = Math.abs(scoreToCheck - currentSelectedRaceScore);
                if (difference < nextLowestRaceDifference)
                {
                    newLowestRaceIndex = raceKey;
                    nextLowestRaceDifference = difference;
                }
            }
        }

        return newLowestRaceIndex;
    }
}

function constructBaseTeamRosterObject()
{
    let teamRoster = {
        finalTeams: [],
        getStrongestTeamIndex: function (skipFullTeams)
        {
            let strongestScore = -Infinity;
            let strongestTeamIndex = -1;

            for (let i = 0; i < this.finalTeams.length; i++)
            {
                if (skipFullTeams && this.isTeamFull(i))
                {
                    continue;
                }

                let targetTeamArray = this.finalTeams[i].teamMembers;
                if (targetTeamArray.length === 0)
                {
                    if (strongestScore < 0)
                    {
                        strongestScore = 0;
                        strongestTeamIndex = i;
                    }

                    continue;
                }

                let currentScore = targetTeamArray.reduce((accumulator, currentValue) => accumulator + currentValue.raceRatings[currentValue.selectedRace].value, 0);
                if (currentScore > strongestScore)
                {
                    strongestScore = currentScore;
                    strongestTeamIndex = i;
                }
            }

            return strongestTeamIndex;
        },
        getWeakestTeamIndex: function (skipFullTeams)
        {
            let weakestScore = Infinity;
            let weakestTeamIndex = -1;

            for (let i = 0; i < this.finalTeams.length; i++)
            {
                if (skipFullTeams && this.isTeamFull(i))
                {
                    continue;
                }

                let targetTeamArray = this.finalTeams[i].teamMembers;
                if (targetTeamArray.length === 0)
                {
                    if (weakestScore > 0)
                    {
                        weakestScore = 0;
                        weakestTeamIndex = i;
                    }

                    continue;
                }

                let currentScore = targetTeamArray.reduce((accumulator, currentValue) => accumulator + currentValue.raceRatings[currentValue.selectedRace].value, 0);
                if (currentScore < weakestScore)
                {
                    weakestScore = currentScore;
                    weakestTeamIndex = i;
                }
            }

            return weakestTeamIndex;
        },
        isTeamFull: function (teamIndex)
        {
            return (this.finalTeams[teamIndex].teamSize === this.finalTeams[teamIndex].teamMembers.length);
        },
        getBalanceThreshold: function ()
        {
            let differences = [];
            for (let team of this.finalTeams)
            {
                let teamArray = team.teamMembers;
                differences.push(teamArray.reduce((accumulator, currentValue) => accumulator + currentValue.raceRatings[currentValue.selectedRace].value, 0));
            }

            return Math.abs(differences[0] - differences[1]);
        },
        addTeamMember: function (newTeamMember, teamIndex)
        {
            this.finalTeams[teamIndex].teamMembers.push(newTeamMember);
        },
        getDisplayObjects: function ()
        {
            let allDisplayObjects = [];

            for (let teamArray in this.finalTeams)
            {
                let newDisplayObject = { title: `Team ${Number(teamArray) + 1} (${this.finalTeams[teamArray].teamMembers.reduce((accumulator, currentValue) => accumulator + currentValue.raceRatings[currentValue.selectedRace].value, 0)})`, description: '', inline: true };
                for (let teamMember of this.finalTeams[teamArray].teamMembers)
                {
                    newDisplayObject.description += `${teamMember.displayPlayer()}\n`;
                }

                allDisplayObjects.push(newDisplayObject);
            }

            return allDisplayObjects;
        }
    };

    // TODO: Replace the hard coded two with a game config level MAX_TEAM variable
    for (let i = 0; i < 2; i++)
    {
        teamRoster.finalTeams.push({
            teamSize: 4,
            teamMembers: []
        });
    }

    return teamRoster;
}

module.exports = { run };