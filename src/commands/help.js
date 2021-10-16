const path = require("path");
const fs = require("fs");

const { BaseCommand } = require("../commandStructure/baseCommand.js");
const { COMMAND_CLASS_KEY } = require("../modules/commandParser.js");

class HelpCommand extends BaseCommand
{
    async run()
    {
        const helpFileName = path.basename(__filename);
        const allCommandFiles = fs.readdirSync(__dirname);

        if (!allCommandFiles || allCommandFiles.length === 0)
        {
            return;
        }

        let embeddedHelpMessages = [];
        allCommandFiles.forEach((fileName) =>
        {
            if (fileName === helpFileName)
            {
                return;
            }

            const COMMAND_CLASS = require(`../commands/${fileName}`)[COMMAND_CLASS_KEY];
            const COMMAND = new COMMAND_CLASS();
            embeddedHelpMessages.push(COMMAND.help()[0]);
        });

        return embeddedHelpMessages;
    }
}

module.exports = HelpCommand.getExportObject();