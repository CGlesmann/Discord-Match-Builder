const { create } = require("combined-stream");
const { BaseCommand } = require("../commandStructure/baseCommand.js");

class TestDeleteChannelCommand extends BaseCommand
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

        const allChannelsMap = await targetGuild.channels.fetch();
        const allChannelsArray = Array.from(allChannelsMap, ([channelId, channelObject]) => channelObject);

        allChannelsArray.forEach((element) =>
        {
            if (element.type === 'GUILD_CATEGORY' && element.name.includes('Match'))
            {
                //console.log(`${element.id} - ${element.name} - ${element.type}`);
                element.delete();
            }
        });
    }
}

module.exports = TestDeleteChannelCommand.getExportObject();