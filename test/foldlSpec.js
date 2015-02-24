/* jshint globalstrict: true, curly: false */
'use strict';

var iter = window.iter;


describe("foldl", function() {
    var opPlus;

    beforeEach(function() {
        opPlus = function(acc, x) {
            return acc + x;
        };
    });

    it("given emtpy sequence returns seed", function() {
        var result = iter([]).foldl(7, opPlus);

        expect(result).toBe(7);
    });

    it("given sequence folds sequence and returns accumulator", function() {
        var result = iter([1,2,3,4]).foldl(0, opPlus);

        expect(result).toBe(10);
    });

    it("given sequence folds sequence and returns accumulator 2", function() {
        var result = iter([1,2,3,4]).foldl([], function(acc, x) { acc.push(x); return acc; });
        
        expect(result).toEqual([1,2,3,4]);
    });
});


