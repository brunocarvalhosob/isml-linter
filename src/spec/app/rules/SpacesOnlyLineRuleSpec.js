const SpecHelper = require('../../SpecHelper');
const specFileName = require('path').basename(__filename);
const rule = SpecHelper.getRule(specFileName);

describe(rule.name, () => {
    beforeEach(() => {
        SpecHelper.beforeEach();
    });

    afterEach(() => {
        SpecHelper.afterEach();
    });

    it('detects inadequate code', () => {
        const file = SpecHelper.getRuleSpecTemplate(rule, 0);
        const result = rule.check(file);

        expect(result.occurrences).not.toEqual([]);
    });

    it('ignores empty lines', () => {
        const file = SpecHelper.getRuleSpecTemplate(rule, 1);
        const result = rule.check(file);

        expect(result.occurrences).toEqual([]);
    });

    it('accepts good code', () => {
        const file = SpecHelper.getRuleSpecTemplate(rule, 2);
        const result = rule.check(file);

        expect(result.occurrences).toEqual([]);
    });
});
