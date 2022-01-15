const { create } = require("combined-stream");
const { BaseCommand } = require("../commandStructure/baseCommand.js");

class TestCreateChannelCommand extends BaseCommand
{
    constructor()
    {
        super();

        this.COMMAND_ARGS = {}
    }

    async run(receivedCommandArgs, message, applicationCache)
    {
        const targetGuild = message.guild;

        if (!targetGuild) { return null; }

        const newCategory = await targetGuild.channels.create('Match_1 - Starcraft 2', {
            type: 'GUILD_CATEGORY'
        });

        let createChannelPromises = [];
        createChannelPromises.push(targetGuild.channels.create('Team_1', {
            type: 'GUILD_VOICE',
            parent: newCategory
        }));
        createChannelPromises.push(targetGuild.channels.create('Team_2', {
            type: 'GUILD_VOICE',
            parent: newCategory
        }));
        createChannelPromises.push(targetGuild.channels.create('Spectators', {
            type: 'GUILD_VOICE',
            parent: newCategory
        }));

        await Promise.all(createChannelPromises);
    }
}

module.exports = TestCreateChannelCommand.getExportObject();