/* jshint globalstrict: true, curly: false */
'use strict';

var iter = window.iter;


describe("reduce", function() {
    var opPlus;

    beforeEach(function() {
        opPlus = function(acc, x) {
            return acc + x;
        };
    });

    it("given emtpy sequence returns seed", function() {
        var result = iter([]).reduce(7, opPlus);

        expect(result).toBe(7);
    });

    it("given sequence reduces sequence and returns accumulator", function() {
        var result = iter([1,2,3,4]).reduce(0, opPlus);

        expect(result).toBe(10);
    });

    it("given sequence reduces sequence and returns accumulator 2", function() {
        var result = iter([1,2,3,4]).reduce([], function(acc, x) { acc.push(x); return acc; });
        
        expect(result).toEqual([1,2,3,4]);
    });

    it("context can be set for reduce function", function() {
        var context = {}, $this;

        iter([1]).reduce(0, function() { 
            $this = this;
            return 0;
        }, context);

        expect($this).toBe(context);
    });

    it("quick can be used as reduce function", function() {
        var result = iter([1,2,3,4]).reduce(0, '$acc + $');

        expect(result).toBe(10);
    });
});


