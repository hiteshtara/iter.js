/* jshint globalstrict: true, curly: false */
'use strict';

var iter = window.iter;


describe("skip", function() {
    it("returns original sequence given count zero", function() {
        var result = iter([1,2,3]).skip(0).toArray();

        expect(result).toEqual([1,2,3]);
    });

    it("skips given elements count", function() {
        var result = iter([1,2,3,4,5]).skip(2).toArray();

        expect(result).toEqual([3,4,5]);
    });
});


