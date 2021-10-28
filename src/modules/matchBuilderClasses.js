const { bold, italic } = require('@discordjs/builders');

class TeamMemberRoleRating
{
    roleName;
    roleRating;
    isPrimary;

    constructor(roleName, roleRating, isPrimary)
    {
        this.roleName = roleName;
        this.roleRating = roleRating;
        this.isPrimary = isPrimary;
    }
}

class TeamMember
{
    teamMemberName;
    discordId;

    memberRoleRatings;
    primaryRole;
    selectedMemberRoleIndex;

    team;

    constructor(teamMemberName, discordId, primaryRole, memberRoleRatings)
    {
        this.teamMemberName = teamMemberName;
        this.discordId = discordId;
        this.memberRoleRatings = memberRoleRatings;
        this.primaryRole = primaryRole;

        this.selectedMemberRoleIndex = this.getPrimaryRoleIndex();
    }

    getPlayerDisplay()
    {
        let nameString = `${this.teamMemberName}`;
        let roleString = `${this.memberRoleRatings[this.selectedMemberRoleIndex].roleName}`;

        return `${nameString} - ${(this.getPrimaryRoleIndex() !== this.selectedMemberRoleIndex ? bold(italic(roleString)) : roleString)}`;
    }

    getPrimaryRoleIndex()
    {
        return this.primaryRole;
        // for (let roleIndex in this.memberRoleRatings)
        // {
        //     if (this.memberRoleRatings[roleIndex].roleName == this.primaryRole)
        //     {
        //         return roleIndex;
        //     }
        // }
    }

    getNextLowestRoleIndex()
    {
        let currentSelectedRaceScore = this.memberRoleRatings[this.selectedMemberRoleIndex].roleRating;
        let newLowestRaceIndex = this.selectedMemberRoleIndex;
        let nextLowestRaceDifference = Infinity;

        for (let roleKey in this.memberRoleRatings)
        {
            if (roleKey === this.selectedMemberRoleIndex) { continue; }

            let roleScore = this.memberRoleRatings[roleKey].roleRating;
            if (roleScore <= currentSelectedRaceScore)
            {
                let difference = Math.abs(roleScore - currentSelectedRaceScore);
                if (difference < nextLowestRaceDifference)
                {
                    newLowestRaceIndex = roleKey;
                    nextLowestRaceDifference = difference;
                }
            }
        }

        return newLowestRaceIndex;
    }

    getSelectedRoleRating()
    {
        return this.memberRoleRatings[this.selectedMemberRoleIndex].roleRating;
    }

    updateTeamMemberRole(newRoleIndex)
    {
        let currentRating = this.getSelectedRoleRating();
        this.selectedMemberRoleIndex = newRoleIndex;

        let newRating = this.getSelectedRoleRating();
        this.team.teamRating += (newRating - currentRating);
    }
}

class Team
{
    teamName;
    teamMembers;
    teamRating;

    maximumTeamSize;

    constructor(teamName, maxTeamSize)
    {
        this.teamName = teamName;
        this.maximumTeamSize = maxTeamSize;
        this.teamMembers = [];
        this.teamRating = 0;
    }

    addNewTeamMember(newTeamMember)
    {
        if (this.teamMembers && this.teamMembers.length >= this.maximumTeamSize) { throw { message: `Team ${this.teamName} is full` } }
        if (!newTeamMember instanceof TeamMember) { throw { message: "Can't add non Team Member objects to a Team" }; }

        if (!this.teamMembers) { this.teamMembers = []; }

        this.teamMembers.push(newTeamMember);
        this.teamRating += Number(newTeamMember.getSelectedRoleRating());

        newTeamMember.team = this;
    }

    isFull()
    {
        return this.teamMembers.length >= this.maximumTeamSize;
    }

    getTeamDisplay()
    {
        let displayObject = { name: `Team ${this.teamName} (${this.teamRating})`, value: "", inline: true };
        for (let teamMember of this.teamMembers)
        {
            displayObject.value += `${teamMember.getPlayerDisplay()}\n`;
        }

        return displayObject;
    }
}

class GameMap
{
    mapName;
    playerCount;

    constructor(mapName, playerCount)
    {
        this.mapName = mapName;
        this.playerCount = playerCount;
    }

    getMapDisplay()
    {
        return {
            name: `Map`,
            value: `${this.mapName}`,
            inline: false
        };
    }
}

class Match
{
    game;
    map;
    teams;
    maxTeamCount;

    constructor(maxTeamCount)
    {
        this.maxTeamCount = maxTeamCount;
        this.teams = [];
    }

    getBalanceThreshold()
    {
        return Math.abs(
            this.teams[0].teamRating - this.teams[1].teamRating
        );
    }

    getStrongestTeamIndex(skipFullTeams)
    {
        let strongestRating = -Infinity, strongestTeamIndex = -1;

        for (let i = 0; i < this.teams.length; i++)
        {
            let targetTeam = this.teams[i];

            if (skipFullTeams && targetTeam.isFull()) { continue; }
            if (targetTeam.teamRating > strongestRating)
            {
                strongestRating = targetTeam.teamRating;
                strongestTeamIndex = i;
            }
        }

        return strongestTeamIndex;
    }

    getWeakestTeamIndex(skipFullTeams)
    {
        let weakestRating = Infinity, weakestTeamIndex = -1;

        for (let i = 0; i < this.teams.length; i++)
        {
            let targetTeam = this.teams[i];

            if (skipFullTeams && targetTeam.isFull()) { continue; }
            if (targetTeam.teamRating < weakestRating)
            {
                weakestRating = targetTeam.teamRating;
                weakestTeamIndex = i;
            }
        }

        return weakestTeamIndex;
    }

    setMap(newMap)
    {
        if (!newMap instanceof GameMap)
        {
            throw { message: "Can't set a match map reference to a non MatchMap object" };
        }

        this.map = newMap;
    }

    addTeam(newTeam)
    {
        if (!newTeam instanceof Team) { throw { message: "Can't add non Team objects to a Team" }; }

        if (!this.teams) { this.teams = []; }
        this.teams.push(newTeam);
    }

    addTeamMember(newTeamMember, teamIndex)
    {
        this.teams[teamIndex].addNewTeamMember(newTeamMember);
        return;
    }

    getMatchDisplay()
    {
        let displayObjects = [];

        if (this.map)
        {
            displayObjects.push(this.map.getMapDisplay());
        }

        if (this.teams && this.teams.length > 0)
        {
            for (let team of this.teams)
            {
                displayObjects.push(team.getTeamDisplay());
            }
        }

        return displayObjects;
    }
}

module.exports = { TeamMemberRoleRating, TeamMember, Team, GameMap, Match };