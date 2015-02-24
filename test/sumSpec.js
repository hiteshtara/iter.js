/* jshint globalstrict: true, curly: false */
'use strict';

var iter = window.iter;


describe("sum", function() {
    it("given empty sequence returns zero", function() {
        var result = iter([]).sum();

        expect(result).toBe(0);
    });

    it("given sequence returns sum of elements", function() {
        var result = iter([1,2,3]).sum();

        expect(result).toBe(6);
    });
});


