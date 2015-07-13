/* jshint globalstrict: true, curly: false */
'use strict';

var iter = window.iter;

describe("every", function() {
    it("given empty sequence returns true", function() {
        var result = iter([]).every();

        expect(result).toBe(true);
    });

    it("given sequence with every truthy values returns true", function() {
        var result = iter([1,2,3,4]).every();

        expect(result).toBe(true);
    });

    it("given sequence with at least one falsy value returns false", function() {
        var result1 = iter([1,2,3,null,5]).every();
        var result2 = iter([1,2,0,3,4]).every();

        expect(result1).toBe(false);
        expect(result2).toBe(false);
    });

    it("given predicate that always returns true - returns true", function() {
        var result = iter([1,2,3,4,5])
            .every(function() { return true; });

        expect(result).toBe(true);
    });

    it("given a predicate that at least once returns false - returns false", function() {
        var result = iter([1,2,3,4,5])
            .every(function(x) { return x !== 3; });

        expect(result).toBe(false);
    });

    it("predicate can have two parameters current value and index", function() {
        var values = [], indexes = [];

        iter(['foo', 'bar', 'nyu'])
            .every(function(v,i) { values.push(v); indexes.push(i); return true; });

        expect(values).toEqual(['foo', 'bar', 'nyu']);
        expect(indexes).toEqual([0,1,2]);
    });

    it("this context can be set for predicate", function() {
        var $this;
        var context = {};

        iter([1])
            .every(function() { $this = this; return true; }, context);

        expect($this).toBe(context);
    });

    it("stops iterations after seeing falsy value", function() {
        var data = [1,2,3,null,7,0];
        var iterations = 0;

        iter.stateless(function() { iterations += 1; return data.shift(); })
            .every();

        expect(iterations).toBe(4);
    });

    it("quick can be used as predicate", function() {
        var result1 = iter([1,2,3,4,5]).every('$ !== 0');
        expect(result1).toBe(true);

        var result2 = iter([1,2,3,4,5]).every('$ === 3');
        expect(result2).toBe(false);
    });

    it("quick have two parameters $ and $index", function() {
        var result1 = iter([1,2,3,4,5]).every('$ > $index');
        expect(result1).toBe(true);

        var result2 = iter([1,2,3,4]).every('$index < 2');
        expect(result2).toBe(false);
    });
});
