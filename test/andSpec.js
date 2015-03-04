/* jshint globalstrict: true, curly: false */
'use strict';

var iter = window.iter;

describe("and", function() {
    it("given empty sequence returns true", function() {
        var result = iter([]).and();

        expect(result).toBe(true);
    });

    it("given sequence with truthy values returns last value", function() {
        var result = iter([1,2,3,4]).and();

        expect(result).toBe(4);
    });

    it("given sequence with at least one falsy value returns first falsy value", function() {
        var result = iter([1,2,0,3,7,null]).and();

        expect(result).toBe(0);
    });

    it("stops iteration after seeing first falsy value", function() {
        var data = [1,2,false,4,5];
        var iterations = 0;

        iter(function() { iterations += 1; return data.shift(); }).and();
    
        expect(iterations).toBe(3);
    });
});
