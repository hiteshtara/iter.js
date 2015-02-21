
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

    it("allows to use $index inside quick", function() {
        var array = ['foo', 'bar', 'nyu'];

        var result = iter(array)
            .filter('$index === 1')
            .toArray();

        expect(result).toEqual(['bar']);
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

    it("quick can be used to return custom value", function() {
        var array = [1,2,3];

        var result = iter(array)
            .map('{ n: $, n2: ($*$) }')
            .toArray();

        expect(result).toEqual([
            { n:1, n2:1 },
            { n:2, n2:4 },
            { n:3, n2:9 }
        ]);
    });

    it("map function has two arguments: current value and index", function() {
        var array = ['foo', 'bar', 'nyu'];

        var result = iter(array)
            .map(function(item, i) { return item + '.' + i; })
            .toArray();

        expect(result).toEqual([
            'foo.0', 'bar.1', 'nyu.2'
        ]);
    });

    it("$index can be used in quick to access index", function() {
        var array = ['foo', 'bar', 'nyu'];

        var result = iter(array)
            .map('{ v:$, i:$index }')
            .toArray();

        expect(result).toEqual([
            { v:'foo', i:0 },
            { v:'bar', i:1 },
            { v:'nyu', i:2 }
        ]);
    });
});

describe("count", function() {
    it("count given empty sequence return zero", function() {
        var result = iter([]).count();

        expect(result).toBe(0);
    });

    it("count given sequence with 2 elements returns 2", function() {
        var result = iter([1,2]).count();

        expect(result).toBe(2);
    });

    it("given predicate returns number of elements fulfilling predicate", function() {
        var result = iter([1,2,3,4,5]).count('$ % 2 === 0');

        expect(result).toBe(2);
    });

    it("count accepts quick and functions", function() {
        var qResult = iter([1,2,3,4]).count('$ > 2');
        var fResult = iter([1,2,3,4]).count(function(x) { return x > 2; });

        expect(qResult).toBe(2);
        expect(fResult).toBe(2);
    });

    it("predicate returns always false - returns zero", function() {
        var result = iter([1,2,3,4]).count('$ && false');

        expect(result).toBe(0);
    });
});

describe("any", function() {
    it("given empty sequence returns false", function() {
        var result = iter([]).any();

        expect(result).toBe(false);
    });

    it("given non empty sequence containing all falsy values return false", function() {
        var result = iter([undefined, null, 0, '', false]).any();

        expect(result).toBe(false);
    });

    it("given non empty sequence containing at " +
       "least single truthy value returns that value", function() {
        var result = iter([null, 0, 314, '', false]).any();

        expect(result).toBe(314);
    });

    it("given predicate returns first element that fulfills " + 
       "predicate", function() {
    
        var result = iter([1,2,3,4,5])
            .any(function(x) { return x === 3; });

        expect(result).toBe(3);
    });

    it("no value fulfills predicate - returns false", function() {
        var result = iter(['foo', 'bar'])
            .any(function(x) { return 0; });

        expect(result).toBe(false);
    });

    it("can be used with quick", function() {
        var result = iter([1,2,3,4,5]).any('$ % 3 == 2');

        expect(result).toBe(2);
    });
});

describe("all", function() {
    it("given empty sequence returns true", function() {
        var result = iter([]).all();

        expect(result).toBe(true);
    });

    it("given sequency with all truthy values returns last value", function() {
        var result = iter([1,2,3,4]).all();

        expect(result).toBe(4);
    });

    it("given sequence with at least one falsy value return false", function() {
        var result = iter([1,2,3,null,5]).all();

        expect(result).toBe(false);
    });

    it("given predicate that always returns true - returns last value", function() {
        var result = iter([1,2,3,4,5]).all(function() { return true; });

        expect(result).toBe(5);
    });

    it("given a predicate that at least once returns falsy value - returns false", function() {
        var result = iter([1,2,3,4,5])
            .all(function(x) { return x !== 3; });

        expect(result).toBe(false);
    });

    it("can be used with quick", function() {
        var result = iter([1,2,3,4,5]).all('$ > 0');

        expect(result).toBe(5);
    });
});

describe("range", function() {
    it("can generate ascending range", function() {
        var result = iter.range(0,5).toArray();

        expect(result).toEqual([0,1,2,3,4]);
    });

    it("can generate descending range", function() {
        var result = iter.range(5,0).toArray();

        expect(result).toEqual([5,4,3,2,1]);
    });

    it("step can be specified", function() {
        var result1 = iter.range(1, 0.5, 3).toArray();
        var result2 = iter.range(3, -0.5, 1).toArray();

        expect(result1).toEqual([1, 1.5, 2, 2.5]);
        expect(result2).toEqual([3, 2.5, 2, 1.5]);
    });
});
