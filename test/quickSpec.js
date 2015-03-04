/* jshint globalstrict: true, curly: false */
'use strict';

var iter = window.iter;

describe("iter.quick", function() {
    it("given empty expression throw exception", function() {
        var action = function() {
            iter.quick(null);
        };

        expect(action).toThrow();
    });

    it("given invalid parameter name throw exception", function() {
        var action = function() {
            iter.quick(['$', '$inv$%$alid'], '$');
        };

        expect(action).toThrow();
    });

    it("given valid expression returns function that returns given expression", function() {
        var $true = iter.quick('true');
        var $false = iter.quick('false');
        var $1 = iter.quick('1');
        var $str1 = iter.quick('"foozle"');
        var $str2 = iter.quick("'that\\'s it'");

        expect($true()).toBe(true);
        expect($false()).toBe(false);
        expect($1()).toBe(1);
        expect($str1()).toBe("foozle");
        expect($str2()).toBe("that's it");
    });

    it("given no parameters creates a function with default $ parameter", function() {
        var f = iter.quick('$ > 3');

        expect(f(1)).toBe(false);
        expect(f(5)).toBe(true);
    });

    it("given two parameters creates a function with two parameters", function() {
        var f = iter.quick(['$a', '$b'], '$a + "x" + $b');

        expect(f(10,20)).toBe('10x20');
    });
});

