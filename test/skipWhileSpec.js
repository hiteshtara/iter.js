/* jshint globalstrict: true, curly: false */
'use strict';

var iter = window.iter;

describe('skipWhile', function() {
    it('given empty sequence returns empty sequence', function() {
        var result = iter([])
            .skipWhile(function() { return false; })
            .toArray();

        expect(result).toEqual([]);
    });

    it('given predicate that always returns true returns empty sequence', function() {
        var result = iter([1,2,3,4,5])
            .skipWhile(function() { return true; })
            .toArray();

        expect(result).toEqual([]);
    });

    it('given predicate that always return false returns entire sequence', function() {
        var result = iter([1,2,3,4,5])
            .skipWhile(function() { return false; })
            .toArray();

        expect(result).toEqual([1,2,3,4,5]);
    });

    it('skips first elements of sequence for which predicate returned true', function() {
        var result = iter([1,2,3,4,5,4,3,2,1])
            .skipWhile(function(v) { return (v < 5); })
            .toArray();

        expect(result).toEqual([5,4,3,2,1]);
    });

    it('predicate have two arguments current value and index', function() {
        var values = [], indexes = [];

        iter(['foo', 'bar', 'nyu'])
            .skipWhile(function(v,i) {
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
            .skipWhile(function() {
                $this = this;
                return true;
            }, context)
            .toArray();

        expect($this).toBe(context);
    });

    it('supports quick', function() {
        var result = iter([1,2,3,4,5])
            .skipWhile('$ < 3 || $index === 2')
            .toArray();

        expect(result).toEqual([4,5]);
    });
});
