/* jshint globalstrict: true, curly: false */
'use strict';

var iter = window.iter;

describe("some", function() {
    it("given empty sequence returns false", function() {
        var result = iter([]).some();

        expect(result).toBe(false);
    });

    it("given non empty sequence containing all falsy values return false", function() {
        var result = iter([undefined, null, 0, '', false]).some();

        expect(result).toBe(false);
    });

    it("given non empty sequence containing at least one truthy value returns true", function() {
        var result = iter([null, 0, 314, '', false]).some();

        expect(result).toBe(true);
    });

    it("given predicate that always returns false returns false", function() {
        var result = iter([1,2,3,4,5])
            .some(function(x) { return x === 777; });

        expect(result).toBe(false);
    });

    it("given predicate that at least once returns true returns true", function() {
        var result = iter([1,2,3,4,5])
            .some(function(x) { return x === 3; });

        expect(result).toBe(true);
    });

    it("predicate can have two prameters current object($) and index ($index)", function() {
        var objects = [], indexes = [];

        iter([1,2,3,4]).some(function($, $index) {
            objects.push($);
            indexes.push($index);
            return false;
        });

        expect(objects).toEqual([1,2,3,4]);
        expect(indexes).toEqual([0,1,2,3]);
    });

    it("stops iteration after seeing truthy value", function() {
        var iterations = 0;
        var data = [null, 0, 3, false, 33];

        iter(function() { iterations += 1; return data.shift(); })
            .some();
        
        expect(iterations).toBe(3);
    });

    it("this context can be set for predicate", function() {
        var $this;
        var context = {};

        iter([1])
            .some(function() { $this = this; return true; }, context);

        expect($this).toBe(context);
    });

    it("can be used with quick", function() {
        var result = iter([1,2,3,4,5])
            .some('$ % 3 === 2');

        expect(result).toBe(true);
    });

    it("quick have two parameters current object($) and index($index)", function() {
        var result = iter([1,2,3,4])
            .some('($index + $) === 7');

        expect(result).toBe(true);
    });
});

