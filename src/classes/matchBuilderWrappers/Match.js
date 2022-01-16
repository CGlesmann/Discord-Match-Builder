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
            moveTeamMemberPromises.push(team.moveTeamMembersToOrigionalChannels());
        });
        await Promise.all(moveTeamMemberPromises);

        this.teams.forEach((team) => { team.deleteTeamVoiceChat(); });
        this.parentCategoryChannel.delete();
    }
}

module.exports = { Match };