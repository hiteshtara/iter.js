/* jshint globalstrict: true, curly: false */
'use strict';

var iter = window.iter;


describe("foldl1", function() {
    var opMul;

    beforeEach(function() {
        opMul = function(acc, x) { return acc * x; };
    });

    it("given empty sequence throws exception", function() {
        expect(function() {
            iter([]).foldl1(opMul); 
        }).toThrow();
    });

    it("given non empty sequence folds sequence", function() {
        var result = iter([1,2,3,4]).foldl1(opMul);

        expect(result).toBe(24);
    });
});


