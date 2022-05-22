const { BaseCommand } = require("./base/baseCommand.js");
const { COMMAND_CLASS_KEY } = require("../managers/commandManager.js");

const generateMapModule = require("./generateMap.js");
const generateTeamModule = require("./generateTeams.js");

const { ApplicationCacheManager } = require('../managers/applicationCacheManager.js');
const { SelectGameScreen } = require("../ui/screens/SelectGameScreen");

const { APPLICATION_CACHE_KEYS } = require("../utils/Constants.js");
const { MatchGenerationRequest } = require("../classes/applicationCacheWrappers/MatchGenerationRequest.js");
const { MatchGenerationRequestList } = require("../classes/applicationCacheWrappers/MatchGenerationRequestList.js");

class GenerateMatchCommand extends BaseCommand
{
    selectGameScreenInstance;

    constructor()
    {
        super();

        this.COMMAND_NAME = "generateMatch";
        this.COMMAND_ARGS = {}
    }

    async run(receivedCommandArgs, message)
    {
        if (!message.mentions.users || message.mentions.users.size === 0)
        {
            throw { message: "Please Tag at least 1 User" };
        }

        this.createMatchGenerationRequest(receivedCommandArgs, message);
        return await this.constructGameSelectScreen(message);
    }

    createMatchGenerationRequest(receivedCommandArgs, message)
    {
        const newMatchGenerationRequest = new MatchGenerationRequest(receivedCommandArgs, message);

        let matchGenerationList = ApplicationCacheManager.retrieveCacheData(APPLICATION_CACHE_KEYS.MATCH_GENERATION_REQUESTS);
        if (!matchGenerationList)
        {
            matchGenerationList = new MatchGenerationRequestList();

            matchGenerationList.addMatchGenerationRequest(message.id, newMatchGenerationRequest);
            ApplicationCacheManager.addDataToCache(
                APPLICATION_CACHE_KEYS.MATCH_GENERATION_REQUESTS,
                matchGenerationList,
                0
            );

            return;
        }

        matchGenerationList.addMatchGenerationRequest(message.id, newMatchGenerationRequest);
        return;
    }

    async constructGameSelectScreen(message)
    {
        this.selectGameScreenInstance = new SelectGameScreen();
        return await this.selectGameScreenInstance.getSelectGameScreenDisplay(message);
    }

    async generateMatchData(receivedCommandArgs, message, targetGameData)
    {
        let messagePromises = [];

        const generateMap = new generateMapModule[COMMAND_CLASS_KEY]();
        messagePromises.push(generateMap.getRandomMap(this.getPlayerCount(message), targetGameData.gameId));

        const generateTeams = new generateTeamModule[COMMAND_CLASS_KEY]();
        messagePromises.push(generateTeams.getTeamRosterObject(message, targetGameData));

        let [generatedMap, generatedMatch] = await Promise.all(messagePromises); // Each command returns their own array, combine the two arrays into one

        generatedMatch.setMap(generatedMap);
        return {
            generatedMatch: generatedMatch
        };
    }

    getPlayerCount(message)
    {
        return message.mentions.users.size;
    }
}

module.exports = GenerateMatchCommand.getExportObject();