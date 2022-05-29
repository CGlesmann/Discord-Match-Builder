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
        let playerStatisticScreenEmbeds = [];

        if (!discordIdToPlayerStatisticsMap || !discordIdToPlayerStatisticsMap.size)
        {
            playerStatisticScreenEmbeds.push(constructEmbeddedDiscordMessage([{
                title: "No Statistics Data Available",
                description: "This player has no statistics data available for the selected game"
            }])[0]);

            interactionObject.update({embeds: playerStatisticScreenEmbeds});
            return;
        }

        for(let targetPlayer of targetPlayerIds)
        {
            let targetPlayerStatisticsWrapper = discordIdToPlayerStatisticsMap.get(targetPlayer);
            if (!targetPlayerStatisticsWrapper)
            {
                playerStatisticScreenEmbeds.push(constructEmbeddedDiscordMessage([{
                    title: "No Statistics Data Available",
                    description: "This player has no statistics data available for the selected game"
                }])[0]);

                continue;
            }

            let statisticsScreen = new PlayerStatisticsScreen(targetPlayerStatisticsWrapper);
            playerStatisticScreenEmbeds.push(...statisticsScreen.getPlayerStatisticsScreenEmbeds());
        }

        interactionObject.update({embeds: playerStatisticScreenEmbeds});
        return;
    }
}

module.exports = SelectStatisticsGameInteraction.buildExportObject();