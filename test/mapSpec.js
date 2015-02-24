/* jshint globalstrict: true, curly: false */
'use strict';

var iter = window.iter;

describe("map", function() {
    it("returns empty sequence given empty sequence", function() {
        var result = iter([])
            .map(function(x) { return x; })
            .toArray();

        expect(result).toEqual([]);
    });

    it("given map function maps sequence elements using that function", function() {
        var result = iter([1,2,3])
            .map(function(x) { return x*x; })
            .toArray();

        expect(result).toEqual([1,4,9]);
    });

    it("iterator() call reaturns always new iterator", function() {
        var array = [1,2];

        var iterator = iter(array)
            .map(function(x) { return x; });

        var result1 = iterator.toArray();
        
        array.push(7);
        var result2 = iterator.toArray();

        expect(result1).toEqual([1,2]);
        expect(result2).toEqual([1,2,7]);
    });

    it("quick can be used to return custom value", function() {
        var array = [1,2,3];

        var result = iter(array)
            .map('{ n: $, n2: ($*$) }')
            .toArray();

        expect(result).toEqual([
            { n:1, n2:1 },
            { n:2, n2:4 },
            { n:3, n2:9 }
        ]);
    });

    it("map function has two arguments: current value and index", function() {
        var array = ['foo', 'bar', 'nyu'];

        var result = iter(array)
            .map(function(item, i) { return item + '.' + i; })
            .toArray();

        expect(result).toEqual([
            'foo.0', 'bar.1', 'nyu.2'
        ]);
    });

    it("$index can be used in quick to access index", function() {
        var array = ['foo', 'bar', 'nyu'];

        var result = iter(array)
            .map('{ v:$, i:$index }')
            .toArray();

        expect(result).toEqual([
            { v:'foo', i:0 },
            { v:'bar', i:1 },
            { v:'nyu', i:2 }
        ]);
    });
});


