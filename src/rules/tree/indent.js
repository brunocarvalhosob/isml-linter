const TreeRulePrototype = require('../prototypes/TreeRulePrototype');
const ParseUtils        = require('../../isml_tree/ParseUtils');
const Constants         = require('../../Constants');

const ruleId      = require('path').basename(__filename).slice(0, -3);
const description = 'Line incorrectly indented';

const Rule = Object.create(TreeRulePrototype);

Rule.init(ruleId, description);

Rule.getDefaultAttrs = () => {
    return {
        size : 4
    };
};

Rule.getIndentation = function(depth = 1) {
    const indentationSize = this.getConfigs().size * depth;
    let indentation       = '';

    for (let i = 0; i < indentationSize; ++i) {
        indentation += ' ';
    }

    return indentation;
};

Rule.isBroken = function(node) {

    const configIndentSize              = this.getConfigs().size;
    const expectedIndentation           = getExpectedIndentation(node, configIndentSize);
    const actualIndentation             = getActualIndentation(node);
    const previousSibling               = node.getPreviousSibling();
    const isInSameLineAsPreviousSibling = previousSibling && previousSibling.lineNumber === node.lineNumber;

    return !node.isRoot() &&
        !node.isMulticlause() &&
        !node.isEmpty() &&
        !node.isInSameLineAsParent() &&
        expectedIndentation !== actualIndentation &&
        !isInSameLineAsPreviousSibling;
};

Rule.isBrokenForSuffix = function(node) {

    const configIndentSize              = this.getConfigs().size;
    const expectedIndentation           = getExpectedIndentation(node, configIndentSize);
    const actualIndentation             = getActualIndentation(node);
    const previousSibling               = node.getPreviousSibling();
    const isInSameLineAsPreviousSibling = previousSibling && previousSibling.lineNumber === node.lineNumber;

    return !node.isRoot() &&
        !node.isMulticlause() &&
        !node.isEmpty() &&
        !node.isInSameLineAsParent() &&
        expectedIndentation !== actualIndentation &&
        !isInSameLineAsPreviousSibling;
};

Rule.check = function(node, result) {

    this.result = result || {
        occurrences : []
    };

    if (node.isRoot() || !node.parent.isOfType('script')) {
        for (let i = 0; i < node.children.length; i++) {
            this.check(node.children[i], this.result);
        }

        const config    = this.getConfigs();
        const globalPos = node.globalPos - getActualIndentation(node);

        // Checks node value;
        if (this.isBroken(node)) {
            const configIndentSize    = this.getConfigs().size;
            const expectedIndentation = getExpectedIndentation(node, configIndentSize);
            const actualIndentation   = getActualIndentation(node);
            const nodeValue           = node.value.trim();
            const occurrenceLength    = actualIndentation === 0 ?
                nodeValue.length +  ParseUtils.getLineBreakQty(nodeValue) :
                getActualIndentation(node);

            this.add(
                node.value.trim(),
                node.lineNumber - 1,
                globalPos,
                occurrenceLength,
                getOccurrenceDescription(expectedIndentation, actualIndentation)
            );
        }

        // Checks node suffix value;
        if (node.suffixValue && this.isBrokenForSuffix(node)) {
            const configIndentSize    = this.getConfigs().size;
            const expectedIndentation = getExpectedIndentation(node, configIndentSize);
            const actualIndentation   = getActualIndentation(node);
            const nodeSuffixValue     = node.suffixValue.trim();
            const occurrenceLength    = actualIndentation === 0 ?
                nodeSuffixValue.length +  ParseUtils.getLineBreakQty(nodeSuffixValue) :
                getActualIndentationForSuffix(node);
            const suffixGlobalPos     = node.suffixGlobalPos - getActualIndentationForSuffix(node);

            this.add(
                node.suffixValue.trim(),
                node.suffixLineNumber - 1,
                suffixGlobalPos,
                occurrenceLength,
                getOccurrenceDescription(expectedIndentation, actualIndentation)
            );
        }

        if (this.result.occurrences.length &&
            config.autoFix &&
            this.getFixedContent &&
            node.isRoot()
        ) {
            this.result.fixedContent = this.getFixedContent(node);
        }
    }

    return this.result;
};

Rule.getFixedContent = node => {
    if (node.isRoot() || !node.parent.isOfType('script')) {
        removeAllIndentation(node);
        addCorrectIndentation(node);
    }

    return node.toString();
};

