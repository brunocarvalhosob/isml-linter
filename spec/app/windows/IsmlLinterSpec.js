const path = require('path');
const glob = require('glob');
// const fs                   = require('fs');
const SpecHelper           = require('../../SpecHelper');
const IsmlLinter           = require('../../../src/IsmlLinter');
const Constants            = require('../../../src/Constants');
const NoSpaceOnlyLinesRule = require('../../../src/rules/line_by_line/no-space-only-lines');
const NoInlineStyleRule    = require('../../../src/rules/line_by_line/no-inline-style');
const EnforceIsprintRule   = require('../../../src/rules/line_by_line/enforce-isprint');
const ExceptionUtils       = require('../../../src/util/ExceptionUtils');
const ConfigUtils          = require('../../../src/util/ConfigUtils');

const specSpecificDirLinterTemplate    = Constants.specSpecificDirLinterTemplate;
const specUnparseableDirLinterTemplate = Constants.specUnparseableDirLinterTemplate;
const specIgnoreDirLinterTemplateDir   = Constants.specIgnoreDirLinterTemplateDir;
const specFilenameTemplate             = Constants.specFilenameTemplate;
const UNPARSEABLE                      = ExceptionUtils.types.INVALID_TEMPLATE;
const unparseableTemplatePath          = path.join(specSpecificDirLinterTemplate, 'template_0.isml');
const template0Path                    = path.join(specSpecificDirLinterTemplate, 'template_1.isml');
const template1Path                    = path.join(specSpecificDirLinterTemplate, 'template_2.isml');
const isCrlfLineBreak                  = true;

const targetObjName = SpecHelper.getTargetObjName(__filename);

