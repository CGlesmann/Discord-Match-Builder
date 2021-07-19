const userInput = require("./userInput.js");

async function run()
{
    let desiredTeamCount = await queryForTeamCount();
    let desiredTeamRosterConfig = await queryTeamSizes(desiredTeamCount);

    return desiredTeamRosterConfig;
}

async function queryForTeamCount()
{
    try
    {
        return await userInput.queryQuestionWithInputValidation(
            `How many teams? `,
            "Invalid input, please input a whole number",
            (userInput) =>
            {
                return (userInput && !isNaN(Number(userInput)));
            }
        );
    }
    catch (e)
    {
        console.log(`Error while querying team count: ${e.message}`);
    }
}

async function queryTeamSizes(amountOfTeams)
{
    let desiredTeamRoster = [];
    while (desiredTeamRoster.length < amountOfTeams)
    {
        try
        {
            desiredTeamRoster.push(Number(await userInput.queryQuestionWithInputValidation(
                `How many people on team ${desiredTeamRoster.length + 1}? `,
                "Invalid input, please input a whole number",
                (userInput) =>
                {
                    return (userInput && !isNaN(Number(userInput)));
                }
            )));
        }
        catch (e)
        {
            console.error(`Error while querying team size: ${e.message}`);
        }
    }

    return desiredTeamRoster;
}

module.exports = { run };