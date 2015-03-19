/* jshint globalstrict: true, curly: false */
'use strict';

var iter = window.iter;

describe('contains', function() {
    it('given empty sequence returns false', function() {
        var result = iter([]).contains('foo');

        expect(result).toBe(false);
    });

    it('given sequence that doesnt contain given element returns false', function() {
        var result = iter.range(0,10).contains('foo');

        expect(result).toBe(false);
    });

    it('given sequence that contains given element returns true', function() {
        var result = iter.range(0,10).contains(5);

        expect(result).toBe(true);
    });
});
