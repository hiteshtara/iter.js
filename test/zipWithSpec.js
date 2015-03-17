/* jshint globalstrict: true, curly: false */
'use strict';

var iter = window.iter;

describe('zipWith', function() {
    it('given two sequences joins sequences using merge function', function() {
        var left = iter([1,2,3]);
        var right = iter(['foo','bar','nyu']);

        var result = iter.zipWith(left, right, function(l, r) {
            return { l: l, r: r };
        })
        .toArray();

        expect(result).toEqual([
            { l: 1, r: 'foo' },
            { l: 2, r: 'bar' },
            { l: 3, r: 'nyu' }
        ]);
    });

    it('returned iterator stops when either of sequences end', function() {
        var left = iter([1,2]);
        var right = iter([1,2,3,4,5]);

        var result = iter
            .zipWith(left, right, function(l,r) { return l + '@' + r; })
            .toArray();

        expect(result).toEqual(['1@1', '2@2']);
    });

    it('when one of sequences is empty returns empty sequence', function() {
        var empty = iter([]);
        var nonEmpty = iter([1,2,3]);

        var result1 = iter
            .zipWith(empty, nonEmpty, function() { return 3; })
            .toArray();

        var result2 = iter
            .zipWith(nonEmpty, empty, function() { return 3; })
            .toArray();

        expect(result1).toEqual([]);
        expect(result2).toEqual([]);
    });

    it('arguments are converted to iterable when necessary', function() {
        var iterable = iter([1,2]);

        var resultArray = iter
            .zipWith(iterable, ['a','b'], function(n,l) { return n + l; })
            .toArray();

        var resultObj = iter
            .zipWith({ foo: 1 }, iterable, function(kv,n) { return { k: kv.key, n: n }; })
            .toArray();

        var i = 0;
        var resultFunc = iter
            .zipWith(function() { return (++i < 3 ? i : undefined); }, iterable, function(l,r) {
                return l + r;
            })
            .toArray();

        expect(resultArray).toEqual(['1a', '2b']);
        expect(resultObj).toEqual([{ k: 'foo', n: 1 }]);
        expect(resultFunc).toEqual([2,4]);
    });

    it('context can be set for merge function', function() {
        var context = {}, $this;

        iter
            .zipWith([1,2], [1,2], function() {
                $this = this;
                return null;
            }, context)
            .toArray();

        expect($this).toBe(context);
    });

    it('quick can be used as merge function with parameters $left and $right', function() {
        var result = iter.zipWith([1,2], ['a','b'], '$left + $right').toArray();

        expect(result).toEqual(['1a', '2b']);
    });
});
