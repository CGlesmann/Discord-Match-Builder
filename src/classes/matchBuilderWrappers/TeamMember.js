const { bold, italic } = require('@discordjs/builders');

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

    getAveragePlayerRoleScore()
    {
        if (!this.memberRoleRatings || !this.memberRoleRatings.length) { return 0; }

        return this.memberRoleRatings.reduce((sum, curr) => sum += curr.roleRating, 0);
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
        console.log(`${this.teamMemberName}: ${this.memberRoleRatings[this.selectedMemberRoleIndex].roleName} -> ${this.memberRoleRatings[newRoleIndex].roleName}`);

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
        if (!this.originalDiscordChannel || !this.discordGuildMember.voice)
        {
            return null;
        }

        const originalVoiceChat = await this.discordGuildMember.guild.channels.fetch(this.originalDiscordChannel);
        return this.discordGuildMember.voice.setChannel(originalVoiceChat);
    }
}

module.exports = { TeamMember };