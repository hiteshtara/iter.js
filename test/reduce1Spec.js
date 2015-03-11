/* jshint globalstrict: true, curly: false */
'use strict';

var iter = window.iter;


describe("reduce1", function() {
    var opMul;

    beforeEach(function() {
        opMul = function(acc, x) { return acc * x; };
    });

    it("given empty sequence throws exception", function() {
        expect(function() {
            iter([]).reduce1(opMul); 
        }).toThrow();
    });

    it("given non empty sequence folds sequence", function() {
        var result = iter([1,2,3,4]).reduce1(opMul);

        expect(result).toBe(24);
    });
});


