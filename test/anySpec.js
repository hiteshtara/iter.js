/* jshint globalstrict: true, curly: false */
'use strict';

var iter = window.iter;

describe("any", function() {
    it("given empty sequence returns false", function() {
        var result = iter([]).any();

        expect(result).toBe(false);
    });

    it("given non empty sequence containing all falsy values return false", function() {
        var result = iter([undefined, null, 0, '', false]).any();

        expect(result).toBe(false);
    });

    it("given non empty sequence containing at " +
       "least single truthy value returns that value", function() {
        var result = iter([null, 0, 314, '', false]).any();

        expect(result).toBe(314);
    });

    it("given predicate returns first element that fulfills " + 
       "predicate", function() {
    
        var result = iter([1,2,3,4,5])
            .any(function(x) { return x === 3; });

        expect(result).toBe(3);
    });

    it("no value fulfills predicate - returns false", function() {
        var result = iter(['foo', 'bar'])
            .any(function() { return 0; });

        expect(result).toBe(false);
    });

    it("can be used with quick", function() {
        var result = iter([1,2,3,4,5]).any('$ % 3 == 2');

        expect(result).toBe(2);
    });
});

