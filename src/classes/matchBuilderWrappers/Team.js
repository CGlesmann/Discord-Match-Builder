const { TeamMember } = require('./TeamMember');

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

    adjustedTeamRating; // Base Team Rating adjusted with History Mod + Offset Mod
    teamRating; // Team Member Rating total

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
        let displayObject = { name: `${this.teamName} (${this.adjustedTeamRating})`, value: "", inline: true };
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

    setAdjustedTeamRating(adjustedTeamRating)
    {
        this.adjustedTeamRating = adjustedTeamRating;
    }
}

module.exports = { Team };