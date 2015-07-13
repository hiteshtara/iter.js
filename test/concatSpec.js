/* jshint globalstrict: true, curly: false */
'use strict';

var iter = window.iter;

describe('concat', function() {
    it('given no parameters returns empty sequence', function() {
        var result = iter.concat().toArray();
        expect(result).toEqual([]);
    });

    it('given empty sequences returns empty sequence', function() {
        var result = iter.concat(
            iter([]), iter([]), iter([])
        )
        .toArray();

        expect(result).toEqual([]);
    });

    it('concatenates sequences passed as parameters into single sequence', function() {
        var result = iter.concat(
            iter([1]),
            iter(['foo', 'bar']),
            iter([2, 3]),
            iter([true, false])
        )
        .toArray();

        expect(result).toEqual([1, 'foo', 'bar', 2, 3, true, false]);
    });

    it('parameters are converted to iterable when needed', function() {
        var i = 0;

        var result = iter.concat(
            function() { 
                return function() { return (++i < 3 ? i : undefined); }; 
            },
            ['foo', 'bar'],
            { nyu: 1 })
        .toArray();

        expect(result).toEqual([1,2,'foo','bar',{ key:'nyu', value:1 }]);
    });
});
