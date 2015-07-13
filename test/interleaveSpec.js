/* jshint globalstrict: true, curly: false */
'use strict';

var iter = window.iter;

describe('interleave', function() {
    it('given empty sequences returns empty sequence', function() {
        var result = iter
            .interleave(iter([]), iter([]), iter([]))
            .toArray();

        expect(result).toEqual([]);
    });

    it('given non empty sequences interleaves them using round rubin algorithm', function() {
        var result = iter
            .interleave(
                iter([1,2,3]),
                iter(['foo','bar','nyu'])
            )
            .toArray();

        expect(result).toEqual([
            1, 'foo', 2, 'bar', 3, 'nyu'
        ]);
    });

    it('supports any number of sequences', function() {
        var result = iter
            .interleave(
                iter([1,2]),
                iter([10,20]),
                iter([100,200])
            )
            .toArray();

        expect(result).toEqual([
            1, 10, 100, 2, 20, 200
        ]);
    });

    it('sequences can have different lenghts', function() {
        var result = iter
            .interleave(
                iter(['foo','bar']),
                iter.range(0,5)
            )
            .toArray();

        expect(result).toEqual([
            'foo', 0, 'bar', 1, 2, 3, 4
        ]);
    });

    it('given single sequence returns that sequence', function() {
        var result = iter.interleave(iter([1,2,3])).toArray();

        expect(result).toEqual([1,2,3]);
    });

    it('arguments are converted to iterable when needed', function() {
        var i = 0;

        var result = iter.interleave(
            [1,2,3],
            function() {
                return function() { return (++i < 4 ? i : undefined); };
            },
            { foo: 1 }
        )
        .toArray();

        expect(result).toEqual([
            1, 1, { key: 'foo', value: 1 },
            2, 2,
            3, 3
        ]);
    });
});
