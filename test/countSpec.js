/* jshint globalstrict: true, curly: false */
'use strict';

var iter = window.iter;

describe("count", function() {
    it("count given empty sequence return zero", function() {
        var result = iter([]).count();

        expect(result).toBe(0);
    });

    it("count given sequence with 2 elements returns 2", function() {
        var result = iter([1,2]).count();

        expect(result).toBe(2);
    });

    it("given predicate returns number of elements fulfilling predicate", function() {
        var result = iter([1,2,3,4,5]).count('$ % 2 === 0');

        expect(result).toBe(2);
    });

    it("count accepts quick and functions", function() {
        var qResult = iter([1,2,3,4]).count('$ > 2');
        var fResult = iter([1,2,3,4]).count(function(x) { return x > 2; });

        expect(qResult).toBe(2);
        expect(fResult).toBe(2);
    });

    it("predicate returns always false - returns zero", function() {
        var result = iter([1,2,3,4]).count('$ && false');

        expect(result).toBe(0);
    });
});


