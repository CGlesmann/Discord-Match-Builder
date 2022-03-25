const { MessageActionRow, MessageSelectMenu, MessageEmbed } = require("discord.js");
const { ApplicationCacheManager } = require("../../managers/applicationCacheManager");
const { InteractionLabelBuilder, InteractionLabelInfo } = require("../../interactions/base/InteractionLabelBuilder");

const { getAllGames } = require("../../modules/salesforceDataReader.js");

const { APPLICATION_CACHE_KEYS } = require("../../utils/Constants.js");

class SelectGameScreen
{
    message;

    allGameDataPromise;
    allGameData;

    gameIdToGameInfoMap;
    selectGameOptionWrappers;

    async getSelectGameScreenDisplay(message)
    {
        this.message = message;
        await this.constructScreenFromMessage();

        const gameSelectComponent = new MessageActionRow().addComponents(
            new MessageSelectMenu()
                .setCustomId(InteractionLabelBuilder.getInteractionLabel(new InteractionLabelInfo('SelectGame', [message.id])))
                .setPlaceholder('Select a Game')
                .addOptions(this.selectGameOptionWrappers)
        );

        const selectGameMessageEmbed = new MessageEmbed();
        selectGameMessageEmbed.setTitle('Select Game');
        selectGameMessageEmbed.setDescription(`${this.selectGameOptionWrappers.length} games were found. Please select a game in order to generate a match.`);

        return {
            embeds: [selectGameMessageEmbed],
            components: [gameSelectComponent]
        };
    }

    async constructScreenFromMessage()
    {
        await this.retrieveServerGameData();

        if (this.noGameReturned())
        {
            this.displayNoAvailableGamesMessage();
            return;
        }

        this.processGameDataServerResponse();
    }

    async retrieveServerGameData()
    {
        let requiredPlayerCount = this.message.mentions.users.size;

        this.allGameDataPromise = getAllGames(requiredPlayerCount);
        this.allGameData = await this.allGameDataPromise;
    }

    noGameReturned()
    {
        return (!this.allGameData || this.allGameData.length === 0);
    }

    displayNoAvailableGamesMessage()
    {
        const testEmbed = new MessageEmbed();
        testEmbed.setTitle('No Games');
        testEmbed.setDescription(`No games were found on the server that can be played with ${this.message.mentions.users.size} player(s)`);

        this.message.channel.send({
            embeds: [testEmbed]
        });
    }

    processGameDataServerResponse()
    {
        this.gameIdToGameInfoMap = new Map();
        this.selectGameOptionWrappers = [];

        for (let game of this.allGameData)
        {
            let playerCountString = this.getGamePlayerCountDisplayValue(game);

            this.gameIdToGameInfoMap.set(`${game.gameId}`, game);
            this.selectGameOptionWrappers.push({
                label: `${game.gameName} (${playerCountString})`,
                value: `${game.gameId}`,
                description: `${game.gameDescription}`
            });
        }

        ApplicationCacheManager.addDataToCache(
            APPLICATION_CACHE_KEYS.ALL_GAME_DATA,
            this.gameIdToGameInfoMap
        );
    }

    getGamePlayerCountDisplayValue(game)
    {
        if (Number(game.minPlayerCount) != Number(game.maxPlayerCount))
        {
            return `${game.minPlayerCount} - ${game.maxPlayerCount} Players`;
        }

        // For games that don't support a range of players, just display one number
        return `${game.maxPlayerCount} Players`;
    }
}

module.exports = { SelectGameScreen }