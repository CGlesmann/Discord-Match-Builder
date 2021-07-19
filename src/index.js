require("dotenv").config();

const teamRosterSetup = require("./modules/rosterSetup.js");
const gameSetup = require("./modules/gameSetup.js");
const teamBuilder = require("./modules/teamBuilder.js");
const { Client } = require("discord.js");

const botClient = new Client();
botClient.on('message', async (message) =>
{
    if (message.content === "$generateTeam")
    {
        let newTeam = await main();

        console.log(newTeam);
        message.channel.send(newTeam);
    }
});

botClient.login(process.env.DISCORDJS_BOT_TOKEN);

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