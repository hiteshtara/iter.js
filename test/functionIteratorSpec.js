/* jshint globalstrict: true, curly: false */
'use strict';

var iter = window.iter;

describe('it', function() {
    describe('function it', function() {
        var iterable, iterator;

        beforeEach(function() {
            iterable = iter(function() {
                var i = 0;

                return function() {
                    i += 1;
                    return (i < 3 ? i : undefined);
                };
            });

            iterator = iterable.iterator();
        });

        it('current() should throw exception before call to next()', function() {
            expect(function() { iterator.current(); }).toThrow();   
        });
    
        it('successive calls to next(),current() should return values returned by successive ' +
           'calls to iter function', function() {
            iterator.next();
            expect(iterator.current()).toBe(1);

            iterator.next();
            expect(iterator.current()).toBe(2);
        });

        it('next() should return false if function returns undefined, true otherwise', function() {
            expect(iterator.next()).toBe(true);
            expect(iterator.next()).toBe(true);
            expect(iterator.next()).toBe(false);
        });

        it('current() should not change value if next() returns false', function() {
            while(iterator.next())
                ;

            expect(iterator.current()).toBe(2);
        });

        it('after next() returned false, any subsequent calls to next() return false', function() {
            while(iterator.next())
                ;

            expect(iterator.next()).toBeFalsy();
            expect(iterator.next()).toBeFalsy();
        });

        it('generator factory function is called once per iterator', function() {
            var generatorCalls = 0;
            var iterable = iter(function() {
                generatorCalls++;
                return function() { return undefined; };
            });

            iterable.iterator();
            iterable.iterator();

            expect(generatorCalls).toBe(2);
        });
    
    });
});

