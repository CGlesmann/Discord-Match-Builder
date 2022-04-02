const { Team } = require("../classes/matchBuilderWrappers/Team");
const { TeamMember } = require("../classes/matchBuilderWrappers/TeamMember");
const { TeamMemberRoleRating } = require("../classes/matchBuilderWrappers/TeamMemberRoleRating");
const { Match } = require("../classes/matchBuilderWrappers/Match");

const { getAllTeamBuildingData, getAllGames } = require("../interfaces/databaseInterface.js");
const { getGroupModifierMap } = require("./teamHistoryModifierBuilder");

class MatchTeamGenerator
{
    async run(targetPlayerIds, targetGameData)
    {
        const [playerData, groupKeyToGroupModifier] = await Promise.all([
            getAllTeamBuildingData(targetPlayerIds.toString(), targetGameData.gameId),
            getGroupModifierMap()
        ]);

        const availableTeamMembers = playerData.availableTeamMembers;

        const averagePlayerScore = this.calculateAveragePlayerScore(availableTeamMembers);
        const allPermutations = this.calculateAllUniquePermutations(availableTeamMembers, targetGameData);

        const viableTeamPermutations = this.sortAndFilterPermutations(allPermutations, averagePlayerScore, groupKeyToGroupModifier, 15);

        let match = this.constructMatchWrapper(targetGameData);
        let selectedTeams = this.constructMatchTeams(match, availableTeamMembers, viableTeamPermutations);

        this.executeMatchBalance(selectedTeams);
        return match;
    }

    calculateAveragePlayerScore(availableTeamMembers)
    {
        let averagePlayerScore = 0;
        for(let teamMember of availableTeamMembers)
        {
            averagePlayerScore += teamMember.roleRatings.reduce((sum, curr) => sum += curr.value, 0);
        }

        // TODO: Dynamically fetch team count here instead of 2
        return averagePlayerScore / 2;
    }

    calculateAllUniquePermutations(availableTeamMembers, targetGameData)
    {
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

        return allPermutations;
    }

    sortAndFilterPermutations(allPermutations, averagePlayerScore, groupKeyToGroupModifier, permutationCount)
    {
        const orderedTeamPermutations = allPermutations.filter((value) => {
            let valDiff = this.calculateTeamAverageScoreDifference(value, averagePlayerScore, groupKeyToGroupModifier);
            return valDiff <= 200;
        }).sort((a, b) => {
            let aDiff = this.calculateTeamAverageScoreDifference(a, averagePlayerScore, groupKeyToGroupModifier);
            let bDiff = this.calculateTeamAverageScoreDifference(b, averagePlayerScore, groupKeyToGroupModifier);

            return aDiff - bDiff;
        });

        return orderedTeamPermutations.slice(0, permutationCount);
    }

    calculateTeamAverageScoreDifference(teamArray, averagePlayerScore, groupKeyToGroupModifier)
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
        let groupHistoricalModifier = groupKeyToGroupModifier.get(teamKey)?.groupScore ?? 0;

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

    executeMatchBalance(selectedTeams)
    {
        const TARGET_BALANCE_FACTOR = 50;
        let accuracyCounter = 0; // Determines the amount of variancy in the balance picks, as the loop goes on the number forces more precise (but less random) picks

        while(this.calculateAllTeamsAverageDifference(selectedTeams) > TARGET_BALANCE_FACTOR) 
        {
            let balanceFunctions = [];
            let currentTeamScores = selectedTeams.map((team) => team.teamRating);

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
                            teamMemberRef: teamMember,
                            targetRoleIndex: j
                        });
                    }
                }   
            }

            let sortedBalanceFunctions = balanceFunctions.sort((a, b) => a.avgDiffChange - b.avgDiffChange);
            let variancyCeilIndex = Math.ceil((sortedBalanceFunctions.length - 1) * (1 - accuracyCounter));
            let targetBalanceFunction = sortedBalanceFunctions[Math.floor(Math.random() * variancyCeilIndex)];

            targetBalanceFunction.teamMemberRef.updateTeamMemberRole(targetBalanceFunction.targetRoleIndex);
            accuracyCounter += 0.01.clamp(0, 1); // Increase accuracy by 1% every loop
        }
    }

    calculateAllTeamsAverageDifference(selectedTeams)
    {
        let currentTeamScores = selectedTeams.map((team) => team.teamRating);
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