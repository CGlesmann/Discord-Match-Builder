class InteractionLabelBuilder
{
    static LABEL_ENTRY_DELIMITER = ':';

    static getInteractionLabel(interactionInfo)
    {
        return `${interactionInfo.label}:${interactionInfo.interactionArguments.join(this.LABEL_ENTRY_DELIMITER)}`;
    }

    static parseInteractionLabel(interactionLabel)
    {
        let [label, ...interactionArguments] = interactionLabel.split(this.LABEL_ENTRY_DELIMITER);
        return new InteractionLabelInfo(
            label,
            interactionArguments
        );
    }
}

class InteractionLabelInfo
{
    label;
    interactionArguments;

    constructor(label, interactionArguments)
    {
        if (!label) { throw 'InteractionLabelInfo expects a string as a label'; }
        if (!interactionArguments || !Array.isArray(interactionArguments))
        {
            throw 'InteractionLabelInfo interactionArguments needs to be an array';
        }

        this.label = label;
        this.interactionArguments = interactionArguments;
    }
}

module.exports = { InteractionLabelBuilder, InteractionLabelInfo };