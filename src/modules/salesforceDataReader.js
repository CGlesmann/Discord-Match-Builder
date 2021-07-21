const jsforce = require("jsforce");

const SF_LOGIN_URL = "https://login.salesforce.com";
const DATA_QUERY_PATH = "/SCMatch";
const SF_CONNECTION = new jsforce.Connection({
    loginUrl: SF_LOGIN_URL
});

async function getAllPlayerData()
{
    await SF_CONNECTION.login(process.env.SF_INSTANCE_USERNAME, process.env.SF_INSTANCE_PASSWORD);

    let returnData = await SF_CONNECTION.apex.get(DATA_QUERY_PATH);
    return returnData;
}

module.exports = { getAllPlayerData }