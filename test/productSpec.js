/* jshint globalstrict: true, curly: false */
'use strict';

var iter = window.iter;

describe("product", function() {
    it("given empty sequence returns one", function() {
        var result = iter([]).product();

        expect(result).toBe(1);
    });

    it("given sequence returns product of elements", function() {
        var result = iter([1,2,3]).product();

        expect(result).toBe(6);
    });
});


