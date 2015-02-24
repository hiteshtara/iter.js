/* jshint globalstrict: true, curly: false */
'use strict';

var iter = window.iter;


describe("range", function() {
    it("can generate ascending range", function() {
        var result = iter.range(0,5).toArray();

        expect(result).toEqual([0,1,2,3,4]);
    });

    it("can generate descending range", function() {
        var result = iter.range(5,0).toArray();

        expect(result).toEqual([5,4,3,2,1]);
    });

    it("step can be specified", function() {
        var result1 = iter.range(1, 0.5, 3).toArray();
        var result2 = iter.range(3, -0.5, 1).toArray();

        expect(result1).toEqual([1, 1.5, 2, 2.5]);
        expect(result2).toEqual([3, 2.5, 2, 1.5]);
    });
});


