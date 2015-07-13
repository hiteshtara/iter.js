/* jshint globalstrict: true, curly: false */
'use strict';

var iter = window.iter;

describe('cross', function() {
    var mergeFunc;

    beforeEach(function() {
        mergeFunc = function(l,r) { return { l:l, r:r }; };
    });

    it('given two empty sequences returns empty sequence', function() {
        var result = iter
            .cross(iter([]), iter([]), mergeFunc)
            .toArray();

        expect(result).toEqual([]);
    });

    it('one of sequences is empty returns empty sequence', function() {
        var result1 = iter
            .cross(iter([]), iter([1,2,3]), mergeFunc)
            .toArray();

        var result2 = iter
            .cross(iter([1,2,3]), iter([]), mergeFunc)
            .toArray();

        expect(result1).toEqual([]);
        expect(result2).toEqual([]);
    });

    it('given two non empty sequences returns cartesian product of sequences ' +
       ' mapped over mergeFunc', function() {
        var result = iter
            .cross(iter([1,2,3]), iter(['foo','bar']), mergeFunc)
            .toArray();

        expect(result).toEqual([
            { l:1, r:'foo' }, { l:1, r:'bar' },
            { l:2, r:'foo' }, { l:2, r:'bar' },
            { l:3, r:'foo' }, { l:3, r:'bar' }
        ]);
    });

    it('skips elements for which merge function returned undefined', function() {
        var result = iter
            .cross(iter([1,2,3]), iter(['foo','bar']), function(l, r) {
                if (r !== 'bar')
                    return l;
            })
            .toArray();

        expect(result).toEqual([1,2,3]);
    });

    it('converts arguments to iterable when needed', function() {
        var resultArrayObject = iter
            .cross([1,2,3], { foo:1 }, mergeFunc)
            .toArray();

        expect(resultArrayObject).toEqual([
            { l:1, r: { key:'foo', value:1 } },
            { l:2, r: { key:'foo', value:1 } },
            { l:3, r: { key:'foo', value:1 } }
        ]);

        var i = 0;
        var resultArrayFunction = iter
            .cross(
                [1],
                function() { 
                    return function() { return (i++ === 0 ? 'ok' : undefined); };
                },
                mergeFunc)
            .toArray();

        expect(resultArrayFunction).toEqual([
            { l:1, r:'ok' }
        ]);
    });

    it('evaluates right sequence for each left element', function() {
        var i = 0;

        iter
        .cross(
            iter([1,2,3]),
            // cross restars right sequence for each left seq element
            // function returns 'ok', undef, 'ok', undef, 'ok', undef
            // to allow 3 restarts
            function() { 
                return function() { return ((i++ % 2) === 0 ? 'ok' : undefined); };
            },
            mergeFunc)
        .toArray();

        expect(i).toBe(6);
    });

    it('context can be set for merge function', function() {
        var context = {}, $this;

        iter.cross(iter([1]), iter([1]), function() {
            $this = this;
            return undefined;
        }, context)
        .toArray();

        expect($this).toBe(context);
    });

    it('quick can be used as merge function', function() {
        var result = iter
            .cross([1,2],['a','b'], '$left + $right')
            .toArray();
        
        expect(result).toEqual([
            '1a', '1b', '2a', '2b'
        ]);
    });
});
