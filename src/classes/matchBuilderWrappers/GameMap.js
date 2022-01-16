class GameMap
{
    id;
    mapName;
    playerCount;

    constructor(id, mapName, playerCount)
    {
        this.id = id;
        this.mapName = mapName;
        this.playerCount = playerCount;
    }

    getMapDisplay()
    {
        return {
            name: `Map`,
            value: `${this.mapName}`,
            inline: false
        };
    }
}

module.exports = { GameMap };