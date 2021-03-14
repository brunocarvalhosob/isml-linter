const SpecHelper   = require('../../../SpecHelper');
const specFileName = require('path').basename(__filename);

const rule            = SpecHelper.getRule(specFileName);
const isCrlfLineBreak = true;

describe(rule.id, () => {
    beforeEach(() => {
        SpecHelper.beforeEach();
    });

    afterEach(() => {
        SpecHelper.afterEach();
    });

    it('detects unresolved conflict', () => {
        const templateContent = SpecHelper.getRuleSpecTemplateContent(rule, 0);
        const result          = rule.check(templateContent, { isCrlfLineBreak });

        expect(result.occurrenceList).not.toEqual([]);
    });

    it('accepts code that is not related to the rule', () => {
        const templateContent = SpecHelper.getRuleSpecTemplateContent(rule, 1);
        const result          = rule.check(templateContent, { isCrlfLineBreak });

        expect(result.occurrenceList).toEqual([]);
    });

    it('detects position and length of space-only lines', () => {
        const templateContent = SpecHelper.getRuleSpecTemplateContent(rule, 0);
        const result          = rule.check(templateContent, { isCrlfLineBreak });
        const occurrence1     = result.occurrenceList[0];
        const occurrence2     = result.occurrenceList[1];

        expect(occurrence1.line        ).toEqual('<<<<<<< HEAD');
        expect(occurrence1.lineNumber  ).toEqual(1);
        expect(occurrence1.columnNumber).toEqual(1);
        expect(occurrence1.globalPos   ).toEqual(0);
        expect(occurrence1.length      ).toEqual(12);
        expect(occurrence1.rule        ).toEqual(rule.id);
        expect(occurrence1.message     ).toEqual(rule.description);

        expect(occurrence2.line        ).toEqual('=======');
        expect(occurrence2.lineNumber  ).toEqual(3);
        expect(occurrence1.columnNumber).toEqual(1);
        expect(occurrence2.globalPos   ).toEqual(27);
        expect(occurrence2.length      ).toEqual(7);
        expect(occurrence2.rule        ).toEqual(rule.id);

        expect(result.occurrenceList.length).toEqual(2);
    });
});
