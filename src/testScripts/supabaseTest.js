require('dotenv').config();

const { getAllGames } = require('../modules/salesforceDataReader');

async function doInit()
{
    console.log(JSON.stringify(getAllGames(5), null, 4));
}

doInit();