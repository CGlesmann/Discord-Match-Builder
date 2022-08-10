const { Team } = require("../classes/matchBuilderWrappers/Team");
const { TeamMember } = require("../classes/matchBuilderWrappers/TeamMember");
const { TeamMemberRoleRating } = require("../classes/matchBuilderWrappers/TeamMemberRoleRating");
const { Match } = require("../classes/matchBuilderWrappers/Match");

const { getAllTeamBuildingData } = require("../interfaces/databaseInterface.js");
const { getGroupModifierMap } = require("./teamHistoryModifierBuilder");

class MatchTeamGenerator
{
    groupKeyToGroupModifier;
    currentTeamInbalanceMods;

    config;

    // CONSTRUCTOR

    constructor()
    {
        this.initializeConfig();
    }

    async run(targetPlayerIds, targetGameData)
    {
        console.log("---------------Starting Team Generation---------------");
        console.log(`Retrieving Server Data (targetPlayerIds: ${targetPlayerIds.toString()}, targetGameId: ${targetGameData.gameId})`);

        const [teamBuildingData, groupModifierResponse] = await Promise.all([
            getAllTeamBuildingData(targetPlayerIds.toString(), targetGameData.gameId),
            getGroupModifierMap()
        ]);

        this.groupKeyToGroupModifier = groupModifierResponse;
        const availableTeamMembers = teamBuildingData.availableTeamMembers;

        if (!availableTeamMembers || !availableTeamMembers.length)
        {
            let noTeamMemberServerData = `Couldn't locate any server data for the following player ids: ${targetPlayerIds.toString()}`;

            console.log(noTeamMemberServerData);
            throw { message: noTeamMemberServerData}
        }
        console.log("Server Data Retrieved\n");

        const averagePlayerScore = this.calculateAveragePlayerScore(availableTeamMembers);
        const allPermutations = this.calculateAllUniquePermutations(availableTeamMembers, targetGameData);

        const viableTeamPermutations = this.sortAndFilterPermutations(allPermutations, averagePlayerScore, 15);
        if (!viableTeamPermutations || !viableTeamPermutations.length) {
            throw { message: "Couldn't generate teams with the given parameters" };
        }

        console.log("\n---------------Building Match/Team/Team Member wrappers---------------");
        let match = this.constructMatchWrapper(targetGameData);
        let selectedTeams = this.constructMatchTeams(match, availableTeamMembers, viableTeamPermutations);

        while (!this.executeMatchBalance(selectedTeams, teamBuildingData.availableAIData)) {
            selectedTeams = this.constructMatchTeams(match, availableTeamMembers, viableTeamPermutations);
        }

        return match;
    }

    // CONFIG METHODS

    initializeConfig()
    {   
        this.config = { isAIEnabled: true };
    }

    toggleIsAIEnabled(isAIEnabled)
    {
        this.config.isAIEnabled = isAIEnabled;
    }

    // GENERATION METHODS

    calculateAveragePlayerScore(availableTeamMembers)
    {
        console.log("---------------Calculating average player score---------------");

        let averagePlayerScore = 0;
        for(let teamMember of availableTeamMembers)
        {
            averagePlayerScore += teamMember.roleRatings.reduce((sum, curr) => sum += curr.value, 0);
        }

        // TODO: Dynamically fetch team count here instead of 2
        averagePlayerScore /= 2;

        console.log(`Average player score calculated: ${averagePlayerScore}\n`);
        return averagePlayerScore;
    }

    calculateAllUniquePermutations(availableTeamMembers, targetGameData)
    {
        console.log("---------------Calculating all unique team placements---------------");
        let playerCount = availableTeamMembers.length;

        let minTeamCount = targetGameData.gameTeamConfigs.reduce((sum, curr) => sum += curr.isTeamRequired ? 1 : 0, 0);
        let maxTeamCount = targetGameData.gameTeamConfigs.length;

        // let minTeamPlayerCount = targetGameData.gameTeamConfigs[0].minTeamSize;
        let maxTeamPlayerCount = targetGameData.gameTeamConfigs[0].maxTeamSize;

        let value1 = Math.ceil(playerCount / maxTeamPlayerCount).clamp(minTeamCount, maxTeamCount);
        let minPermutationBounds = Math.floor(playerCount / value1);
        let maxPermutationBounds = Math.ceil(playerCount / value1);

        let allPermutations = [];
        for(let i = minPermutationBounds; i <= maxPermutationBounds; i++)
        {
            allPermutations.push(...availableTeamMembers.permutate(i, true));
        }

        console.log(`Finished Calculating team placements, found ${allPermutations.length} combonations\n`);
        return allPermutations;
    }

