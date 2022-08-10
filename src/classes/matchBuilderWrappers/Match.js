const { GameMap } = require('./GameMap');
const { Team } = require('./Team');

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

module.exports = { Match };