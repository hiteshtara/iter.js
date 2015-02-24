/* jshint globalstrict: true, curly: false */
'use strict';

var iter = window.iter;

describe("all", function() {
    it("given empty sequence returns true", function() {
        var result = iter([]).all();

        expect(result).toBe(true);
    });

    it("given sequency with all truthy values returns last value", function() {
        var result = iter([1,2,3,4]).all();

        expect(result).toBe(4);
    });

    it("given sequence with at least one falsy value return false", function() {
        var result = iter([1,2,3,null,5]).all();

        expect(result).toBe(false);
    });

    it("given predicate that always returns true - returns last value", function() {
        var result = iter([1,2,3,4,5]).all(function() { return true; });

        expect(result).toBe(5);
    });

    it("given a predicate that at least once returns falsy value - returns false", function() {
        var result = iter([1,2,3,4,5])
            .all(function(x) { return x !== 3; });

        expect(result).toBe(false);
    });

    it("can be used with quick", function() {
        var result = iter([1,2,3,4,5]).all('$ > 0');

        expect(result).toBe(5);
    });
});