    sortAndFilterPermutations(allPermutations, averagePlayerScore, permutationCount)
    {
        console.log("---------------Filtering Team Permutations---------------");
        console.log(`Beginning team placement filtering, targeting ${permutationCount} team combinations with a threshold of ${1000}`);

        let filteredTeamPermutations = allPermutations.filter((permutation) => {
            let valDiff = this.calculateTeamAverageScoreDifference(permutation, averagePlayerScore);
            let pass = (valDiff <= 1000);

            if (true) {
                console.log(`Team Combo ${permutation.map((player) => player.name).join("-")} passed filtering (${valDiff})`);
            }

            return true;
        });

        if (!filteredTeamPermutations.length)
        {
            console.log(`No Team Permutations passed the filter threshold (${1000})`);
            return [];
        }

        let orderedTeamPermutations = filteredTeamPermutations.sort((a, b) => {
            let aDiff = this.calculateTeamAverageScoreDifference(a, averagePlayerScore);
            let bDiff = this.calculateTeamAverageScoreDifference(b, averagePlayerScore);

            return aDiff - bDiff;
        });

        console.log("\n---------------Final Team Permutations from filtering---------------");

        let finalTeamPermutations = orderedTeamPermutations.slice(0, permutationCount);
        for(let finalTeamPermutation of finalTeamPermutations) {
            console.log(`${finalTeamPermutation.map((player) => player.name).join("-")}`);
        }

        return finalTeamPermutations;
    }

    calculateTeamAverageScoreDifference(teamArray, averagePlayerScore)
    {
        let totalTeamScore = 0, teamKeyArray = [];

        // Accumlate all team member's average scores
        for(let teamMember of teamArray)
        {
            totalTeamScore += teamMember.roleRatings.reduce((sum, curr) => sum += curr.value, 0);
            teamKeyArray.push(teamMember.name);
        }

        // Add Group Historical Modifier
        let teamKey = teamKeyArray.sort().join("-");
        let groupHistoricalModifier = this.groupKeyToGroupModifier.get(teamKey)?.groupScore ?? 0;

        return Math.abs((totalTeamScore + groupHistoricalModifier) - averagePlayerScore);
    }

    constructMatchWrapper(targetGameData)
    {
        let match = new Match(targetGameData.gameTeamConfigs.length);
        match.game = targetGameData;

        return match;
    }

    constructMatchTeams(match, availableTeamMembers, viableTeamPermutations)
    {
        let initialTeamPermutation = viableTeamPermutations[Math.floor(Math.random() * (viableTeamPermutations.length - 1))];
        let secondaryTeamPermutation = [];

        for(let availableTeamMember of availableTeamMembers)
        {
            let isAlreadySelected = false;
            for(let selectedTeamMember of initialTeamPermutation)
            {
                if (availableTeamMember === selectedTeamMember)
                {
                    isAlreadySelected = true;
                    break;
                }
            }

            if (!isAlreadySelected)
            {
                secondaryTeamPermutation.push(availableTeamMember);
            }
        }

        console.log("Initial Team Placements Selected...");
        console.log(`${match.game.gameTeamConfigs[0].teamName}: ${initialTeamPermutation.map((teamMember) => teamMember.name).join(", ")}`);
        console.log(`${match.game.gameTeamConfigs[1].teamName}: ${secondaryTeamPermutation.map((teamMember) => teamMember.name).join(", ")}`);
        console.log();

        return [
            this.constructTeamWrappers(match, match.game.gameTeamConfigs[0], initialTeamPermutation),
            this.constructTeamWrappers(match, match.game.gameTeamConfigs[1], secondaryTeamPermutation)
        ];
    }

    constructTeamWrappers(match, teamConfig, teamMembers)
    {
        let teamWrapper = new Team(match, teamConfig);
        match.addTeam(teamWrapper);

        for(let teamMember of this.constructTeamMemberWrappers(teamMembers))
        {
            teamWrapper.addNewTeamMember(teamMember);
        }

        return teamWrapper;
    }

