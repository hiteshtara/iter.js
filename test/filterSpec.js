/* jshint globalstrict: true, curly: false */
'use strict';

var iter = window.iter;

describe("filter", function() {
    var array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    var arrayIterable;
    beforeEach(function() {
        arrayIterable = iter(array);
    }); 

    it("given predicate that always returns true returns every sequence element", function() {
        var filtered = arrayIterable.filter(function() { 
            return true;
        }).iterator();

        for(var i = 0; i < array.length; i++) {
            filtered.next();
            expect(filtered.current()).toBe(array[i]);
        }
    });

    it("given predicate that always returns false returns empty sequence", function() {
        var filtered = arrayIterable.filter(function() {
            return false;
        }).iterator();

        expect(filtered.next()).toBe(false);
    });

    it("given predicate returns elements for which predicate returns true", function() {
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

    it("predicate have two parameters current value($) and index($index)", function() {
        var values = [], indexes = [];

        iter([1,2,3]).filter(function(v,i) {
            values.push(v); indexes.push(i);
            return true;
        }).toArray();

        expect(values).toEqual([1,2,3]);
        expect(indexes).toEqual([0,1,2]);
    });

    it("context can be set for predicate", function() {
        var context = {}, $this = null;

        iter([1,2,3]).filter(function() {
            $this = this;
            return false;
        }, context).toArray();

        expect($this).toBe(context);
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


