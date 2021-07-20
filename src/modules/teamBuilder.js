const availablePlayerMemberData = require("../config/teamMemberConfig.json")?.availableTeamMembers;
const availableAIData = require("../config/aiConfig.json")?.availableTeamMembers;
const processConfig = require("../config/processConfig.json");

function run(playersToUse, teamRosterConfigObject, gameConfig)
{
    let allAvailableTeamMembers = constructAvailableTeamMemberData(playersToUse, gameConfig["aiCount"]);
    let configErrorMessage = checkForInvalidConfiguration(allAvailableTeamMembers, teamRosterConfigObject);

    if (configErrorMessage)
    {
        return [
            {
                name: "Error",
                value: [configErrorMessage]
            }
        ];
    }

    let finalTeamRosters = constructBaseTeamRosterObject(teamRosterConfigObject);
    executeInitialPlacings(allAvailableTeamMembers, finalTeamRosters);
    executeTeamBalance(allAvailableTeamMembers, finalTeamRosters, gameConfig);

    return finalTeamRosters.getDisplayObjects();
}

function executeInitialPlacings(allAvailableTeamMembers, finalTeamRosters)
{
    while (allAvailableTeamMembers.length > 0)
    {
        let targetIndex = Math.floor(Math.random() * allAvailableTeamMembers.length);
        let targetPlayer = allAvailableTeamMembers[targetIndex];

        targetPlayer.selectedRace = targetPlayer.primaryRace;
        finalTeamRosters.addTeamMember(targetPlayer, finalTeamRosters.getWeakestTeamIndex(true));

        allAvailableTeamMembers.splice(targetIndex, 1);
    }
}

function executeTeamBalance(allAvailableTeamMembers, finalTeamRosters, gameConfig)
{
    if (finalTeamRosters.getBalanceThreshold() <= processConfig.differenceThreshold)
    {
        console.log("Skipping Balance as initial placements are already balanced");
        return;
    }

    let membersThatCanBeBalanced;
    do
    {
        let strongestTeamIndex = finalTeamRosters.getStrongestTeamIndex(false);
        membersThatCanBeBalanced = getMembersThatCanBeBalanced(finalTeamRosters, strongestTeamIndex);

        console.log(`Available Team Members: ${membersThatCanBeBalanced.length}`);
        if (membersThatCanBeBalanced.length === 0)
        {
            console.log("Could not balance teams");
            break;
        }

        targetPlayerIndex = Math.round(Math.random() * (membersThatCanBeBalanced.length - 1));
        targetPlayer = membersThatCanBeBalanced[targetPlayerIndex];
        targetPlayer.selectedRace = targetPlayer.getNextLowestRace();
    } while (membersThatCanBeBalanced.length > 0 && finalTeamRosters.getBalanceThreshold() > processConfig.differenceThreshold);
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

function checkForInvalidConfiguration(allAvailableTeamMembers, teamRosterConfigObject)
{
    // Make sure total amount of player in configData + total selected AI Amount = total amount of players for teams
    let requiredPlayerCount = teamRosterConfigObject.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    let result = '';
    if (allAvailableTeamMembers.length > requiredPlayerCount)
    {
        result = "There aren't enough team member slots to fit every person/AI";
        console.error("There aren't enough team member slots to fit every person/AI");
    }
    else if (allAvailableTeamMembers.length < requiredPlayerCount)
    {
        result = "There aren't enough players/AIs to fill all the team member slots";
        console.error("There aren't enough players/AIs to fill all the team member slots");
    }

    return result;
}

function constructAvailableTeamMemberData(playersToUse, amountOfAIPlayers)
{
    console.log(playersToUse);
    //let allTeamMembers = [...availablePlayerMemberData];
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
        let newAIObject = { ...availableAIData[0] };
        addStateTrackingMemberProperties(newAIObject);

        allTeamMembers.push(newAIObject);
    }

    console.log(`Found ${allTeamMembers.length} available team members`);
    return allTeamMembers;
}

function addStateTrackingMemberProperties(targetMember)
{
    targetMember["selectedRace"] = "";
    targetMember["displayPlayer"] = function ()
    {
        return `${this.name} - ${this.selectedRace}`;
    };
    targetMember["getNextLowestRace"] = function ()
    {
        let currentSelectedRaceScore = this.raceRatings[this.selectedRace];
        let nextLowestRaceKey = this.selectedRace;
        let nextLowestRaceDifference = Infinity;

        for (let raceKey in this.raceRatings)
        {
            if (raceKey === this.selectedRace)
            {
                console.log(`Skipping ${raceKey} as this is the selected race`);
                continue;
            }

            let scoreToCheck = this.raceRatings[raceKey];
            if (scoreToCheck <= currentSelectedRaceScore)
            {
                let difference = Math.abs(scoreToCheck - currentSelectedRaceScore);
                if (difference < nextLowestRaceDifference)
                {
                    nextLowestRaceKey = raceKey;
                    nextLowestRaceDifference = difference;
                }
            }
        }

        return nextLowestRaceKey;
    }
}

function constructBaseTeamRosterObject(teamRosterConfig)
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

                let currentScore = targetTeamArray.reduce((accumulator, currentValue) => accumulator + currentValue.raceRatings[currentValue.primaryRace], 0);
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

                let currentScore = targetTeamArray.reduce((accumulator, currentValue) => accumulator + currentValue.raceRatings[currentValue.primaryRace], 0);
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
                differences.push(teamArray.reduce((accumulator, currentValue) => accumulator + currentValue.raceRatings[currentValue.selectedRace], 0));
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
                let newDisplayObject = { name: `Team ${Number(teamArray) + 1}`, value: [] };
                for (let teamMember of this.finalTeams[teamArray].teamMembers)
                {
                    newDisplayObject.value.push(`${teamMember.displayPlayer()}`)
                }

                allDisplayObjects.push(newDisplayObject);
            }

            return allDisplayObjects;
        }
    };

    for (let i = 0; i < teamRosterConfig.length; i++)
    {
        teamRoster.finalTeams.push({
            teamSize: teamRosterConfig[i],
            teamMembers: []
        });
    }

    return teamRoster;
}

module.exports = { run };