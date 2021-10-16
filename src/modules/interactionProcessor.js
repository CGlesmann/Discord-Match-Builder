const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { moveDiscordMembersToTeamVoiceChannels } = require("./discordVoiceChannelManager.js");

const generateMatchModule = require("../commands/generateMatch.js");
const { COMMAND_CLASS_KEY, parseUserMessageContent, constructCommandArgumentMap } = require("./commandParser.js");

async function processInteraction(interaction, applicationCache)
{
    if (!interaction.isButton()) { return; }
    const newEmbed = new MessageEmbed(interaction.message.embeds[0]);

    if (interaction.customId.includes("RegenerateTeams"))
    {
        let targetMessage = await interaction.channel.messages.fetch(interaction.customId.split(":")[1]);
        const [commandName, ...parsedCommandArgs] = parseUserMessageContent(targetMessage.content)
        let commandArgs = constructCommandArgumentMap(parsedCommandArgs)

        let generateMatchClass = new generateMatchModule[COMMAND_CLASS_KEY]();
        let newTeamsEmbed = await generateMatchClass.run(commandArgs, targetMessage, applicationCache);

        interaction.update(newTeamsEmbed);
        return;
    }

    if (interaction.customId.includes("ConfigureVoiceChat"))
    {
        let targetField = newEmbed.fields[newEmbed.fields.length - 1];
        targetField.name = "🏁 The Match has begun 🏁";
        targetField.value = "May the odds be ever in your favor...";

        const actionRow = new MessageActionRow()
            .addComponents(new MessageButton()
                .setCustomId('ReportVictory:-1')
                .setLabel('Draw')
                .setStyle("DANGER")
            );

        let allGeneratedTeams = applicationCache.get("generatedTeams");
        let targetGeneratedTeams = allGeneratedTeams.get(interaction.customId.split(":")[1]);

        for (let i = 0; i < targetGeneratedTeams.length; i++)
        {
            actionRow.addComponents(new MessageButton()
                .setCustomId('ReportVictory:' + (i + 1))
                .setLabel(`Team ${i + 1} Won`)
                .setStyle("SUCCESS")
            )
        }

        moveDiscordMembersToTeamVoiceChannels(targetGeneratedTeams, interaction.message);
        interaction.update({ embeds: [newEmbed], components: [actionRow] });
        return;
    }

    if (interaction.customId.includes("ReportVictory"))
    {
        let targetField = newEmbed.fields[newEmbed.fields.length - 1];
        let winningTeamIndex = interaction.customId.split(":")[1];

        if (targetField)
        {
            targetField.name = "The Match has concluded!";
            targetField.value = winningTeamIndex === "-1" ? "It's a draw!" : `Congrats to Team ${winningTeamIndex} for winning!`;
            targetField.value += " Select 'Create New Game' to create a new game with the same parameters";
        }

        const actionRow = new MessageActionRow()
            .addComponents(new MessageButton()
                .setCustomId('ReportVictory:-1')
                .setLabel('Create New Game')
                .setStyle("DANGER")
            );

        interaction.update({ embeds: [newEmbed], components: [actionRow] });
        return;
    }
}

module.exports = { processInteraction };