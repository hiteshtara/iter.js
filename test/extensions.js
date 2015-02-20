
describe("filter", function() {
    var array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    var arrayIterable;
    beforeEach(function() {
        arrayIterable = iter(array);
    }); 

    it("given predicate that always returns true returns every sequence element", function() {
        var filtered = arrayIterable.filter(function(item) { 
            return true;
        }).iterator();

        for(var i = 0; i < array.length; i++) {
            filtered.next();
            expect(filtered.current()).toBe(array[i]);
        }
    });

    it("given predicate that always returns false returns empty sequence", function() {
        var filtered = arrayIterable.filter(function(item) {
            return false;
        }).iterator();

        expect(filtered.next()).toBe(false);
    });

    it("given predicate returns element for which predicate returns true", function() {
        var filtered = arrayIterable.filter(function(item) {
            return (item % 2 === 0);
        }).iterator();

        for(var i = 0; i < array.length; i++) {
            if (array[i] % 2 === 0) {
                filtered.next();
                expect(filtered.current()).toBe(array[i]);
            }
        }

        expect(filtered.next()).toBe(false);
    });

    it("iterator() always returns new iterator", function() {
        var filtered = arrayIterable.filter(function(item) {
            return (item > 5);
        });

        var filteredIt = filtered.iterator();
        expect(filteredIt.next()).toBe(true);
        expect(filteredIt.current()).toBe(6);

        array.splice(0, array.length);
        array.push(777);

        filteredIt = filtered.iterator();
        expect(filteredIt.next()).toBe(true);
        expect(filteredIt.current()).toBe(777);
    });

    it("supports quick ($ > 3) notation", function() {
        var filtered = iter([1,2,3,4,5]).filter("$ >= 3").iterator();

        filtered.next();
        expect(filtered.current()).toBe(3);
    });
});

describe("toArray", function() {
    it("given empty sequence should return empty array", function() {
        var result = iter([]).toArray();
        expect(result).toEqual([]);
    });

    it("given sequence returns array containing each sequence element", function() {
        var i = 0;
        var iterable = iter(function() { i++; return (i < 5) ? i : undefined; });

        expect(iterable.toArray()).toEqual([1,2,3,4]);
    });

    it("should actualy return an array", function() {
        var result = iter({ foo: 1, bar: 2}).toArray();

        expect(Array.isArray(result)).toBe(true);
    });
});

describe("map", function() {
    it("returns empty sequence given empty sequence", function() {
        var result = iter([])
            .map(function(x) { return x; })
            .toArray();

        expect(result).toEqual([]);
    });

    it("given map function maps sequence elements using that function", function() {
        var result = iter([1,2,3])
            .map(function(x) { return x*x; })
            .toArray();

        expect(result).toEqual([1,4,9]);
    });

    it("iterator() call reaturns always new iterator", function() {
        var array = [1,2];

        var iterator = iter(array)
            .map(function(x) { return x; });

        var result1 = iterator.toArray();
        
        array.push(7);
        var result2 = iterator.toArray();

        expect(result1).toEqual([1,2]);
        expect(result2).toEqual([1,2,7]);
    });

    it("string can be used to select property from object", function() {
        var array = [{foo: 1, bar: 2}, { foo: 10, bar: 20 }];

        var result = iter(array).map('foo').toArray();

        expect(result).toEqual([1, 10]);
    });

    it("array of strings can be used to select many properties from sequence objects", function() {
        var array = [{ foo: 1, bar: 2, nyu: 3 }, { foo: 10, bar: 20, nyu: 30 }];

        var result = iter(array).map('foo', 'bar').toArray();

        expect(result).toEqual([{ foo: 1, bar: 2 }, { foo: 10, bar: 20 }]);
    });
});
