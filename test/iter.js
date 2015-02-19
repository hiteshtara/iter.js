
describe("iter library entry point", function() {
    it("should throw error given null", function() {
        expect(function() { iter(null); }).toThrow();
    });

    it("should throw error given number", function() {
        expect(function() { iter(1); }).toThrow();
    });

    it("should throw error given string", function() {
        expect(function() { iter('foo'); }).toThrow();
    });

    it("should throw error given bool", function() {
        expect(function() { iter(true); }).toThrow();
    });

    it("should return iterable given array", function() {
        expect(iter([1,2,3])).toBeDefined();
    });

    it("should return iterable given object", function() {
        expect(iter({ foo: 1, bar: 2 })).toBeDefined();
    });

    it("should return iterable given function", function() {
        expect(iter(function() {})).toBeDefined();
    });
});

describe("iterable", function() {
    describe("array iterable", function() {
        var iterable = iter([1,2,3]);

        it("should return new iterator for each iterator() call", function() {
            var it = iterable.iterator();
            var it2 = iterable.iterator();

            expect(it).not.toBe(it2);
        });
    });

    describe("object iterable", function() {
        var iterable = iter({ foo: 1, bar: 2 });

        it("should return new iterator for each iterator() call", function() {
            var it = iterable.iterator();
            var it2 = iterable.iterator();

            expect(it).not.toBe(it2);
        });
    });

    describe("function iterable", function() {
        var iterable = iter(function() {
            return 1;
        });

        it("should return new iterator for each iterator() call", function() {
            var it = iterable.iterator(),
                it2 = iterable.iterator();

            expect(it).not.toBe(it2);
        });
    });
});

describe("iterator", function() {
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
