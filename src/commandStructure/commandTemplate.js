const { BaseCommand } = require("../commandStructure/baseCommand.js");

// Rename the <NewCommandNameHere> to the Name of the Command Class
class NewCommandNameHere extends BaseCommand
{
    constructor()
    {
        super();

        this.COMMAND_ARGS = {
            "<ArgumentNameHere>": {
                helpText: "Describes the argument use case, shown when the help command is ran",
                validateErrorText: "Describes the expected input format, shown when an invalid value is presented for the argument",
                validate: function (argumentStringValue)
                {
                    // A function that takes in a string and validates the value is a valid input for the argument, returns true/false
                    // I.e return (argumentStringValue && !isNaN(Number(argumentStringValue)))

                    return true;
                }
            }
        }
    }

    async run(receivedCommandArgs)
    {
        // Place the logic to be ran when the command is executed here
        // receivedCommandArgs is a map in which the key is the argument and the value is the string value passed in for each argument
        // Ensure a discord embedded message is returned
    }
}

// Rename the <NewCommandNameHere> to the Name of the Command Class
module.exports = NewCommandNameHere.getExportObject();