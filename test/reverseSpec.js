/* jshint globalstrict: true, curly: false */
'use strict';

var iter = window.iter;

describe('reverse', function() {
    it('given empty sequence returns empty sequence', function() {
        var result = iter({}).reverse().toArray();

        expect(result).toEqual([]);
    });

    it('given sequence with single element returns sequence with single element', function() {
        var result = iter({ foo: 1 }).reverse().toArray();

        expect(result).toEqual([{ key: 'foo', value: 1 }]);
    });

    it('given sequence returns sequence in reversed order', function() {
        var result = iter({ foo: 1, bar: 2, nyu: 3})
            .sortBy('$.key')
            .reverse()
            .toArray();

        expect(result).toEqual([
            { key: 'nyu', value: 3 },
            { key: 'foo', value: 1 },
            { key: 'bar', value: 2 }
        ]);
    });

    it('given sequence returns sequence in reversed order 2', function() {
        var i = 0;
        var generator = function() {
            return (i < 10 ? i++ : undefined);
        };

        var result = iter(generator)
            .reverse()
            .toArray();

        var result2 = iter.range(0, 10)
            .reverse()
            .toArray();

        expect(result).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1, 0]);
        expect(result2).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1, 0]);
    });

    it('uses special iterator for array that doesnt reverses array but moves backwards', function() {
        var iterator = iter([1,2,3,4])
            .reverse()
            .iterator();

        // implicit check for presence of backwards iterator
        expect(iterator.$$index).toBe(4);

        var result = iter([1,2,3,4,5])
            .reverse()
            .toArray();

        expect(result).toEqual([5,4,3,2,1]);
    });
});
