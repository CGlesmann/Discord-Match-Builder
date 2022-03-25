class InProgressMatchTracker
{
    message;
    match;

    constructor(matchGenerationRequest)
    {
        this.message = matchGenerationRequest.message;
        this.match = matchGenerationRequest.getCurrentlyDisplayedMatch();
    }
}

module.exports = { InProgressMatchTracker };