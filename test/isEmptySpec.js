/* jshint globalstrict: true, curly: false */
'use strict';

var iter = window.iter;

describe('isEmpty', function() {
    it('given empty sequence returns true', function() {
        var result = iter([]).isEmpty();

        expect(result).toBe(true);
    });

    it('given non empty sequence returns false', function() {
        var result = iter([1,2,3]).isEmpty();

        expect(result).toBe(false);
    });

    it('evaluates at most single sequence element', function() {
        var evaluatedElementsCount = 0;

        iter.stateless(function() {
            evaluatedElementsCount++;
            return (evaluatedElementsCount < 100 ? 'ok' : undefined);
        }).isEmpty();

        expect(evaluatedElementsCount).toBe(1);
    });
});
