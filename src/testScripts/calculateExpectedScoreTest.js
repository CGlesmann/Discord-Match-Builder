const { calculateExpectedScore, calculateScoreChange } = require("../modules/eloRatingManager");
const K_FACTOR = 32;

let expectedScore1 = calculateExpectedScore(700, 530);
let expectedScore2 = calculateExpectedScore(700, 700);

let testScore1 = calculateScoreChange(K_FACTOR, 1, expectedScore1);
let testScore2 = calculateScoreChange(K_FACTOR, 1, expectedScore2);
let testScore3 = calculateScoreChange(K_FACTOR, 1, (expectedScore1 + expectedScore2) / 2);

console.log(`${testScore1} + ${testScore2} = ${(testScore1 + testScore2) / 2}`);
console.log(`${testScore3}`);