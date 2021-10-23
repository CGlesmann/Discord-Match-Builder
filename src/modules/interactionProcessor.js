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

        let targetButtonsArray = interaction.message.components[0].components;
        for (let targetButton of targetButtonsArray)
        {
            if (targetButton.customId.includes("ScrollTeamViewLeft"))
                targetButton.setDisabled(false);
            else if (targetButton.customId.includes("ScrollTeamViewRight"))
            {
                targetButton.setDisabled(true);
            }
        }

        interaction.update({ embeds: newTeamsEmbed.embeds, components: interaction.message.components });
        return;
    }

    if (interaction.customId.includes("ConfigureVoiceChat"))
    {
        newEmbed.title = "In Progress - Starcraft 2";
        newEmbed.description = "Good luck to everyone! Use the buttons to report the winner once the match ends to ";

        const actionRow = new MessageActionRow()
            .addComponents(new MessageButton()
                .setCustomId('ReportVictory:-1')
                .setLabel('Draw')
                .setStyle("DANGER")
            );

        let allGeneratedTeams = applicationCache.get("generatedTeams");
        let targetGeneratedTeamsObject = allGeneratedTeams.get(interaction.customId.split(":")[1]);
        let targetGeneratedTeams = targetGeneratedTeamsObject.generatedTeams[targetGeneratedTeamsObject.currentDisplayedTeamIndex];

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
        let winningTeamIndex = interaction.customId.split(":")[1];

        newEmbed.title = "Match Finished - Starcraft 2";
        newEmbed.description = `Congrats to Team ${winningTeamIndex} for winning! Select 'Create New Game' to create a new game with the same parameters (To Be Added)`;

        // const actionRow = new MessageActionRow()
        //     .addComponents(new MessageButton()
        //         .setCustomId('ReportVictory:-1')
        //         .setLabel('Create New Game')
        //         .setStyle("PRIMARY")
        //     );

        interaction.update({ embeds: [newEmbed], components: []/*, components: [actionRow]*/ });
        return;
    }

    if (interaction.customId.includes("ScrollTeamView"))
    {
        let interactionIdComponents = interaction.customId.split(":");
        let scrollDirection = interactionIdComponents[0];

        let messageId = interactionIdComponents[1];
        let generatedTeamObject = applicationCache.get("generatedTeams").get(messageId);

        let targetTeamsIndex;
        if (scrollDirection === "ScrollTeamViewLeft")
        {
            targetTeamsIndex = generatedTeamObject.currentDisplayedTeamIndex - 1;
        }

        if (scrollDirection === "ScrollTeamViewRight")
        {
            targetTeamsIndex = generatedTeamObject.currentDisplayedTeamIndex + 1;
        }
        let targetTeamsToDisplay = generatedTeamObject.generatedTeams[targetTeamsIndex];
        generatedTeamObject.currentDisplayedTeamIndex = targetTeamsIndex;

        for (let i = 1; i < newEmbed.fields.length; i++)
        {
            let teamTotal = 0;
            let targetTeamMembers = targetTeamsToDisplay[i - 1].teamMembers;
            let targetField = newEmbed.fields[i];

            targetField.value = "";
            for (let targetTeamMember of targetTeamMembers)
            {
                teamTotal += targetTeamMember.raceRatings[targetTeamMember.selectedRace].value;
                targetField.value += `${targetTeamMember.displayPlayer()}\n`;
            }
            targetField.name = `Team ${i} (${teamTotal})`;
        }

        newEmbed.title = `(${targetTeamsIndex + 1}/${generatedTeamObject.generatedTeams.length}) New Match - Starcraft 2`;

        let targetButtonsArray = interaction.message.components[0].components;
        for (let targetButton of targetButtonsArray)
        {
            if (targetButton.customId.includes("ScrollTeamViewLeft"))
                targetButton.setDisabled(generatedTeamObject.currentDisplayedTeamIndex === 0);
            else if (targetButton.customId.includes("ScrollTeamViewRight"))
            {
                targetButton.setDisabled(generatedTeamObject.currentDisplayedTeamIndex === generatedTeamObject.generatedTeams.length - 1);
            }
        }
        interaction.update({ embeds: [newEmbed], components: interaction.message.components });
    }
}

module.exports = { processInteraction };