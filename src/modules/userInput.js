const readline = require("readline");
const util = require('util');

const consoleReadLine = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const question = util.promisify(consoleReadLine.question).bind(consoleReadLine);

async function queryQuestionWithInputValidation(questionString, errorString, validationCallback)
{
    let userAnswer;

    do
    {
        userAnswer = await question(questionString);
        if (validationCallback)
        {
            if (!validationCallback(userAnswer))
            {
                console.log(`${errorString}\n`);
            }
        }
    }
    while (!validationCallback || !validationCallback(userAnswer));

    return userAnswer;
}

function closeUserInputStream()
{
    consoleReadLine.close();
}

module.exports = { queryQuestionWithInputValidation, closeUserInputStream };