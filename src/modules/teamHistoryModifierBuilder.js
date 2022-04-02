require("dotenv").config();

const { createClient } = require("@supabase/supabase-js");
const { calculateExpectedScore, calculateScoreChange } = require("../managers/eloRatingManager");

const supabaseClient = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

class GroupModifier {
    groupKey;
    groupScore;
    groupWins;
    groupLoses;

    constructor(groupKey)
    {
        this.groupKey = groupKey;
        this.groupScore = 0;
        this.groupWins = 0;
        this.groupLoses = 0;
    }

    calculateGroupScoreChange(opposingRating, actualScore)
    {
        if (actualScore === 1)
        {
            this.groupWins += 1;
        }
        else
        {
            this.groupLoses += 1;
        }

        let expectedScore = calculateExpectedScore(this.groupScore, opposingRating);
        let scoreChange = calculateScoreChange(32, actualScore, expectedScore);

        return scoreChange;
    }

    alterScore(scoreChange)
    {
        this.groupScore += scoreChange;
    }
}

class GroupBuilder {
    groupPlayers;
    actualScore;

    constructor(actualScore)
    {
        this.groupPlayers = [];
        this.actualScore = actualScore;
    }

    addPlayerToGroup(newPlayer)
    {
        if (!this.groupPlayers) {this.groupPlayers = [];}

        this.groupPlayers.push(newPlayer);
    }

    getNewGroupKey()
    {
        let newGroupNames = [];

        for(let groupPlayer of this.groupPlayers)
        {
            newGroupNames.push(groupPlayer.player.name);
        }

        return newGroupNames.sort().join('-');
    }
    
    getNewGroupScore()
    {
        let newGroupScore = 0;

        for(let groupPlayer of this.groupPlayers)
        {
            newGroupScore += groupPlayer.value;
        }

        return newGroupScore;
    }

    buildGroupModifier()
    {
        if (!this.groupPlayers) {return null;}

        return new GroupModifier(this.getNewGroupKey());
    }
}

async function getGroupModifierMap()
{
    const groupKeyToModifier = new Map();
    const allMatchData = await getPlayerMatchData();

    let gameTeamToGroupBuilder;
    for(let matchResult of allMatchData)
    {
        gameTeamToGroupBuilder = new Map();

        for(let playerMatchResult of matchResult.player_match_result)
        {
            let groupBuilder = gameTeamToGroupBuilder.get(playerMatchResult.game_team);
            let insertGroupBuilder = false;

            if (!groupBuilder)
            {
                groupBuilder = new GroupBuilder(playerMatchResult.match_result === "Won" ? 1 : 0);
                insertGroupBuilder = true;
            }

            groupBuilder.addPlayerToGroup(playerMatchResult.player_role_rating);

            if (insertGroupBuilder)
            {
                gameTeamToGroupBuilder.set(playerMatchResult.game_team, groupBuilder);
            }
        }

        let gameTeamList = Array.from(gameTeamToGroupBuilder.values());
        let builderKeyToAmountChange = new Map();

        for(let i = 0; i < gameTeamList.length; i++)
        {
            let newGroupBuilder = gameTeamList[i];

            let targetGroupModifer;
            let newGroupKey = newGroupBuilder.getNewGroupKey();

            if (groupKeyToModifier.has(newGroupKey))
            {
                targetGroupModifer = groupKeyToModifier.get(newGroupKey);
            }
            else
            {
                targetGroupModifer = newGroupBuilder.buildGroupModifier();
            }

            let amountToChange = 0;
            for(let j = 0; j < gameTeamList.length; j++)
            {
                if (j === i) { continue; }

                //amountToChange += targetGroupModifer.calculateGroupScoreChange(gameTeamList[j].getNewGroupScore(), newGroupBuilder.actualScore);
                amountToChange += targetGroupModifer.calculateGroupScoreChange(gameTeamList[j].actualScore, newGroupBuilder.actualScore);
            }

            builderKeyToAmountChange.set(newGroupBuilder.getNewGroupKey(), amountToChange);
            groupKeyToModifier.set(newGroupKey, targetGroupModifer);
        }

        for(let [builderKey, amountChange] of builderKeyToAmountChange)
        {
            groupKeyToModifier.get(builderKey).alterScore(amountChange);
        }
    }

    return groupKeyToModifier;
}

async function getPlayerMatchData()
{
    const { data, error} = await supabaseClient.from('match').select(` 
        player_match_result!inner(
            id,
            match_result,
            game_team,
            player_role_rating (
                id,
                value,
                player(
                    id,
                    name
                )
            )
        )
    `);

    if (error)
    {
        throw error;
    }

    return data;
}

module.exports = { getGroupModifierMap };