describe(targetObjName, () => {
    beforeEach(() => {
        SpecHelper.beforeEach();
    });

    afterEach(() => {
        SpecHelper.afterEach();
    });

    it('lints ISML templates in a given directory', () => {
        ConfigUtils.setConfig('ignoreUnparseable', false);
        ConfigUtils.setRuleConfig('one-element-per-line', {
            except: ['non-tag']
        });

        const result           = IsmlLinter.run(specSpecificDirLinterTemplate, null, { isCrlfLineBreak });
        const isprintError0    = result.errors[EnforceIsprintRule.id][template0Path][0];
        const isprintError1    = result.errors[EnforceIsprintRule.id][template1Path][0];
        const inlineStyleError = result.errors[NoInlineStyleRule.id][template0Path][0];
        const blankLineError   = result.errors[NoSpaceOnlyLinesRule.id][template0Path][0];

        expect(isprintError0.line       ).toEqual('<div style="display: none;">${addToCartUrl}</div>');
        expect(isprintError0.lineNumber ).toEqual(1);
        expect(isprintError0.globalPos  ).toEqual(28);
        expect(isprintError0.length     ).toEqual(15);
        expect(isprintError0.rule       ).toEqual(EnforceIsprintRule.id);
        expect(isprintError0.message    ).toEqual(EnforceIsprintRule.description);

        expect(isprintError1.line       ).toEqual(' ${URLUtils.https(\'Reorder-ListingPage\')}');
        expect(isprintError1.lineNumber ).toEqual(1);
        expect(isprintError1.globalPos  ).toEqual(1);
        expect(isprintError1.length     ).toEqual(40);
        expect(isprintError1.rule       ).toEqual(EnforceIsprintRule.id);
        expect(isprintError1.message    ).toEqual(EnforceIsprintRule.description);

        expect(inlineStyleError.line       ).toEqual('<div style="display: none;">${addToCartUrl}</div>');
        expect(inlineStyleError.lineNumber ).toEqual(1);
        expect(inlineStyleError.globalPos  ).toEqual(5);
        expect(inlineStyleError.length     ).toEqual(5);
        expect(inlineStyleError.rule       ).toEqual(NoInlineStyleRule.id);
        expect(inlineStyleError.message    ).toEqual(NoInlineStyleRule.description);

        expect(blankLineError.line       ).toEqual('   ');
        expect(blankLineError.lineNumber ).toEqual(2);
        expect(blankLineError.globalPos  ).toEqual(51);
        expect(blankLineError.length     ).toEqual(4);
        expect(blankLineError.rule       ).toEqual(NoSpaceOnlyLinesRule.id);
        expect(blankLineError.message    ).toEqual(NoSpaceOnlyLinesRule.description);

        expect(result[UNPARSEABLE][0].templatePath ).toEqual(unparseableTemplatePath);
        expect(result[UNPARSEABLE][0].message      ).toEqual('Unbalanced <div> element');
        expect(result[UNPARSEABLE][0].lineNumber   ).toEqual(2);
        expect(result.issueQty                     ).toEqual(5);
    });

    it('lints ISML templates in a given array of template paths', () => {
        ConfigUtils.setConfig('ignoreUnparseable', false);
        ConfigUtils.setRuleConfig('one-element-per-line', {
            except: ['non-tag']
        });

        const templatePathArray = glob.sync('spec/templates/default/isml_linter/specific_directory_to_be_linted/**/*.isml');
        const result            = IsmlLinter.run(templatePathArray, null, { isCrlfLineBreak });
        const isprintError0     = result.errors[EnforceIsprintRule.id][template0Path][0];
        const isprintError1     = result.errors[EnforceIsprintRule.id][template1Path][0];
        const inlineStyleError  = result.errors[NoInlineStyleRule.id][template0Path][0];
        const blankLineError    = result.errors[NoSpaceOnlyLinesRule.id][template0Path][0];

        expect(isprintError0.line       ).toEqual('<div style="display: none;">${addToCartUrl}</div>');
        expect(isprintError0.lineNumber ).toEqual(1);
        expect(isprintError0.globalPos  ).toEqual(28);
        expect(isprintError0.length     ).toEqual(15);
        expect(isprintError0.rule       ).toEqual(EnforceIsprintRule.id);
        expect(isprintError0.message    ).toEqual(EnforceIsprintRule.description);

        expect(isprintError1.line       ).toEqual(' ${URLUtils.https(\'Reorder-ListingPage\')}');
        expect(isprintError1.lineNumber ).toEqual(1);
        expect(isprintError1.globalPos  ).toEqual(1);
        expect(isprintError1.length     ).toEqual(40);
        expect(isprintError1.rule       ).toEqual(EnforceIsprintRule.id);
        expect(isprintError1.message    ).toEqual(EnforceIsprintRule.description);

        expect(inlineStyleError.line       ).toEqual('<div style="display: none;">${addToCartUrl}</div>');
        expect(inlineStyleError.lineNumber ).toEqual(1);
        expect(inlineStyleError.globalPos  ).toEqual(5);
        expect(inlineStyleError.length     ).toEqual(5);
        expect(inlineStyleError.rule       ).toEqual(NoInlineStyleRule.id);
        expect(inlineStyleError.message    ).toEqual(NoInlineStyleRule.description);

        expect(blankLineError.line       ).toEqual('   ');
        expect(blankLineError.lineNumber ).toEqual(2);
        expect(blankLineError.globalPos  ).toEqual(51);
        expect(blankLineError.length     ).toEqual(4);
        expect(blankLineError.rule       ).toEqual(NoSpaceOnlyLinesRule.id);
        expect(blankLineError.message    ).toEqual(NoSpaceOnlyLinesRule.description);

        expect(result[UNPARSEABLE][0].templatePath ).toEqual(unparseableTemplatePath);
        expect(result[UNPARSEABLE][0].message      ).toEqual('Unbalanced <div> element');
        expect(result[UNPARSEABLE][0].lineNumber   ).toEqual(2);
        expect(result.issueQty                     ).toEqual(5);
    });

    it('ignores templates under the node_modules/ directory', () => {
        const result       = IsmlLinter.run(specSpecificDirLinterTemplate, null, { isCrlfLineBreak });
        const stringResult = JSON.stringify(result);

        expect(stringResult.indexOf('node_modules')).toBe(-1);
    });

    it('processes the correct line in result json data', () => {
        const result = IsmlLinter.run(specSpecificDirLinterTemplate, null, { isCrlfLineBreak });

        expect(result.errors[EnforceIsprintRule.id][template0Path][0].line   ).toEqual('<div style="display: none;">${addToCartUrl}</div>');
        expect(result.errors[EnforceIsprintRule.id][template1Path][0].line   ).toEqual(' ${URLUtils.https(\'Reorder-ListingPage\')}');
        expect(result.errors[NoInlineStyleRule.id][template0Path][0].line    ).toEqual('<div style="display: none;">${addToCartUrl}</div>');
        expect(result.errors[NoSpaceOnlyLinesRule.id][template0Path][0].line ).toEqual('   ');
    });

    it('does not consider errors in directories defined to be ignored in the config file', () => {
        const lintResult = IsmlLinter.run(specIgnoreDirLinterTemplateDir, null, { isCrlfLineBreak });
        const result     = JSON.stringify(lintResult);

        expect(result.indexOf('this_directory_is_to_be_ignored')).toEqual(-1);
    });

    it('does not consider errors in templates defined to be ignored in the config file', () => {
        const lintResult = IsmlLinter.run(specIgnoreDirLinterTemplateDir, null, { isCrlfLineBreak });
        const result     = JSON.stringify(lintResult);

        expect(result.indexOf('Email.isml')).toEqual(-1);
    });

    it('considers errors in templates not defined to be ignored in the config file', () => {
        const lintResult = IsmlLinter.run(specIgnoreDirLinterTemplateDir, null, { isCrlfLineBreak });
        const result     = JSON.stringify(lintResult);

        expect(result.indexOf('this_directory_should_be_tested')).not.toEqual(-1);
    });

    it('parses templates only under a given directory', () => {
        const lintResult = IsmlLinter.run(specIgnoreDirLinterTemplateDir, null, { isCrlfLineBreak });
        const result     = JSON.stringify(lintResult);

        expect(result.indexOf('this_directory_is_to_be_ignored')).toEqual(-1);
    });

    it('lists invalid templates as "unparseable"', () => {
        const result          = IsmlLinter.run(specSpecificDirLinterTemplate, null, { isCrlfLineBreak });
        const expectedMessage = ExceptionUtils.unbalancedElementError('div', 2).message;
        const actualResult    = result[UNPARSEABLE][0];
        const templatePath    = path.join(specSpecificDirLinterTemplate, 'template_0.isml');

        expect(actualResult.templatePath ).toEqual(templatePath);
        expect(actualResult.message      ).toEqual(expectedMessage);
        expect(actualResult.lineNumber   ).toEqual(2);
    });

    it('accepts template absolute path as parameter', () => {
        ConfigUtils.setConfig('ignoreUnparseable', false);

        const absoluteTemplatePath = path.join(Constants.clientAppDir, specSpecificDirLinterTemplate, 'template_0.isml');
        const result               = IsmlLinter.run(absoluteTemplatePath, null, { isCrlfLineBreak });
        const expectedMessage      = ExceptionUtils.unbalancedElementError('div', 2).message;
        const actualResult         = result[UNPARSEABLE][0];

        expect(actualResult.templatePath ).toEqual(absoluteTemplatePath);
        expect(actualResult.message      ).toEqual(expectedMessage);
        expect(actualResult.lineNumber   ).toEqual(2);
    });

    // it('applies fixes for tree-based rules', () => {
    //     ConfigUtils.load({
    //         autoFix: true,
    //         rules: {
    //             'one-element-per-line': {}
    //         }
    //     });

    //     const templatePath    = path.join(Constants.clientAppDir, specSpecificDirLinterTemplate, 'template_1.isml');
    //     const originalContent = fs.readFileSync(templatePath, 'utf-8');
    //     const result          = IsmlLinter.run(templatePath, null, { isCrlfLineBreak });

    //     expect(result.templatesFixed).toEqual(1);
    //     fs.writeFileSync(templatePath, originalContent);
    // });

    it('lists inconsistent filenames', () => {
        ConfigUtils.load({ rules: { 'lowercase-filename': {} } });

        const rule    = require('../../../src/rules/line_by_line/lowercase-filename');
        const dirPath = path.join(Constants.clientAppDir, specFilenameTemplate);
        const result  = IsmlLinter.run(dirPath, null, { isCrlfLineBreak });
        const error   = result.errors[rule.id][path.join(dirPath, 'camelCaseTemplate.isml')][0];

        expect(error.line                           ).toEqual('');
        expect(error.lineNumber                     ).toEqual(0);
        expect(error.globalPos                      ).toEqual(0);
        expect(error.length                         ).toEqual(7);
        expect(error.rule                           ).toEqual(rule.id);
        expect(error.message                        ).toEqual(rule.description);
        expect(result[ExceptionUtils.UNKNOWN_ERROR] ).toBe(undefined);
    });

    it('lints ISML templates under "rootDir" config directory', () => {
        const rootDirName        = 'directory_1';
        const rootDirSiblingName = 'directory_2';
        const ruleID             = 'no-space-only-lines';
        const rootDir            = path.join('.', Constants.specConfigTemplate, rootDirName);

        ConfigUtils.load({
            rootDir,
            rules: { 'no-space-only-lines': {} }
        });

        const result       = IsmlLinter.run(undefined, null, { isCrlfLineBreak });
        const ruleErrorObj = result.errors[ruleID];

        for (const templatePath in ruleErrorObj) {
            expect(templatePath).toContain(rootDirName);
            expect(templatePath).not.toContain(rootDirSiblingName);
        }
    });

    it('accepts a single-file-to-be-linted as parameter', () => {
        const paramPath     = path.join('spec', 'templates', 'default', 'isml_linter', 'specific_directory_to_be_linted', 'template_1.isml');
        const filePathArray = [paramPath];
        const result        = IsmlLinter.run(filePathArray, null, { isCrlfLineBreak });

        for (const ruleID in result.errors) {
            const ruleErrorObj = result.errors[ruleID];
            for (const templatePath in ruleErrorObj) {
                expect(templatePath).toEqual(paramPath);
            }
        }
    });

    it('accepts a directory-to-be-linted as parameter', () => {
        const paramPath     = path.join('spec', 'templates', 'default', 'isml_linter', 'specific_directory_to_be_linted');
        const filePathArray = [paramPath];
        const result        = IsmlLinter.run(filePathArray, null, { isCrlfLineBreak });

        for (const ruleID in result.errors) {
            const ruleErrorObj = result.errors[ruleID];
            for (const templatePath in ruleErrorObj) {
                expect(templatePath).toContain(paramPath);
            }
        }
    });

    it('runs over configured or default directory if no parameter is passed', () => {
        const result = IsmlLinter.run(undefined, null, { isCrlfLineBreak });

        expect(result.issueQty).toBeGreaterThan(0);
    });

    it('runs over configured or default directory if an empty array is passed as a parameter', () => {
        const result = IsmlLinter.run([], null, { isCrlfLineBreak });

        expect(result.issueQty).toBeGreaterThan(0);
    });

    it('correctly processes custom tags', () => {
        ConfigUtils.load({
            rootDir : 'spec/templates/default/util/',
            rules: { 'custom-tags': {} }
        });
        const result = IsmlLinter.run(undefined, null, { isCrlfLineBreak });

        expect(Array.isArray(result.errors['custom-tags'])).toBe(false);
        expect(Array.isArray(result.errors['custom-tags']['modules.isml'])).toBe(true);
    });

    it('raises no parse errors if "ignoreUnparseable" option is set to false', () => {
        ConfigUtils.setConfig('ignoreUnparseable', false);

        const results = IsmlLinter.run(specUnparseableDirLinterTemplate, null, { isCrlfLineBreak });

        expect(results.issueQty).toEqual(1);
        expect(results.INVALID_TEMPLATE.length).toEqual(1);
    });

    it('raises parse errors if "ignoreUnparseable" option is set to true', () => {
        ConfigUtils.setConfig('ignoreUnparseable', true);

        const results = IsmlLinter.run(specUnparseableDirLinterTemplate, null, { isCrlfLineBreak });

        expect(results.issueQty).toEqual(0);
        expect(results.INVALID_TEMPLATE.length).toEqual(0);
    });
});