    constructTeamMemberWrappers(availableTeamMembers)
    {
        let teamMemberWrappers = [];
        for (let playerData of availableTeamMembers)
        {
            let teamMemberRatings = [];
            let primaryRoleIndex = -1, currentIndex = 0;
            for (let roleRating of playerData.roleRatings)
            {
                if (roleRating.isPrimary)
                {
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

            teamMemberWrappers.push(new TeamMember(
                playerData.name,
                playerData.discordNameTag,
                primaryRoleIndex,
                teamMemberRatings
            ));
        }

        return teamMemberWrappers;
    }

    executeMatchBalance(selectedTeams, availableAIDifficulties)
    {
        console.log("\n---------------Starting Match Balancing---------------");

        const TARGET_BALANCE_FACTOR = 50;

        // Determines the amount of variancy in the balance picks
        // As the loop goes on the number forces more precise (but less random) picks
        let accuracyCounter = 0; 
        
        this.currentTeamInbalanceMods = this.getAllTeamCountInbalanceModifiers(selectedTeams);
        while(!this.isMatchInBalanceThreshold(selectedTeams, TARGET_BALANCE_FACTOR)) 
        {
            let balanceFunctions = [];
            let currentTeamScores = selectedTeams.map((team, teamIndex) => this.calculateAdjustedTeamScore(team, this.currentTeamInbalanceMods[teamIndex]));

            balanceFunctions.push(...this.buildAllTeamMemberRoleChangeBalanceFunctions(selectedTeams, currentTeamScores));
            if (availableAIDifficulties && this.config.isAIEnabled)
            {
                balanceFunctions.push(...this.buildAllAIAdditionBalanceFunctions(selectedTeams, currentTeamScores, availableAIDifficulties));
            }

            console.log(`Found ${balanceFunctions.length} Balance Functions`);

            let sortedBalanceFunctions = balanceFunctions.sort((a, b) => a.avgDiffChange - b.avgDiffChange);
            let variancyCeilIndex = Math.ceil((sortedBalanceFunctions.length - 1) * (1 - accuracyCounter));
            let targetBalanceFunctionIndex = Math.floor(Math.random() * variancyCeilIndex);
            let targetBalanceFunction = sortedBalanceFunctions[targetBalanceFunctionIndex];

            if (!targetBalanceFunction) 
            {
                console.log("Couldn't find balance function", sortedBalanceFunctions, targetBalanceFunctionIndex); 
                return false; 
            }

            try
            {
                targetBalanceFunction.execute();

                if (this.isMatchInBalanceThreshold(selectedTeams, TARGET_BALANCE_FACTOR)) {
                    console.log('\n---------------Final Results---------------');

                    let selectedTeamIndex = 0;
                    for(let selectedTeam of selectedTeams)
                    {
                        let teamAdjustedScore = this.calculateAdjustedTeamScore(selectedTeam, this.currentTeamInbalanceMods[selectedTeamIndex++]);
                        let teamMemberNames = selectedTeam.teamMembers.map((teamMember) => teamMember.teamMemberName).join(", ");

                        selectedTeam.setAdjustedTeamRating(teamAdjustedScore);
                        console.log(`${selectedTeam.teamName} (${teamAdjustedScore}): ${teamMemberNames}`);
                    }
                }
            }
            catch(e)
            {
                console.log(e);
                return false;
            }

            // Increase accuracy by 1% every loop
            accuracyCounter = (accuracyCounter + 0.01).clamp(0, 1);
            console.log(); 
        }

        return true;
    }

    isMatchInBalanceThreshold(selectedTeams, balanceThreshold)
    {
        let diff = this.calculateAllTeamsAverageDifference(selectedTeams);
        return (diff <= balanceThreshold);
    }

    calculateAdjustedTeamScore(team, teamInbalanceModifier)
    {
        let teamHistoryKey = team.teamMembers.map((teamMember) => teamMember.teamMemberName).sort().join('-');

        let teamHistoryMod = this.groupKeyToGroupModifier.get(teamHistoryKey);
        teamHistoryMod = teamHistoryMod?.groupScore || 0;

        return Math.floor((team.teamRating * teamInbalanceModifier) + teamHistoryMod);
    }

    getAllTeamCountInbalanceModifiers(selectedTeams)
    {
        console.log("Getting Team Inbalance Modifiers");

        let mods = [];
        for(let i = 0; i < selectedTeams.length; i++)
        {
            let targetTeamPlayerCount = selectedTeams[i].teamMembers.length;
            let avgMod = 0;

            for(let j = 0; j < selectedTeams.length; j++)
            {
                if (j === i) { continue; }

                let compareTeamPlayerCount = selectedTeams[j].teamMembers.length;
                if (targetTeamPlayerCount < compareTeamPlayerCount)
                {
                    avgMod += 1;
                    continue;
                }

                avgMod += selectedTeams[i].teamMembers.length / selectedTeams[j].teamMembers.length;
            }

            avgMod /= (selectedTeams.length - 1);
            mods.push(avgMod);
        }

        console.log(`New Team Inbalance Modifiers: ${mods.toString()}`);
        return mods;
    }

    buildAllTeamMemberRoleChangeBalanceFunctions(selectedTeams, currentTeamScores)
    {
        let balanceFunctions = [];

        for(let i = 0; i < selectedTeams.length; i++)
        {
            for(let teamMember of selectedTeams[i].teamMembers)
            {
                let selectedRoleRating = teamMember.getSelectedRoleRating();
                for(let j = 0; j < teamMember.memberRoleRatings.length; j++)
                {
                    if (j === teamMember.selectedMemberRoleIndex) {  continue; }

                    let teamMemberRoleRating = teamMember.memberRoleRatings[j];
                    let avgDiffChange = this.calculateAverageTeamDifference(
                        currentTeamScores[i] + (teamMemberRoleRating.roleRating - selectedRoleRating), 
                        currentTeamScores.filter((element, index) => index !== i)
                    );

                    balanceFunctions.push({
                        avgDiffChange: avgDiffChange,
                        execute: () => {
                            teamMember.updateTeamMemberRole(j);
                        }
                    });
                }
            }   
        }

        return balanceFunctions;
    }

    buildAllAIAdditionBalanceFunctions(selectedTeams, currentTeamScores, availableAIDifficulties)
    {
        let totalPlayerCount = selectedTeams.reduce((sum, curr) => sum += curr.teamMembers.length, 0);
        let balanceFunctions = [];
        let currentTeamIndex = 0;

        for(let selectedTeam of selectedTeams)
        {
            if (selectedTeam.isFull() || totalPlayerCount % selectedTeams.length === 0 || Math.floor(totalPlayerCount / selectedTeams.length) - selectedTeam.teamMembers.length !== 0) { continue; }

            for(let availableAIDifficulty of availableAIDifficulties)
            {
                let avgDiffChange = this.calculateAverageTeamDifference(
                    currentTeamScores[currentTeamIndex] + availableAIDifficulty.rating, 
                    currentTeamScores.filter((element, index) => index !== currentTeamIndex)
                );

                balanceFunctions.push({
                    avgDiffChange: avgDiffChange,
                    execute: () => {
                        selectedTeam.addNewTeamMember(this.buildAITeamMemberWrapper(availableAIDifficulty, availableAIDifficulties));
                        console.log(`Adding AI to ${selectedTeam.teamName}\n`);

                        this.currentTeamInbalanceMods = this.getAllTeamCountInbalanceModifiers(selectedTeams);
                    }
                });
            }

            currentTeamIndex++;
        }

        return balanceFunctions;
    }

    buildAITeamMemberWrapper(availableAIDifficulty, availableAIDifficulties)
    {
        let aiDifficultyRoles = [];
        let primaryIndex = 0;

        for(let i = 0; i < availableAIDifficulties.length; i++)
        {
            let isPrimary = (availableAIDifficulties[i].id === availableAIDifficulty.id);
            if (isPrimary) { primaryIndex = i; }

            aiDifficultyRoles.push(new TeamMemberRoleRating(
                availableAIDifficulties[i].id,
                availableAIDifficulties[i].name,
                availableAIDifficulties[i].rating,
                isPrimary
            ));
        }

        let aiTeamMemberWrapper = new TeamMember(
            "AI",
            "",  // AI Don't need a discordId
            primaryIndex,
            aiDifficultyRoles
        );

        aiTeamMemberWrapper.setAsAI()
        return aiTeamMemberWrapper;
    }

    calculateAllTeamsAverageDifference(selectedTeams)
    {
        let currentTeamScores = selectedTeams.map((team, teamIndex) => this.calculateAdjustedTeamScore(team, this.currentTeamInbalanceMods[teamIndex]));
        let diff = 0;

        for(let i = 0; i < currentTeamScores.length; i++)
        {
            diff += this.calculateAverageTeamDifference(currentTeamScores[i], currentTeamScores.filter((element, index) => index !== i));
        }

        return diff / currentTeamScores.length;
    }

    calculateAverageTeamDifference(targetTeamRating, allTeamRatings)
    {
        let averageTeamScoreDifference = 0;

        for(let i = 0; i < allTeamRatings.length; i++)
        {
            let compareTeam = allTeamRatings[i];
            averageTeamScoreDifference += targetTeamRating - compareTeam;
        }

        return Math.abs(Math.floor(averageTeamScoreDifference / allTeamRatings.length));
    }
}

module.exports = { MatchTeamGenerator }