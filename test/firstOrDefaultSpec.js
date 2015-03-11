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
});
