const { bold, italic } = require('@discordjs/builders');

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

class TeamMember
{
    teamMemberName;
    discordId;

    memberRoleRatings;
    primaryRoleIndex;
    selectedMemberRoleIndex;

    team;

    discordGuildMember; // Only Fetched when a game starts
    originalDiscordChannel;

    constructor(teamMemberName, discordId, primaryRoleIndex, memberRoleRatings)
    {
        this.teamMemberName = teamMemberName;
        this.discordId = discordId;
        this.memberRoleRatings = memberRoleRatings;

        this.primaryRoleIndex = primaryRoleIndex;
        this.selectedMemberRoleIndex = 0;

        // If there aren't any primary roles for the selected game, set the first role as the default role
        // this.selectedMemberRoleIndex = primaryRoleIndex != -1 ? primaryRoleIndex : 0;
    }

    selectDefaultTeamRole(availableTeamRoles)
    {
        if (!availableTeamRoles || availableTeamRoles.length == 0)
        {
            console.log('No available team roles were passed to selectDefaultTeamRole');
            return;
        }

        // If a player has a primary role that is available for the selected team, select that role
        if (this.hasPrimaryRole())
        {
            let primaryRoleName = this.memberRoleRatings[this.primaryRoleIndex].roleName;
            availableTeamRoles.some(teamRole => 
            {
                if (teamRole.roleName == primaryRoleName)
                {
                    this.selectedMemberRoleIndex = this.primaryRoleIndex;
                    console.log(`Setting ${this.teamMemberName}'s selected role to ${this.memberRoleRatings[this.selectedMemberRoleIndex].roleName} (Index: ${this.selectedMemberRoleIndex} - Primary Role)`);

                    return true;
                }

                return false;
            });

            if (this.selectedMemberRoleIndex != -1)
            {
                return;
            }
        }

        // If no primary role, or the primary role isn't available on the selected team, grab the first available team role
        let targetTeamRoleName = availableTeamRoles[0].roleName;
        this.memberRoleRatings.some((memberRoleRating, memberRoleRatingIndex) =>
        {
            if (memberRoleRating.roleName == targetTeamRoleName)
            {
                this.selectedMemberRoleIndex = memberRoleRatingIndex;
                console.log(`Setting ${this.teamMemberName}'s selected role to ${this.memberRoleRatings[this.selectedMemberRoleIndex].roleName} (Index: ${this.selectedMemberRoleIndex} - Team Default)`);

                return true;
            }

            return false;
        });

        if (this.selectedMemberRoleIndex == -1)
        {
            console.log(`Can't find member role for ${this.teamMemberName}`);
        }
    }

    getPlayerDisplay()
    {
        let nameString = `${this.teamMemberName}`;
        let roleString = `${this.memberRoleRatings[this.selectedMemberRoleIndex].roleName}`;

        if (this.hasPrimaryRole())
        {
            if (this.primaryRoleIndex != this.selectedMemberRoleIndex)
            {
                roleString = bold(italic(roleString));
            }
        }

        if (!this.team.match.game.areGameRolesEnabled)
        {
            return nameString;
        }

        return `${nameString} - ${roleString}`;
    }

    hasPrimaryRole()
    {
        return (this.primaryRoleIndex != -1);
    }

    getNextLowestRoleIndex()
    {
        let currentSelectedRoleScore = this.memberRoleRatings[this.selectedMemberRoleIndex].roleRating;
        let newLowestRoleIndex = this.selectedMemberRoleIndex;
        let nextLowestRaceDifference = Infinity;

        for (let roleKey in this.memberRoleRatings)
        {
            // Comparison expects selectedMemberRoleIndex to be a string rather than a number
            if (roleKey == this.selectedMemberRoleIndex) { continue; }

            let roleScore = this.memberRoleRatings[roleKey].roleRating;
            if (roleScore <= currentSelectedRoleScore)
            {
                let difference = Math.abs(roleScore - currentSelectedRoleScore);
                if (difference < nextLowestRaceDifference)
                {
                    newLowestRoleIndex = roleKey;
                    nextLowestRaceDifference = difference;
                }
            }
        }

        return newLowestRoleIndex;
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

    async moveTeamMemberToVoiceChannel(targetVoiceChannel, guild)
    {
        // Fetch the Discord Team Member
        this.discordGuildMember = await guild.members.fetch(this.discordId);

        if (this.discordGuildMember && this.discordGuildMember.voice && this.discordGuildMember.voice.channelId)
        {
            this.originalDiscordChannel = this.discordGuildMember.voice.channelId;
            this.discordGuildMember.voice.setChannel(targetVoiceChannel);
        }
    }

    async moveTeamMemberToOriginalVoiceChannel()
    {
        if (!this.originalDiscordChannel)
        {
            return null;
        }

        const originalVoiceChat = await this.discordGuildMember.guild.channels.fetch(this.originalDiscordChannel);
        return this.discordGuildMember.voice.setChannel(originalVoiceChat);
    }
}

class Team
{
    match;

