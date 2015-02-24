/* jshint globalstrict: true, curly: false */
'use strict';

var iter = window.iter;

describe("iterator", function() {
    describe("function iterator", function() {
        var i, foo;

        beforeEach(function() {
            i = 0;

            foo = iter(function() {
                i += 1;
                return (i < 3 ? i : undefined);
            }).iterator();
        });

        it("current() should throw exception before call to next()", function() {
            expect(function() { foo.current(); }).toThrow();   
        });
    
        it("successive calls to next(),current() should return values returned by successive " +
           "calls to iter function", function() {
            foo.next();
            expect(foo.current()).toBe(1);

            foo.next();
            expect(foo.current()).toBe(2);
        });

        it("next() should return false if function returns undefined, true otherwise", function() {
            expect(foo.next()).toBe(true);
            expect(foo.next()).toBe(true);
            expect(foo.next()).toBe(false);
        });

        it("current() should not change value if next() returns false", function() {
            while(foo.next())
                ;

            expect(foo.current()).toBe(2);
        });
    });
});

