class MatchGenerationRequestList
{
    messageIdToMatchGenerationRequest;

    constructor()
    {
        this.messageIdToMatchGenerationRequest = new Map();
    }

    addMatchGenerationRequest(messageId, matchGenerationRequest)
    {
        this.messageIdToMatchGenerationRequest.set(
            messageId,
            matchGenerationRequest
        );
    }

    getMatchGenerationRequest(messageId)
    {
        if (this.messageIdToMatchGenerationRequest.has(messageId))
        {
            return this.messageIdToMatchGenerationRequest.get(messageId);
        }

        return null;
    }

    deleteMatchGenerationRequest(messageId)
    {
        return this.messageIdToMatchGenerationRequest.delete(messageId);
    }
}

module.exports = { MatchGenerationRequestList };