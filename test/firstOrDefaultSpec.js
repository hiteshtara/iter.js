/* jshint globalstrict: true, curly: false */
'use strict';

var iter = window.iter;

describe('firstOrDefault', function() {
    it('returns default value if sequence is empty', function() {
        var result = iter.empty().firstOrDefault(4);

        expect(result).toBe(4);
    });

    it('returns first value of non empty sequence', function() {
        var result = iter([1,2,3,4]).firstOrDefault(666);

        expect(result).toBe(1);
    });

    it('given predicate returns first element of sequence satisfying the predicate', function() {
        var data = [{ foo: 1 }, { foo: 2 }, { foo: 3 }];

        var result = iter(data)
            .firstOrDefault('default', function(x) { return x.foo === 2; });

        expect(result).toEqual({ foo: 2 });
    });

    it('given predicate that no element can satisfy return default value', function() {
        var data = [1,2,3,4];

        var result = iter(data)
            .firstOrDefault('default', function() { return false; });

        expect(result).toBe('default');
    });

    it('can accept quick', function() {
        var data = [{ foo: 1 }, { foo: 2 }, { foo: 3 }];

        var result = iter(data)
            .firstOrDefault(666, '$.foo === 2');

        expect(result).toEqual({ foo: 2 });
    });
    
    it('predicate has two parameters current value and index', function() {
        var values = [], indexes = [];

        iter([1,2,3]).firstOrDefault(666, function(v, i) {
            values.push(v);
            indexes.push(i);
            return (v === 3);
        });

        expect(values).toEqual([1,2,3]);
        expect(indexes).toEqual([0,1,2]);
    });

    it('context can be set for predicate', function() {
        var context = {}, $this = null;

        iter([1,2,3]).firstOrDefault(666, function() {
            $this = this;
            return true;
        }, context);

        expect($this).toBe(context);
    });
});
