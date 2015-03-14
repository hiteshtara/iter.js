/* jshint globalstrict: true, curly: false */
'use strict';

var iter = window.iter;

describe('random', function() {
    it('throws exception given empty sequence', function() {
        expect(function() {
            iter.empty().random();
        }).toThrow();
    });

    it('given sequence with single element returns that element', function() {
        var result = iter([1]).random();

        expect(result).toBe(1);
    });

    it('given sequence returns random element', function() {
        var data = [{}, {}, {}, {}];

        var result = iter(data).random();

        expect(data.indexOf(result) !== -1).toBeTruthy();
    });
});
