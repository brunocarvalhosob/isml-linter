const reqlib = require('app-root-path').require;
const config = reqlib('/src/app/ConfigLoader').load();

const ruleName = require('path').basename(__filename).slice(0, -3);

module.exports = {
    name: ruleName,
    title: 'Usage of tabs',
    isEnabled: () => config.disabledRules.indexOf(ruleName) === -1,
    isBroken: line => line.indexOf('\t') !== -1
};