const removeIndentation = content => {
    const startingPos            = ParseUtils.getNextNonEmptyCharPos(content);
    const endingPos              = content.length - ParseUtils.getNextNonEmptyCharPos(content.split('').reverse().join(''));
    const fullLeadingContent     = content.substring(0, startingPos);
    const actualContent          = content.substring(startingPos, endingPos);
    const preLineBreakContent    = fullLeadingContent.substring(0, fullLeadingContent.lastIndexOf(Constants.EOL) + 1);
    const fullTrailingContent    = content.substring(endingPos);
    const lastLineBreakPos       = fullTrailingContent.lastIndexOf(Constants.EOL);
    const trimmedTrailingContent = lastLineBreakPos === -1 ?
        fullTrailingContent :
        fullTrailingContent.substring(0, lastLineBreakPos + 1);

    return preLineBreakContent + actualContent + trimmedTrailingContent;
};

const addIndentation = (content, node) => {
    const startingPos         = ParseUtils.getNextNonEmptyCharPos(content);
    const endingPos           = content.length - ParseUtils.getNextNonEmptyCharPos(content.split('').reverse().join(''));
    const fullLeadingContent  = content.substring(0, startingPos);
    const actualContent       = content.substring(startingPos, endingPos);
    const preLineBreakContent = fullLeadingContent.substring(0, fullLeadingContent.lastIndexOf(Constants.EOL) + 1);
    const fullTrailingContent = content.substring(endingPos);
    const correctIndentation  = node.isInSameLineAsParent() ? '' : Rule.getIndentation(node.depth - 1);

    return preLineBreakContent + correctIndentation + actualContent + fullTrailingContent;
};

const removeAllIndentation = node => {
    if (!node.isRoot() && !node.isMulticlause()) {
        if (node.value) {
            node.value = removeIndentation(node.value);
        }

        if (node.suffixValue) {
            node.suffixValue = removeIndentation(node.suffixValue);
        }
    }

    for (let i = 0; i < node.children.length; i++) {
        removeAllIndentation(node.children[i]);
    }
};

const addCorrectIndentation = node => {
    if (!node.isRoot() && !node.isMulticlause()) {
        const shouldAddIndentationToValue  = checkIfShouldAddIndentationToValue(node);
        const shouldAddIndentationToSuffix = checkIfShouldAddIndentationToSuffix(node);

        if (shouldAddIndentationToValue) {
            node.value = addIndentation(node.value, node);
        }

        if (shouldAddIndentationToSuffix) {
            node.suffixValue = addIndentation(node.suffixValue, node);
        }
    }

    for (let i = 0; i < node.children.length; i++) {
        addCorrectIndentation(node.children[i]);
    }
};

const checkIfShouldAddIndentationToValue = node => {
    const previousSibling                   = node.getPreviousSibling();
    const parentValueEndLineNumber          = node.parent ? node.parent.lineNumber + ParseUtils.getLineBreakQty(node.parent.value.trim()) : -1;
    const isInSameLineAsPrevSiblingLastLine = !node.isRoot() &&
        previousSibling &&
        node.lineNumber === previousSibling.getLastLineNumber();
    const isInSameLineAsParentValueEnd      = parentValueEndLineNumber === node.lineNumber && !node.parent.isMulticlause();

    const shouldAdd = !node.isRoot() &&
        !isInSameLineAsPrevSiblingLastLine &&
        !isInSameLineAsParentValueEnd &&
        (node.isFirstChild() || previousSibling && node.lineNumber !== previousSibling.lineNumber) &&
        node.value && node.lineNumber !== node.parent.parentValueEndLineNumber;

    return shouldAdd;
};

const checkIfShouldAddIndentationToSuffix = node => {
    const hasSuffix                 = !!node.suffixValue;
    const isLastClause              = !!node.parent && node.parent.isMulticlause() && !node.isLastChild();
    const isInSameLineAsChild       = !node.hasChildren() || node.getLastChild().isInSameLineAsParent();
    const isSuffixInSameLineAsChild = !node.hasChildren() || node.suffixLineNumber === node.getLastChild().getLastLineNumber();
    const isBrokenIntoMultipleLines = !node.hasChildren() && node.suffixLineNumber !== -1 && node.lineNumber !== node.suffixLineNumber;

    const shouldAdd = hasSuffix &&
        !isSuffixInSameLineAsChild &&
        !isInSameLineAsChild &&
        !isLastClause
    ||
        isBrokenIntoMultipleLines;

    return shouldAdd;
};

const getOccurrenceDescription      = (expected, actual) => `Expected indentation of ${expected} spaces but found ${actual}`;
const getExpectedIndentation        = (node, configIndentSize) => (node.depth - 1) * configIndentSize;
const getActualIndentation          = node => node.getIndentationSize();
const getActualIndentationForSuffix = node => node.getSuffixIndentationSize();

module.exports = Rule;
