/* jshint globalstrict: true, curly: false */
'use strict';

var iter = window.iter;

describe('lastOrDefault', function() {
    it('given emtpy sequence returns default value', function() {
        var result = iter.empty().lastOrDefault(666);

        expect(result).toBe(666);
    });

    it('given non empty sequence returns last sequence value', function() {
        var result = iter([1,2,3,4]).lastOrDefault(666);

        expect(result).toBe(4);
    });
});
