const userInput = require("./userInput.js");

const OFF_RACE_KEY = "allowOffRaces";
const AI_KEY = "aiCount";
const THRESHOLD_KEY = "acceptanceThreshold"

async function run()
{
    let gameConfig = {};
    gameConfig[OFF_RACE_KEY] = await queryForOffraceOption();
    gameConfig[AI_KEY] = await queryForAIOption();
    gameConfig[THRESHOLD_KEY] = await queryForThresholdAmount();

    userInput.closeUserInputStream();
    return gameConfig;
}

async function queryForOffraceOption()
{
    try
    {
        return await userInput.queryQuestionWithInputValidation(
            `Allow Offraces (y/n)? `,
            "Invalid input, please input y for 'yes' or n for 'no'",
            (userInput) =>
            {
                let validValues = ["y", "n"];
                return userInput && validValues.includes(userInput.toLowerCase());
            }
        );
    }
    catch (e)
    {
        console.log(`Error while querying offrace option: ${e.message}`);
    }
}

async function queryForAIOption()
{
    try
    {
        return Number(await userInput.queryQuestionWithInputValidation(
            `How many AI Players? `,
            "Invalid input, please input a whole number above or equal to 0",
            (userInput) =>
            {
                return (userInput && !isNaN(Number(userInput)));
            }
        ));
    }
    catch (e)
    {
        console.log(`Error while querying AI option: ${e.message}`);
    }
}

async function queryForThresholdAmount()
{
    try
    {
        return Number(await userInput.queryQuestionWithInputValidation(
            `What is an acceptance difference threshold? `,
            "Invalid input, please input a whole number above or equal to 0",
            (userInput) =>
            {
                return (userInput && !isNaN(Number(userInput)));
            }
        ));
    }
    catch (e)
    {
        console.log(`Error while querying AI option: ${e.message}`);
    }
}

module.exports = { run };