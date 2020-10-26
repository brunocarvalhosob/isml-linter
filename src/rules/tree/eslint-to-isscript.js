const TreeRulePrototype = require('../prototypes/TreeRulePrototype');
const ParseUtils        = require('../../isml_tree/components/ParseUtils');
const Constants         = require('../../Constants');
const ConfigUtils       = require('../../util/ConfigUtils');
const GeneralUtils      = require('../../util/GeneralUtils');

const ruleId          = require('path').basename(__filename).slice(0, -3);
const description     = 'Not eslint-valid';
const notFoundMessage = 'No eslint configuration file found: ' + ConfigUtils.getEslintConfigFilePath();

const Rule = Object.create(TreeRulePrototype);

let isscriptContentArray = [];

Rule.init(ruleId, description);

Rule.addError = function(node, error, ismlIndentation, linter) {
    const errorLine = linter.getSourceCode() ?
        linter.getSourceCode().lines[error.line - 1] :
        node.value.split('\n')[error.line - 1];

    const duplicatedOffset = ParseUtils.getNextNonEmptyCharPos(node.value);
    const errorLocalPos    = node.value.indexOf(errorLine.trimStart()) - duplicatedOffset;
    let errorGlobalPos     = node.globalPos;

    if (global.isWindows) {
        errorGlobalPos += errorLocalPos + error.line - 2;
    } else {
        errorGlobalPos += node.value.trimStart().indexOf(errorLine.trimStart());
    }

    this.add(
        ismlIndentation + errorLine,
        node.lineNumber + error.line - 3,
        errorGlobalPos,
        errorLine.trimStart().length,
        error.message
    );
};

Rule.check = function(node) {
    let eslintConfig = null;

    try {
        eslintConfig = ConfigUtils.loadEslintConfig();
    } catch (err) {
        this.add(null, 0, 0, 1, notFoundMessage);
        return this.result;
    }

    for (let i = 0; i < node.children.length; i++) {
        this.check(node.children[i]);
    }

    if (node.isIsscriptContent()) {
        isscriptContentArray.push(node);
    }

    if (node.isRoot()) {
        const Linter = require('eslint').Linter;
        const linter = new Linter();
        this.result  = {
            occurrences : []
        };

        for (let index = 0; index < isscriptContentArray.length; index++) {
            const jsContentNode = isscriptContentArray[index];
            let content         = jsContentNode.value;

            const ismlIndentation = getIndentation(content);

            content = unindent(content, ismlIndentation.length);

            const errorArray = linter.verify(content, eslintConfig);

            for (let i = 0; i < errorArray.length; i++) {
                this.addError(jsContentNode, errorArray[i], ismlIndentation, linter);
            }
        }

        isscriptContentArray = [];

        return this.result;
    }
};

Rule.getFixedContent = function(node) {
    let eslintConfig = null;

    try {
        eslintConfig = ConfigUtils.loadEslintConfig();
    } catch (err) {
        this.add(null, 0, 0, 1, notFoundMessage);
        return this.result;
    }

    for (let i = 0; i < node.children.length; i++) {
        this.getFixedContent(node.children[i]);
    }

    if (node.isIsscriptContent()) {
        const Linter          = require('eslint').Linter;
        const linter          = new Linter();
        let content           = node.value;
        const ismlIndentation = getIndentation(content);

        this.result.fixedContent = content = linter.verifyAndFix(content, eslintConfig).output;

        content = reindent(content, ismlIndentation);

        node.value = content + ismlIndentation.substring(4);
    }

    return GeneralUtils.applyActiveLinebreaks(node.toString());
};

const unindent = (content, indentSize) => {
    const lineArray = content.split(Constants.EOL);
    const result    = [];

    for (let i = 0; i < lineArray.length; i++) {
        const line = lineArray[i];

        result.push(line.substring(indentSize));
    }

    return result.join(Constants.EOL);
};

const reindent = (content, ismlIndentation) => {
    const lineArray = content.split(Constants.EOL);
    const result    = [];

    for (let i = 0; i < lineArray.length; i++) {
        const line = lineArray[i];

        result.push(line.trim() ? ismlIndentation + line : '');
    }

    return result.join(Constants.EOL);
};

const getIndentation = content => {
    const tempContent   = content.substring(1);
    const indentSize    = ParseUtils.getNextNonEmptyCharPos(tempContent);
    let ismlIndentation = '';

    for (let i = 0; i < indentSize; i = i + 1) {
        ismlIndentation += ' ';
    }

    return ismlIndentation;
};

module.exports = Rule;
