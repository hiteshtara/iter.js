/* jshint globalstrict: true, curly: false */
'use strict';

var iter = window.iter;

describe("avg", function() {
    it("given empty sequence returns NaN", function() {
        var result = iter([]).avg();

        expect(result).toBeNaN();
    });

    it("given sequence returns avg of elements", function() {
        var result = iter([1,2,3]).avg();

        expect(result).toBe(2);
    });

    it("given predicate returns avg of values returned by predicate", function() {
        var data = [
            { foo: -3 }, { foo: 6 }, { foo: 3 }
        ];

        var resultQuick = iter(data).avg('$.foo');
        var resultFunction = iter(data).avg(function(v) {
            return v.foo;
        });

        expect(resultQuick).toBe(2);
        expect(resultFunction).toBe(2);
    });

    it("predicate has two parameters current value and index", function() {
        var values = [], indexes = [];

        iter(['foo', 'bar', 'nyu']).avg(function(v,i) {
            values.push(v);
            indexes.push(i);
            return 0;
        });

        expect(values).toEqual(['foo', 'bar', 'nyu']);
        expect(indexes).toEqual([0, 1, 2]);
    });

    it("values are conveted to numbers before computing avg", function() {
        var result = iter(['1', '2', '3']).avg();

        expect(result).toBe(2);
    });

    it("context can be set for selector", function() {
        var context = {}, $this = null;

        iter([1]).avg(function() {
            $this = this;
            return 0;
        }, context);

        expect($this).toBe(context);
    });
});


