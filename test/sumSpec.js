/* jshint globalstrict: true, curly: false */
'use strict';

var iter = window.iter;


describe("sum", function() {
    var persons;

    beforeEach(function() {
        persons = [
            { name: "jon doe", age: 23 },
            { name: "marry bee", age: 22.5 },
            { name: "foozbar", age: 3.5 }
        ];
    });

    it("given empty sequence returns zero", function() {
        var result = iter([]).sum();

        expect(result).toBe(0);
    });

    it("given sequence returns sum of elements", function() {
        var result = iter([1,2,3]).sum();

        expect(result).toBe(6);
    });

    it("given property selector returns sum of values selected by selector", function() {
        var resultQuick = iter(persons).sum('$.age');
        
        var resultFunc = iter(persons).sum(function(obj) {
            return obj.age;
        });

        expect(resultQuick).toBe(49);
        expect(resultFunc).toBe(49);
    });

    it("property selector has two arguments current value and index", function() {
        var values = [], indexes = [];

        iter(['foo', 'bar']).sum(function(v, i) {
            values.push(v);
            indexes.push(i);

            return 0;
        });

        expect(values).toEqual(['foo', 'bar']);
        expect(indexes).toEqual([0, 1]);
    });

    it("context can be set for selector", function() {
        var $this = null, context = {};

        iter([1]).sum(function() {
            $this = this;
        }, context);

        expect($this).toBe(context);
    });

    it("values are converted to numbers before addition", function() {
        var result = iter(['1', '2', '3']).sum();

        expect(result).toBe(6);
    });
});


