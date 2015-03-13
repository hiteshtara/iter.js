/* jshint globalstrict: true, curly: false */
'use strict';

var iter = window.iter;

describe('lastOrDefault', function() {
    it('given empty sequence returns default value', function() {
        var result = iter.empty().lastOrDefault(666);

        expect(result).toBe(666);
    });

    it('given non empty sequence returns last sequence value', function() {
        var result = iter([1,2,3,4]).lastOrDefault(666);

        expect(result).toBe(4);
    });

    it('given predicate returns last element of sequence satisfying the predicate', function() {
        var data = [{ foo: 1 }, { foo: 2 }, { foo: 2, bar: 1 }, { foo: 3 }];

        var result = iter(data)
            .lastOrDefault(666, function(x) { return x.foo === 2; });

        expect(result).toEqual({ foo: 2, bar: 1 });
    });

    it('given predicate that no element can satisfy returns default', function() {
        var data = [1,2,3,4];

        var result = iter(data)
            .lastOrDefault(666, function() { return false; });

        expect(result).toBe(666);
    });

    it('can accept quick', function() {
        var data = [{ foo: 1 }, { foo: 2 }, { foo: 3 }];

        var result = iter(data)
            .lastOrDefault(666, '$.foo === 2');

        expect(result).toEqual({ foo: 2 });
    });
    
    it('predicate has two parameters current value and index', function() {
        var values = [], indexes = [];

        iter([1,2,3]).lastOrDefault(666, function(v, i) {
            values.push(v);
            indexes.push(i);
            return (v === 3);
        });

        expect(values).toEqual([1,2,3]);
        expect(indexes).toEqual([0,1,2]);
    });

    it('context can be set for predicate', function() {
        var context = {}, $this = null;

        iter([1,2,3]).lastOrDefault(666, function() {
            $this = this;
            return true;
        }, context);

        expect($this).toBe(context);
    });
});
