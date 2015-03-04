/* jshint globalstrict: true, curly: false */
'use strict';

var iter = window.iter;

describe("join", function() {
    it("given empty sequence returns empty string", function() {
        var result = iter([]).join('xxx');

        expect(result).toBe('');
    });

    it("given non empty sequence joins elements using given string separator", function() {
        var result = iter([1,2,3]).join(':');

        expect(result).toBe('1:2:3');
    });
});

