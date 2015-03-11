/* jshint globalstrict: true, curly: false */
'use strict';

var iter = window.iter;

describe('first', function() {
    it('given empty sequence throws exception', function() {
        expect(function() {
            
            iter.empty().first();

        }).toThrow();
    });

    it('returns first element of non empty sequence', function() {
        var result = iter([1,2,3]).first();

        expect(result).toBe(1);
    });
});
