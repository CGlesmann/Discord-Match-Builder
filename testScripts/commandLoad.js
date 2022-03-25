const fs = require("fs");

function testCommandFileLoad()
{
    const allCommandFiles = fs.readdirSync(__dirname);

    if (!allCommandFiles || allCommandFiles.length === 0)
    {
        return;
    }

    allCommandFiles.forEach((fileName) =>
    {
        console.log(fileName);
    });
}

testCommandFileLoad();