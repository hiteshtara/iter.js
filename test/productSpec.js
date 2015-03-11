/* jshint globalstrict: true, curly: false */
'use strict';

var iter = window.iter;

describe("product", function() {
    it("given empty sequence returns one", function() {
        var result = iter([]).product();

        expect(result).toBe(1);
    });

    it("given sequence returns product of elements", function() {
        var result = iter([1,2,3]).product();

        expect(result).toBe(6);
    });

    it("given preducate returns product of elements returned by predicate", function() {
        var data = [
            { foo: 3 }, { foo: 5 }, { foo: 7 }
        ];

        var resultQuick = iter(data).product('$.foo');
        var resultFunction = iter(data).product(function(v) {
            return v.foo;
        });

        expect(resultQuick).toBe(105);
        expect(resultFunction).toBe(105);
    });

    it("context can be set for predicate", function() {
        var context = {}, $this = null;

        iter([1]).product(function() {
            $this = this;
            return 1;
        }, context);

        expect($this).toBe(context);
    });

    it("predicate has two parameters current value and index", function() {
        var values = [], indexes = [];

        iter(['foo', 'bar', 'nyu']).product(function(v, i) {
            values.push(v);
            indexes.push(i);
            return 1;
        });

        expect(values).toEqual(['foo', 'bar', 'nyu']);
        expect(indexes).toEqual([0, 1, 2]);
    });

    it("values are converted to numbers before multiplication", function() {
        var result = iter(['1', '2', '3']).product();

        expect(result).toBe(6);
    });
});


