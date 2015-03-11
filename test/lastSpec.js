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
});
