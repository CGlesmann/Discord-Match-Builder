async function run(playersToUse, teamRosterConfigObject, gameConfig)
{
    const rawServerResponse = await require("../modules/salesforceDataReader.js").getAllPlayerData();
    console.log(rawServerResponse);

    const availablePlayerMemberData = rawServerResponse.availableTeamMembers;
    const baseAIObject = rawServerResponse.AIData;
    const processConfig = rawServerResponse.processConfig;

    if (!availablePlayerMemberData)
    {
        return [
            {
                name: "Error",
                value: "Could not retrieve data from the server"
            }
        ];
    }

    let allAvailableTeamMembers = constructAvailableTeamMemberData(playersToUse, availablePlayerMemberData, gameConfig["aiCount"], baseAIObject);
    let configErrorMessage = checkForInvalidConfiguration(allAvailableTeamMembers, teamRosterConfigObject, processConfig);

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
    executeTeamBalance(allAvailableTeamMembers, finalTeamRosters, processConfig);

    return finalTeamRosters.getDisplayObjects();
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
    console.log(`balanceThreshold: ${balanceThreshold}`);
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

        console.log(`Available Team Members: ${membersThatCanBeBalanced.length}`);
        if (membersThatCanBeBalanced.length === 0)
        {
            console.log("Could not balance teams");
            break;
        }

        targetPlayerIndex = Math.round(Math.random() * (membersThatCanBeBalanced.length - 1));
        targetPlayer = membersThatCanBeBalanced[targetPlayerIndex];
        targetPlayer.selectedRace = targetPlayer.getNextLowestRace();
    } while (membersThatCanBeBalanced.length > 0 && finalTeamRosters.getBalanceThreshold() > balanceThreshold);
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
        return `${this.name} - ${this.raceRatings[this.selectedRace].race}`;
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
        /*
        this.raceRatings.forEach((value, index) =>
        {
            if (value.race == this.primaryRace)
            {
                return index;
            }
        })
        */
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
                console.log(`Skipping ${raceKey} as this is the selected race`);
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

                let currentScore = targetTeamArray.reduce((accumulator, currentValue) => accumulator + currentValue.raceRatings[currentValue.selectedRace].value, 0);
                console.log(`Team ${i + 1} strength: ${currentScore}`);

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

                console.log(`Team ${i + 1} strength: ${currentScore}`);
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