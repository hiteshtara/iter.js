/* jshint globalstrict: true, curly: false */
'use strict';

var iter = window.iter;

describe('oneOrDefault', function() {
    it('given empty sequence returns defaultValue', function() {
        var result = iter([]).oneOrDefault(666);

        expect(result).toBe(666);
    });

    it('given sequence with single element returns that element', function() {
        var result = iter([1]).oneOrDefault(666);

        expect(result).toBe(1);
    });

    it('given sequence with more than one element throws exception', function() {
        expect(function() {
            iter([1,2,3]).oneOrDefault(666);
        }).toThrow();
    });

    it('given predicate that always returns false returns default value', function() {
        var result = iter([1,2,3])
            .oneOrDefault(666, function() { return false; });

        expect(result).toBe(666);
    });

    it('given predicate that returns true for exactly one element returns that element', function() {
        var result = iter([1,2,3])
            .oneOrDefault(666, function(v) { return (v === 2); });

        expect(result).toBe(2);
    });

    it('given predicate that returns true for more than one elemene throw exception', function() {
        expect(function() {
            iter([1,2,3,4,5])
                .oneOrDefault(666, function(v) { return ((v % 2) === 0); });
        }).toThrow();
    });

    it('context can be set for predicate', function() {
        var context = {}, $this;

        iter([1]).oneOrDefault(666, function() {
            $this = this;
            return false;
        }, context);

        expect($this).toBe(context);
    });
    
    it('predicate has two arguments index and current value', function() {
        var values = [], indexes = [];

        iter([1,2,3,4]).oneOrDefault(666, function(v, i) {
            values.push(v);
            indexes.push(i);
            return (v === 4);
        });

        expect(values).toEqual([1,2,3,4]);
        expect(indexes).toEqual([0,1,2,3]);
    });

    it('quick can be used as predicate', function() {
        var result = iter([1,2,103,4,7])
            .oneOrDefault(666, '$ > 100');

        expect(result).toBe(103);
    });
});
