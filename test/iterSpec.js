/* jshint globalstrict: true, curly: false */
'use strict';

var iter = window.iter;

describe("iter library entry point", function() {
    it("should throw error given null", function() {
        expect(function() { iter(null); }).toThrow();
    });

    it("should throw error given number", function() {
        expect(function() { iter(1); }).toThrow();
    });

    it("should throw error given string", function() {
        expect(function() { iter('foo'); }).toThrow();
    });

    it("should throw error given bool", function() {
        expect(function() { iter(true); }).toThrow();
    });

    it("should return iterable given array", function() {
        expect(iter([1,2,3])).toBeDefined();
    });

    it("should return iterable given object", function() {
        expect(iter({ foo: 1, bar: 2 })).toBeDefined();
    });

    it("should return iterable given function", function() {
        expect(iter(function() {})).toBeDefined();
    });
});




