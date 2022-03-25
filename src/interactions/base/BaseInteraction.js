const { INTERACTION_CLASS_KEY } = require("../../managers/interactionManager");

class BaseInteraction
{
    executeInteraction(interactionObject, interactionInfo)
    {
        throw 'Interaction isn\'t implemented';
    }

    static buildExportObject()
    {
        let exportObject = {};
        exportObject[INTERACTION_CLASS_KEY] = this;

        return exportObject;
    }
}

module.exports = { BaseInteraction };