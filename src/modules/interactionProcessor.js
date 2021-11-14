const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { moveDiscordMembersToTeamVoiceChannels } = require("./discordVoiceChannelManager.js");
const { postMatchResult } = require("./salesforceDataReader.js");
const { contructMatchResultWrapper } = require("./eloRatingManager.js");

const generateMatchModule = require("../commands/generateMatch.js");
const { COMMAND_CLASS_KEY, parseUserMessageContent, constructCommandArgumentMap } = require("./commandParser.js");
const { GENERATED_TEAMS_CACHE_KEY } = require("../utils/Constants.js");

async function processInteraction(interaction, applicationCache)
{
    //if (!interaction.isButton()) { return; }
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
        let messageId = interaction.customId.split(":")[1];

        newEmbed.title = "In Progress - Starcraft 2";
        newEmbed.description = "Good luck to everyone! Use the buttons to report the winner.";

        const actionRow = new MessageActionRow()
            .addComponents(new MessageButton()
                .setCustomId(`ReportVictory:-1:${messageId}`)
                .setLabel('Draw')
                .setStyle("DANGER")
            );

        let allGeneratedTeams = applicationCache.get(GENERATED_TEAMS_CACHE_KEY);
        let targetGeneratedTeamsObject = allGeneratedTeams.get(messageId);
        let targetGeneratedMatch = targetGeneratedTeamsObject.generatedTeams[targetGeneratedTeamsObject.currentDisplayedTeamIndex];

        for (let i = 0; i < targetGeneratedMatch.teams.length; i++)
        {
            actionRow.addComponents(new MessageButton()
                .setCustomId(`ReportVictory:${(i + 1)}:${messageId}`)
                .setLabel(`Team ${i + 1} Won`)
                .setStyle("SUCCESS")
            )
        }

        moveDiscordMembersToTeamVoiceChannels(targetGeneratedMatch.teams, interaction.message);
        interaction.update({ embeds: [newEmbed], components: [actionRow] });
        return;
    }

    if (interaction.customId.includes("ReportVictory"))
    {
        let [idName, winningTeamIndex, messageId] = interaction.customId.split(":");

        let generatedTeamObject = applicationCache.get(GENERATED_TEAMS_CACHE_KEY).get(messageId);
        let matchResult = contructMatchResultWrapper(
            winningTeamIndex - 1,
            generatedTeamObject.generatedTeams[generatedTeamObject.currentDisplayedTeamIndex]
        );

        newEmbed.title = "Match Finished - Starcraft 2";
        newEmbed.description = `${winningTeamIndex !== -1 ? `Congrats to Team ${winningTeamIndex} for winning!` : "Its a draw."} The match result/rating changes have been recorded. Select 'Create New Game' to create a new game with the same parameters (To Be Added)`

        let targetFieldIndex = 1; // 0 = Map Field, 1 = First Team Field
        for (let teamResult of matchResult.teamResults)
        {
            let targetField = newEmbed.fields[targetFieldIndex];
            if (teamResult.result === "Won")
                targetField.name += ' - Winner!';

            let playerDisplays = targetField.value.split("\n");
            let newPlayerDisplays = [], currentDisplayIndex = 0;

            for (let playerDisplay of playerDisplays)
            {
                let changeSign = Math.sign(teamResult.roleRatingUpdates[currentDisplayIndex].ratingChange) === 1 ? "+" : "";

                newPlayerDisplays.push(`${playerDisplay} : (${changeSign}${teamResult.roleRatingUpdates[currentDisplayIndex].ratingChange})`)
                currentDisplayIndex += 1;
            }

            targetFieldIndex += 1;
            targetField.value = newPlayerDisplays.join("\n");
        }

        postMatchResult(matchResult);

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
        let generatedTeamObject = applicationCache.get(GENERATED_TEAMS_CACHE_KEY).get(messageId);

        let targetTeamsIndex;
        if (scrollDirection === "ScrollTeamViewLeft")
        {
            targetTeamsIndex = generatedTeamObject.currentDisplayedTeamIndex - 1;
        }

        if (scrollDirection === "ScrollTeamViewRight")
        {
            targetTeamsIndex = generatedTeamObject.currentDisplayedTeamIndex + 1;
        }
        let targetMatchObject = generatedTeamObject.generatedTeams[targetTeamsIndex];
        generatedTeamObject.currentDisplayedTeamIndex = targetTeamsIndex;

        newEmbed.fields[0] = targetMatchObject.map.getMapDisplay();
        for (let i = 1; i <= targetMatchObject.teams.length; i++)
        {
            let targetTeam = targetMatchObject.teams[i - 1];

            let targetField = newEmbed.fields[i];
            let newField = targetTeam.getTeamDisplay();

            targetField.name = newField.name;
            targetField.value = newField.value;
        }

        newEmbed.title = `(${targetTeamsIndex + 1}/${generatedTeamObject.generatedTeams.length}) New Match - ${generatedTeamObject.generatedTeams[targetTeamsIndex].game.gameName}`;

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