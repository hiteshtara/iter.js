/* jshint globalstrict: true, curly: false */
'use strict';

var iter = window.iter;

describe('stateless', function() {
    it('given non function throws exception', function() {
        expect(function() { iter.stateless(null); }).toThrow();
        expect(function() { iter.stateless('foo'); }).toThrow();
        expect(function() { iter.stateless({}); }).toThrow();
        expect(function() { iter.stateless([]); }).toThrow();
    });

    describe('given function', function() {
        var i = 0;
        var generator = function() { 
            return (++i < 3 ? i : undefined);
        };

        it('returns Iterable', function() {
            var result = iter.stateless(generator);
            expect(result instanceof iter.Iterable).toBeTruthy();
        });

        it('values returned by that function are returned by iterator', function() {
            i = 0;
            var iterable = iter.stateless(generator);

            expect(iterable.toArray()).toEqual([1, 2]);
        });

        it('all iterators share the same instance of function', function() {
            i = 0;
            var iterable = iter.stateless(generator);

            var iter1 = iterable.iterator();
            var iter2 = iterable.iterator();

            iter1.next();
            iter2.next();

            expect(iter1.current()).toBe(1);
            expect(iter2.current()).toBe(2);
        });

        it('iteration ends when function returns undefined', function() {
            var result = iter.stateless(function() { return undefined; }).toArray();
            expect(result).toEqual([]);
        });
    });
});
 
