/* jshint globalstrict: true, curly: false */
'use strict';

var iter = window.iter;


describe("empty", function() {
    it("returns empty sequence", function() {
        var result = iter.empty().toArray();

        expect(result).toEqual([]);
    });
});


