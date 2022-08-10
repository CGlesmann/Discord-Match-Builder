class InProgressMatchTrackerList
{
    messageIdToInProgressMatchTracker;

    constructor()
    {
        this.messageIdToInProgressMatchTracker = new Map();
    }

    addInProgressMatchTracker(messageId, inProgressMatchTracker)
    {
        this.messageIdToInProgressMatchTracker.set(
            messageId,
            inProgressMatchTracker
        );
    }

    getInProgressMatchTracker(messageId)
    {
        if (this.messageIdToInProgressMatchTracker.has(messageId))
        {
            return this.messageIdToInProgressMatchTracker.get(messageId);
        }

        return null;
    }

    deleteInProgressMatchTracker(messageId)
    {
        return this.messageIdToInProgressMatchTracker.delete(messageId);
    }
}

module.exports = { InProgressMatchTrackerList };