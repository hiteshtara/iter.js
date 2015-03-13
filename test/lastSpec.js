/* jshint globalstrict: true, curly: false */
'use strict';

var iter = window.iter;

describe('last', function() {
    it('given empty sequence throws exception', function() {
        expect(function() {
        
            iter.empty().last();

        }).toThrow();
    });

    it('given non empty sequence returns last sequence value', function() {
        var result = iter([1,2,3,4]).last();

        expect(result).toBe(4);
    });

    it('given predicate returns last element of sequence satisfying the predicate', function() {
        var data = [{ foo: 1 }, { foo: 2 }, { foo: 2, bar: 1 }, { foo: 3 }];

        var result = iter(data)
            .last(function(x) { return x.foo === 2; });

        expect(result).toEqual({ foo: 2, bar: 1 });
    });

    it('given predicate that no element can satisfy throws error', function() {
        var data = [1,2,3,4];

        expect(function() {
            iter(data).last(function() { return false; });
        }).toThrow();
    });

    it('can accept quick', function() {
        var data = [{ foo: 1 }, { foo: 2 }, { foo: 3 }];

        var result = iter(data)
            .last('$.foo === 2');

        expect(result).toEqual({ foo: 2 });
    });
    
    it('predicate has two parameters current value and index', function() {
        var values = [], indexes = [];

        iter([1,2,3]).last(function(v, i) {
            values.push(v);
            indexes.push(i);
            return (v === 3);
        });

        expect(values).toEqual([1,2,3]);
        expect(indexes).toEqual([0,1,2]);
    });

    it('context can be set for predicate', function() {
        var context = {}, $this = null;

        iter([1,2,3]).last(function() {
            $this = this;
            return true;
        }, context);

        expect($this).toBe(context);
    });
});
