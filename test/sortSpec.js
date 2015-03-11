/* jshint globalstrict: true, curly: false */
'use strict';

var iter = window.iter;

describe('sort', function() {
    it('sort given empty sequence returns empty sequence', function() {
        var result = iter([]).sort().toArray();

        expect(result).toEqual([]);
    });

    it('given sequence of values returns sorted sequence of values', function() {
        var result = iter([3, 2, 1, 5, 7, 2]).sort().toArray();

        expect(result).toEqual([1,2,2,3,5,7]);
    });

    it('custom comparer can be specified', function() {
        var data = [
            { foo: 1 }, { foo: 3 }, { foo: 2 }, { foo: 5 }
        ];

        var result = iter(data)
            .sort(function(l, r) { return (l.foo - r.foo); })
            .toArray();

        expect(result).toEqual([
            { foo: 1 }, { foo: 2 }, { foo: 3 }, { foo: 5 }
        ]);
    });

    it('context can be set for custom comparer', function() {
        var context = {}, $this = null;

        iter([1, 2])
            .sort(function() { $this = this; return 0; }, context)
            .toArray();

        expect($this).toBe(context);
    });
});

