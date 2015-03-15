/* jshint globalstrict: true, curly: false */
'use strict';

var iter = window.iter;

describe('takeWhile', function() {
    it('given empty sequence returns empty sequence', function() {
        var result = iter([])
            .takeWhile(function() { return true; })
            .toArray();

        expect(result).toEqual([]);
    });

    it('returns elements of sequence until predicate returns false', function() {
        var result = iter([1,2,3,4,5,4,3,2,1,1,2,3])
            .takeWhile(function(n) {
                return (n < 3);
            })
            .toArray();

        expect(result).toEqual([1,2]);
    });

    it('given predicate that always returns true returns entire sequence', function() {
        var result = iter([1,2,3,4])
            .takeWhile(function() { return true; })
            .toArray();

        expect(result).toEqual([1,2,3,4]);
    });

    it('given predicate that always returns false returns empty sequence', function() {
        var result = iter([1,2,3,4])
            .takeWhile(function() { return false; })
            .toArray();

        expect(result).toEqual([]);
    });

    it('predicate have two arguments current value and index', function() {
        var values = [], indexes = [];

        iter(['foo', 'bar', 'nyu'])
            .takeWhile(function(v,i) {
                values.push(v);
                indexes.push(i);
                return true;
            })
            .toArray();

        expect(values).toEqual(['foo', 'bar', 'nyu']);
        expect(indexes).toEqual([0, 1, 2]);
    });

    it('predicate can have context set', function() {
        var context = {}, $this;

        iter([1])
            .takeWhile(function() {
                $this = this;
                return true;
            }, context)
            .toArray();

        expect($this).toBe(context);
    });

    it('supports quick', function() {
        var result = iter([1,2,3,4,5])
            .takeWhile('$ < 3 || $index === 2')
            .toArray();

        expect(result).toEqual([1,2,3]);
    });
});
