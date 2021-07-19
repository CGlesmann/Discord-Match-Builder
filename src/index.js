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

            let resultArray = teamBuilder.run(teamRosterConfig, gameConfig);
            console.log("typeof " + typeof resultArray);
            if (typeof resultArray === "string")
            {
                embed.addFields([{
                    name: "Error",
                    value: resultArray
                }]);
            }
            else
            {
                embed.addFields(resultArray);
            }

            message.channel.send(embed);
        }
    }
});

botClient.login(process.env.DISCORDJS_BOT_TOKEN);