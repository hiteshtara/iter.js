/* jshint globalstrict: true, curly: false */
'use strict';

var iter = window.iter;

describe("array iterator", function() {
    var iterator;
    
    beforeEach(function() {
        iterator = iter([1,2,3]).iterator();
    });

    it("current() should throw exception before next() call", function() {
        expect(function() { iterator.current(); }).toThrow();
    });

    it("current() should return first array element after call to next()", function() {
        iterator.next();

        expect(iterator.current()).toBe(1);
    });

    it("next() should return true if iterator can go to next array element", function() {
        expect(iterator.next()).toBe(true);
        expect(iterator.next()).toBe(true);
        expect(iterator.next()).toBe(true);
    });

    it("next() should return false if iterator is at the end of array", function() {
        iterator.next(); iterator.next(); iterator.next();

        expect(iterator.next()).toBe(false);
    });

    it("current() should return successive array elements", function() {
        iterator.next();
        expect(iterator.current()).toBe(1);
        iterator.next();
        expect(iterator.current()).toBe(2);
        iterator.next();
        expect(iterator.current()).toBe(3);
    });

    it("current() should not change value if next() returned false", function() {
        while(iterator.next())
            ;

        expect(iterator.current()).toBe(3);
    });
});

 
