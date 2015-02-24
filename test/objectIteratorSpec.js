/* jshint globalstrict: true, curly: false */
'use strict';

var iter = window.iter;

describe("object iterator", function() {
    var fooIterator, foobarIterator;
    
    beforeEach(function() {
        fooIterator = iter({ foo: 1 }).iterator();
        foobarIterator = iter({ foo: 1, bar: 2 }).iterator();
    });

    it("current() should throw exception before next() call", function() {
        expect(function() { fooIterator.current(); }).toThrow();
    });

    it("current() should return first object property after call to next()", function() {
        fooIterator.next();

        expect(fooIterator.current()).toEqual({ key: 'foo', value: 1 });
    });

    it("next() should return true if iterator can go to next object property element", function() {
        expect(fooIterator.next()).toBe(true);
        expect(foobarIterator.next()).toBe(true);
    });

    it("next() should return false if iterator is at the last property of object", function() {
        fooIterator.next();
        expect(fooIterator.next()).toBe(false);

        foobarIterator.next(); foobarIterator.next();
        expect(foobarIterator.next()).toBe(false);
    });

    it("current() should return successive object properties", function() {
        fooIterator.next();
        expect(fooIterator.current()).toEqual({ key: 'foo', value: 1 });

        var foo = false, bar = false;
        for(var i = 0; i < 2; i++) {
            foobarIterator.next();
            
            var tmp = foobarIterator.current();
            if (tmp.key === 'foo') {
                expect(tmp).toEqual({ key: 'foo', value: 1 });
                foo = true;
            }
            else if (tmp.key === 'bar') {
                expect(tmp).toEqual({ key: 'bar', value: 2 });
                bar = true;
            }
        }

        expect(foo && bar).toBe(true);
    });

    it("current() should not change value if next() returned false", function() {
        while(fooIterator.next())
            ;

        expect(fooIterator.current()).toEqual({ key: 'foo', value: 1 });
    });
});


