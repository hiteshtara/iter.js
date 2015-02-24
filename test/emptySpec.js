/* jshint globalstrict: true, curly: false */
'use strict';

var iter = window.iter;


describe("empty", function() {
    it("returns empty sequence iterator", function() {
        var result = iter.empty().toArray();

        expect(result).toEqual([]);
    });
});


