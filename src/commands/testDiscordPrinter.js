const { BaseCommand } = require("../commandStructure/baseCommand.js");
const { MessageEmbed, MessageActionRow, MessageSelectMenu } = require("discord.js");

class TestDiscordPrintCommand extends BaseCommand
{
    constructor()
    {
        super();
        this.COMMAND_ARGS = {}
    }

    async run(receivedCommandArgs)
    {
        const testMultiSelectMenu = new MessageActionRow().addComponents(
            new MessageSelectMenu()
                .setCustomId('TestId')
                .setPlaceholder('Select Target Players')
                .addOptions([
                    {
                        label: 'Chris',
                        value: 'Chris'
                    },
                    {
                        label: 'Nick',
                        value: 'Nick'
                    },
                    {
                        label: 'Lance',
                        value: 'Lance'
                    },
                    {
                        label: 'Kaysia',
                        value: 'Kaysia'
                    },
                    {
                        label: 'John',
                        value: 'John'
                    },
                    {
                        label: 'Charlese',
                        value: 'Charlese'
                    },
                    {
                        label: 'Jacob',
                        value: 'Jacob'
                    },
                    {
                        label: 'Cody',
                        value: 'Cody'
                    }
                ])
                .setMinValues(2)
                .setMaxValues(8)
        );

        const testEmbed = new MessageEmbed();

        testEmbed.setTitle('Test Message');

        return {
            embeds: [testEmbed],
            components: [testMultiSelectMenu]
        };
    }
}

module.exports = TestDiscordPrintCommand.getExportObject();