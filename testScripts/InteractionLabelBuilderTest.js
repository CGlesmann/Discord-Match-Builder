const { InteractionLabelBuilder, InteractionLabelInfo } = require('../interactions/base/InteractionLabelBuilder');

let testLabelInfo = new InteractionLabelInfo('ReportVictory', ['-1', '023124']);
let testLabelString = 'ReportVictory:-1:023124';

console.log(InteractionLabelBuilder.parseInteractionLabel(testLabelString));
console.log(InteractionLabelBuilder.getInteractionLabel(testLabelInfo));