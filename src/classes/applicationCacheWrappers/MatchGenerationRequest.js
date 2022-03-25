const { fetchCommandClassInstance } = require("../../managers/commandManager");
const { MatchGeneratorScreen } = require("../../ui/screens/MatchGeneratorScreen");
const { MatchInProgressScreen } = require("../../ui/screens/MatchInProgressScreen");
const { InProgressMatchTracker } = require("./InProgressMatchTracker.js");
const { MATCH_CAROUSEL_SCROLL_DIRECTION } = require("../../utils/Constants");

class MatchGenerationRequest
{
    message;
    matchGenerationCommandArguments;
    targetGameData;

    matchGeneratorScreen

    generatedMatches;
    currentlyDisplayedMatchIndex;

    constructor(matchGenerationCommandArguments, message)
    {
        this.matchGenerationCommandArguments = matchGenerationCommandArguments;
        this.message = message;
    }

    setTargetGameData(targetGameData)
    {
        this.targetGameData = targetGameData;
    }

    async initializeMatchGenerationScreen()
    {
        // Set the variables
        this.generatedMatches = [];
        this.currentlyDisplayedMatchIndex = 0;

        // Generate the first match instance
        await this.generateMatchInstance();

        this.matchGeneratorScreen = new MatchGeneratorScreen(this);
    }

    async generateMatchInstance()
    {
        const generateMatchInstance = fetchCommandClassInstance(this.message, 'generateMatch');
        let { generatedMatch } = await generateMatchInstance.generateMatchData(
            this.matchGenerationCommandArguments,
            this.message,
            this.targetGameData
        );

        this.generatedMatches.push(generatedMatch);
        this.currentlyDisplayedMatchIndex = this.generatedMatches.length - 1;
    }

    scrollCurrentMatchDisplay(interaction, scrollDirection)
    {
        scrollDirection = Number(scrollDirection);

        if (scrollDirection === MATCH_CAROUSEL_SCROLL_DIRECTION.RIGHT)
        {
            if (this.currentlyDisplayedMatchIndex < this.generatedMatches.length - 1)
            {
                this.currentlyDisplayedMatchIndex++;
                this.updateGenerationScreen(interaction);

                return;
            }
        }
        else if (scrollDirection === MATCH_CAROUSEL_SCROLL_DIRECTION.LEFT)
        {
            if (this.currentlyDisplayedMatchIndex > 0)
            {
                this.currentlyDisplayedMatchIndex--;
                this.updateGenerationScreen(interaction);

                return;
            }
        }

        console.log(`Can't execute scroll with direction of ${scrollDirection}`);
        return;
    }

    getCurrentlyDisplayedMatch()
    {
        return this.generatedMatches[this.currentlyDisplayedMatchIndex];
    }

    updateGenerationScreen(interaction)
    {
        const targetMatchToDisplay = this.getCurrentlyDisplayedMatch();
        interaction.update(this.matchGeneratorScreen.getMatchGeneratorScreen(targetMatchToDisplay));
    }

    startMatch(interaction)
    {
        let inProgressMatchTracker = new InProgressMatchTracker(this);
        let inProgressMatchScreen = new MatchInProgressScreen(inProgressMatchTracker);

        this.getCurrentlyDisplayedMatch().startMatch(interaction.message.guild);
        interaction.update(inProgressMatchScreen.getMatchInProgressScreen(interaction.message.embeds[0]));

        return inProgressMatchTracker;
    }
}

module.exports = { MatchGenerationRequest };