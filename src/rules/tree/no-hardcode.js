const TreeRulePrototype = require('../prototypes/TreeRulePrototype');

const ruleId      = require('path').basename(__filename).slice(0, -3);
const description = 'Hardcoded string is not allowed';

const Rule = Object.create(TreeRulePrototype);

Rule.init(ruleId, description);

Rule.getDefaultAttrs = () => {
    return {
        except            : [],
        allowHtmlEntities : true
    };
};

Rule.isBroken = function(node) {
    const ruleExceptionList  = this.getConfigs().except;
    const allowHtmlEntities  = this.getConfigs().allowHtmlEntities;
    const isTagContent       = isTagChild(node);
    const shouldCheckValue   = node.isOfType('text') && !node.isExpression() && !isTagContent;
    const isTextAnHtmlEntity = node.value.trim().startsWith('&') && node.value.trim().endsWith(';');
    let nodeValue            = node.value;

    if (!shouldCheckValue) {
        return false;
    }

    for (let i = 0; i < ruleExceptionList.length; i++) {
        const char = ruleExceptionList[i];

        nodeValue = nodeValue.split(char).join('');
    }

    if (allowHtmlEntities && isTextAnHtmlEntity) {
        return false;
    }

    return nodeValue.trim().length > 0;
};

const isTagChild = node => {
    const isCommentContent  = node.parent && node.parent.isOfType('iscomment');
    const isIsscriptContent = node.parent && node.parent.isOfType('isscript');
    const isScriptContent   = node.parent && node.parent.isOfType('script');
    const isStyleContent    = node.parent && node.parent.isOfType('style');

    return isCommentContent || isIsscriptContent || isScriptContent || isStyleContent;
};

module.exports = Rule;
