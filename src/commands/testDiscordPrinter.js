const { MessageEmbed, MessageActionRow, MessageSelectMenu } = require("discord.js");

const { BaseCommand } = require("../commandStructure/baseCommand.js");
const { getAllGames } = require("../modules/salesforceDataReader.js");

class TestDiscordPrintCommand extends BaseCommand
{
    constructor()
    {
        super();
        this.COMMAND_ARGS = {}
    }

    async run(receivedCommandArgs, message, applicationCache)
    {
        let allGames = await getAllGames();
        let options = [];

        let gameIdToGameInfoMap = new Map();
        for (let game of allGames)
        {
            gameIdToGameInfoMap.set(game.gameId, game);
            options.push({
                label: game.gameName,
                value: game.gameId
            });
        }
        applicationCache.set('allGames', gameIdToGameInfoMap);

        const testMultiSelectMenu = new MessageActionRow().addComponents(
            new MessageSelectMenu()
                .setCustomId('SelectGame')
                .setPlaceholder('Select a Game')
                .addOptions(options)
        );

        const testEmbed = new MessageEmbed();
        testEmbed.setTitle('Select Game');
        testEmbed.setDescription('Please select a game in order to generate a match.');

        return {
            embeds: [testEmbed],
            components: [testMultiSelectMenu]
        };
    }
}

module.exports = TestDiscordPrintCommand.getExportObject();