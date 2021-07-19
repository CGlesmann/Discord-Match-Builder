require("dotenv").config();

const teamRosterSetup = require("./modules/rosterSetup.js");
const gameSetup = require("./modules/gameSetup.js");
const teamBuilder = require("./modules/teamBuilder.js");

const { Client } = require("discord.js");
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
            let teamRosterConfig = args[1]?.split(",");

            if (!amountOfAI || (!teamRosterConfig || teamRosterConfig.length === 0))
            {
                message.channel.send("I didn't receive the proper info, please try again");
                return;
            }

            let gameConfig = {
                aiCount: amountOfAI
            };

            message.channel.send(teamBuilder.run(teamRosterConfig, gameConfig));
        }
        /*
        let newTeam = await main();

        console.log(newTeam);
        message.channel.send(newTeam);
        */
    }
});

botClient.login(process.env.DISCORDJS_BOT_TOKEN);

/*
async function main()
{
    printSectionHeader("Team Roster Config");
    let desiredTeamRosterConfig = await teamRosterSetup.run();

    printSectionHeader("Game Config");
    let gameConfig = await gameSetup.run();

    printSectionHeader("Generated Teams");
    return teamBuilder.run(desiredTeamRosterConfig, gameConfig);
}

function printSectionHeader(headerString)
{
    console.log("\n-----------------------------------");
    console.log(`${headerString}`);
    console.log("-----------------------------------");
}

async function callMain()
{
    let displayValue;
    try
    {
        displayValue = await main();
    } catch (e)
    {
        console.error(`Error: ${e.message}`);
    }

    console.log(displayValue);
}

callMain();
*/