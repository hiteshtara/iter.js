/* jshint globalstrict: true, curly: false */
'use strict';

var iter = window.iter;

describe('repeat', function() {
    it('given zero times returns empty sequence', function() {
        var result = iter.repeat('foo', 0).toArray();

        expect(result).toEqual([]);
    });

    it('repeats given value specified number of times', function() {
        var result = iter.repeat('foo', 5).toArray();

        expect(result).toEqual([
            'foo', 'foo', 'foo', 'foo', 'foo'
        ]);
    });

    it('works with undefined value', function() {
        var result = iter.repeat(undefined, 3).toArray();

        expect(result).toEqual([
            undefined, undefined, undefined
        ]);
    });

    it('given no times returns infinite sequence', function() {
        // imperfect check for infinity
        var result = iter.repeat('foo').take(100).toArray();

        expect(result[14]).toBe('foo');
        expect(result[55]).toBe('foo');
    });
});
