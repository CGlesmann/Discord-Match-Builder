require("dotenv").config();

const teamBuilder = require("./modules/teamBuilder.js");

const { Client, MessageEmbed } = require("discord.js");
const COMMAND_PREFIX = "$";

const botClient = new Client();
botClient.on('message', (message) =>
{
    if (message.author.bot) return;
    if (message.content.startsWith(COMMAND_PREFIX))
    {
        const [receivedCommandName, ...args] = message.content
            .trim()
            .substring(COMMAND_PREFIX.length)
            .split(/\s+/);

        if (receivedCommandName === "generateTeam")
        {
            let amountOfAI = args[0];
            let teamRosterConfig = args[1]?.split(",")?.map((value) => { return Number(value); });

            if (!amountOfAI || (!teamRosterConfig || teamRosterConfig.length === 0))
            {
                message.channel.send("I didn't receive the proper info, please try again");
                return;
            }

            let gameConfig = {
                aiCount: amountOfAI
            };

            let embed = new MessageEmbed();
            embed.setTitle("Generated Teams");
            embed.setColor('#DAF7A6');
            embed.addFields(teamBuilder.run(teamRosterConfig, gameConfig));

            message.channel.send(embed);
        }
    }
});

botClient.login(process.env.DISCORDJS_BOT_TOKEN);