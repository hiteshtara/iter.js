/* jshint globalstrict: true, curly: false */
'use strict';

var iter = window.iter;


describe("take", function() {
    it("given zero returns empty sequence", function() {
        var result = iter([1,2,3]).take(0).toArray();

        expect(result).toEqual([]);
    });

    it("given count returns sequence containing first count elements from original sequence", function() {
        var result = iter([1,2,3,4,5]).take(3).toArray();

        expect(result).toEqual([1,2,3]);
    });
});


