const { BaseInteraction } = require("./base/BaseInteraction");
const { PlayerStatisticsScreen } = require("../ui/screens/PlayerStatisticsScreen");

const { getPlayerStatistics } = require("../modules/playerStatisticsGenerator");
const { constructEmbeddedDiscordMessage } = require("../interfaces/discordInterface");

class SelectStatisticsGameInteraction extends BaseInteraction
{
    async executeInteraction(interactionObject, interactionInfo)
    {
        const targetMessageId = interactionInfo.interactionArguments[0];
        const targetGameId = interactionObject.values[0];

        let targetMessage = await interactionObject.channel.messages.fetch(targetMessageId);
        let targetPlayerIds = Array.from(targetMessage.mentions.users, (([userId, userObject]) => userId));

        let discordIdToPlayerStatisticsMap = await getPlayerStatistics(targetPlayerIds, [targetGameId]);
        if (!discordIdToPlayerStatisticsMap || !discordIdToPlayerStatisticsMap.size)
        {
            interactionObject.update({embeds: constructEmbeddedDiscordMessage([{
                title: "No Statistics Data Available",
                description: "None of the selected player(s) have statistics data available for the selected game"
            }])});

            return;
        }

        for(let targetPlayer of targetPlayerIds)
        {
            let playerStatisticsMessage = { embeds: [], files: [] };
            let targetPlayerStatisticsWrapper = discordIdToPlayerStatisticsMap.get(targetPlayer);

            if (!targetPlayerStatisticsWrapper)
            {
                playerStatisticsMessage.embeds.push(constructEmbeddedDiscordMessage([{
                    title: "No Player Statistics Data Available",
                    description: "This player has no statistics data available for the selected game"
                }])[0]);
            }
            else
            {
                let statisticsScreen = new PlayerStatisticsScreen(targetPlayerStatisticsWrapper);
                playerStatisticsMessage.embeds.push(...statisticsScreen.getPlayerStatisticsScreenEmbeds());
                playerStatisticsMessage.files.push(...statisticsScreen.getPlayerStatisticsScreenGraphs());
            }

            let newThread = await interactionObject.channel.threads.create({
                name: 'Statistics Thread',
                autoArchiveDuration: 60,
                reason: 'Statistics'
            });

            newThread.send(playerStatisticsMessage);
        }

        interactionObject.update({
            embeds: constructEmbeddedDiscordMessage([{
                title: "Statistics Generated",
                description: "The statistics for the selected players/games have been generated and can be located in the generated threads"
            }]), 
            components: []
        });

        return;
    }
}

module.exports = SelectStatisticsGameInteraction.buildExportObject();