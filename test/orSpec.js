/* jshint globalstrict: true, curly: false */
'use strict';

var iter = window.iter;

describe("or", function() {
    it("returns false given empty sequence", function() {
        var result = iter([]).or();

        expect(result).toBe(false);
    });

    it("returns last value given sequence of falsy values", function() {
        var result = iter([false, undefined, null, 0]).or();

        expect(result).toBe(0);
    });

    it("given sequence containing at least one truthy value returns first truthy value", function() {
        var result = iter([false, null, 3, undefined, 7]).or();

        expect(result).toBe(3);
    });

    it("stop iterations after seeing truthy value", function() {
        var data = [null, 0, 7, null, 0];
        var iterations = 0;

        iter(function() { iterations += 1; return data.shift(); }).or();

        expect(iterations).toBe(3);
    });
});
