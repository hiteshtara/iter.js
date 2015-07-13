/* jshint globalstrict: true, curly: false */
'use strict';

var iter = window.iter;

describe("toArray", function() {
    it("given empty sequence should return empty array", function() {
        var result = iter([]).toArray();
        expect(result).toEqual([]);
    });

    it("given sequence returns array containing each sequence element", function() {
        var i = 0;
        var iterable = iter.stateless(function() { i++; return (i < 5) ? i : undefined; });

        expect(iterable.toArray()).toEqual([1,2,3,4]);
    });

    it("should actualy return an array", function() {
        var result = iter({ foo: 1, bar: 2}).toArray();

        expect(Array.isArray(result)).toBe(true);
    });
});


