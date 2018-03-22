const appRoot = require('app-root-path');
const reqlib = appRoot.require;
const FileParser = reqlib('/src/app/FileParser');
const SpecHelper = reqlib('/src/spec/SpecHelper');
const Constants = reqlib('/src/app/Constants');
const LogicInTemplateRule = reqlib('/src/app/rules/LogicInTemplateRule');
const DisplayNoneRule = reqlib('/src/app/rules/DisplayNoneRule');

const specTempDir = Constants.specTempDir;
const outputFilePath = Constants.specOutputFilePath;
const fileName = Constants.fileParserSpecDir + 'sample_file.isml';

describe('FileParser', () => {

    beforeEach(() => {
        FileParser.cleanOutput();
        SpecHelper.beforeEach();
    });

    afterEach(() => {
        SpecHelper.afterEach();
    });

    it('correctly parses a given ISML file', () => {
        FileParser.parse(fileName);

        expect(FileParser.getOutput()).not.toEqual({});
    });

    it('cleans output', () => {
        FileParser.cleanOutput();

        expect(FileParser.getOutput()).toEqual({});
    });

    it('saves output to file', () => {
        FileParser.parse(fileName);
        FileParser.saveToFile(specTempDir);

        const outputFile = reqlib('/' + outputFilePath);
        const expectedResult = expectedResultObj('errors');

        expect(outputFile).toEqual(expectedResult);
    });

    it('ignores disabled rules', () => {
        FileParser.parse(fileName);
        FileParser.saveToFile(specTempDir);
        const outputFile = reqlib('/' + outputFilePath);
        let ruleWasChecked = false;

        Object.keys(outputFile.errors).forEach( rule => {
            if (rule === LogicInTemplateRule.title) {
                ruleWasChecked = true;
            }
        });

        expect(ruleWasChecked).toBe(false);
    });

    it('checks non-disabled rules', () => {
        FileParser.parse(fileName);
        FileParser.saveToFile(specTempDir);
        const outputFile = reqlib('/' + outputFilePath);
        let ruleWasChecked = false;

        Object.keys(outputFile.errors).forEach( rule => {
            if (rule === DisplayNoneRule.title) {
                ruleWasChecked = true;
            }
        });

        expect(ruleWasChecked).toBe(true);
    });

    it('saves linter compiled output to file', () => {
        // FileParser.parse(fileName);
        // FileParser.compileOutput(specTempDir);

        // const compiledOutputFile = reqlib('/' + compiledOutputFilePath);
        // const expectedResult = expectedCompiledOutputObj();

        // expect(compiledOutputFile).toEqual(expectedResult);
    });

    const expectedResultObj = type => {
        let result = {};

        result[type] = {
            'Use class "hidden"' : {
                'ec/templates/file_parser/sample_file.isml' : [
                    'Line 2: <div class="addToCartUrl" style="display: none;">${addToCartUrl}</div>' ]
            },
            'Wrap expression in <isprint> tag' : {
                'ec/templates/file_parser/sample_file.isml' : [
                    'Line 2: <div class="addToCartUrl" style="display: none;">${addToCartUrl}</div>' ]
            }
        };

        return result;
    };
});