    teamName;
    teamConfigId;
    minimumTeamSize;
    maximumTeamSize;
    isTeamRequired;
    availableTeamRoles;

    teamMembers;
    teamRating;

    teamDiscordVoiceChat;

    constructor(match, teamConfig)
    {
        // Server Data
        this.match = match;
        this.teamName = teamConfig.teamName;
        this.teamConfigId = teamConfig.teamConfigId;
        this.minimumTeamSize = Number(teamConfig.minTeamSize);
        this.maximumTeamSize = Number(teamConfig.maxTeamSize);
        this.isTeamRequired = teamConfig.isTeamRequired;
        this.availableTeamRoles = teamConfig.availableTeamRoles.map(teamRole =>
        {
            return {
                id: teamRole.id,
                roleName: teamRole.game_role.name
            }
        });

        // Local Data
        this.teamMembers = [];
        this.teamRating = 0;
    }

    addNewTeamMember(newTeamMember)
    {
        if (this.teamMembers && this.teamMembers.length >= this.maximumTeamSize) { throw { message: `Team ${this.teamName} is full` } }
        if (!newTeamMember instanceof TeamMember) { throw { message: "Can't add non Team Member objects to a Team" }; }

        if (!this.teamMembers) { this.teamMembers = []; }
        newTeamMember.selectDefaultTeamRole(this.availableTeamRoles);

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
        let displayObject = { name: `${this.teamName} (${this.teamRating})`, value: "", inline: true };
        for (let teamMember of this.teamMembers)
        {
            displayObject.value += `${teamMember.getPlayerDisplay()}\n`;
        }

        return displayObject;
    }

    async moveTeamMembersToVoiceChat(parentCategoryChannel, guild)
    {
        this.teamDiscordVoiceChat = await this.constructTeamVoiceChat(parentCategoryChannel, guild);
        this.teamMembers.forEach(teamMember =>
        {
            console.log(`Moving ${teamMember.teamMemberName} to ${this.teamDiscordVoiceChat.name}`);
            teamMember.moveTeamMemberToVoiceChannel(this.teamDiscordVoiceChat, guild);
        });
    }

    async constructTeamVoiceChat(parentCategoryChannel, guild)
    {
        return guild.channels.create(`${this.teamName}`, {
            type: 'GUILD_VOICE',
            parent: parentCategoryChannel
        });
    }

    deleteTeamVoiceChat()
    {
        if (this.teamDiscordVoiceChat)
        {
            this.teamDiscordVoiceChat.delete();
        }
    }

    async moveTeamMembersToOriginalChannels()
    {
        let allTeamMemberMovePromises = [];
        this.teamMembers.forEach(teamMember =>
        {
            console.log(`Moving ${teamMember.teamMemberName} to ${this.teamDiscordVoiceChat.name}`);
            allTeamMemberMovePromises.push(teamMember.moveTeamMemberToOriginalVoiceChannel());
        });

        return Promise.all(allTeamMemberMovePromises);
    }
}

class GameMap
{
    id;
    mapName;
    playerCount;

    constructor(id, mapName, playerCount)
    {
        this.id = id;
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

    parentCategoryChannel;

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

    async startMatch(guild)
    {
        this.parentCategoryChannel = await guild.channels.create(`${this.game.gameName} Match`, { type: 'GUILD_CATEGORY' });
        this.teams.forEach((team) =>
        {
            team.moveTeamMembersToVoiceChat(this.parentCategoryChannel, guild);
        });
    }

    async endMatch()
    {
        let moveTeamMemberPromises = [];
        this.teams.forEach((team) =>
        {
            moveTeamMemberPromises.push(team.moveTeamMembersToOriginalChannels());
        });
        await Promise.all(moveTeamMemberPromises);

        this.teams.forEach((team) => { team.deleteTeamVoiceChat(); });
        this.parentCategoryChannel.delete();
    }
}

module.exports = { TeamMemberRoleRating, TeamMember, Team, GameMap, Match };