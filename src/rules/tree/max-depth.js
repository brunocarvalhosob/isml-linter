const TreeRulePrototype = require('../prototypes/TreeRulePrototype');
const ParseUtils        = require('../../isml_tree/ParseUtils');

const ruleId      = require('path').basename(__filename).slice(0, -3);
const description = 'max depth beyond allowed';

const Rule = Object.create(TreeRulePrototype);

Rule.init(ruleId, description);

Rule.getDefaultAttrs = () => {
    return {
        value : 10
    };
};

Rule.isBroken = function(node) {
    const configMaxDepth = this.getConfigs().value;
    return !node.isEmpty() && node.depth > configMaxDepth;
};

Rule.check = function(node, data) {

    const config      = this.getConfigs();
    const occurrences = this.checkChildren(node, data);

    if (this.isBroken(node)) {
        const stringifiedNode = node.toString().trim();
        let length            = stringifiedNode.length;

        if (data.isCrlfLineBreak) {
            length += ParseUtils.getLineBreakQty(stringifiedNode);
        }

        const error = this.add(
            stringifiedNode,
            node.lineNumber - 1,
            node.globalPos,
            length
        );

        occurrences.push(error);
    }

    return this.return(node, occurrences, config);
};

module.exports = Rule;
