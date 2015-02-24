/* jshint globalstrict: true, curly: false */
'use strict';

var iter = window.iter;


describe("join", function() {
    it("join sequence elements using give separator", function() {
        var result = iter([1,2,3]).join(':');

        expect(result).toBe('1:2:3');
    });
});

