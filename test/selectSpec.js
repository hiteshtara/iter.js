/* jshint globalstrict: true, curly: false */
'use strict';

var iter = window.iter;


describe("select", function() {
    it("string can be used to select property from object", function() {
        var array = [{foo: 1, bar: 2}, { foo: 10, bar: 20 }];

        var result = iter(array).select('foo').toArray();

        expect(result).toEqual([1, 10]);
    });

    it("array of strings can be used to select many properties from sequence objects", function() {
        var array = [{ foo: 1, bar: 2, nyu: 3 }, { foo: 10, bar: 20, nyu: 30 }];

        var result = iter(array).select('foo', 'bar').toArray();

        expect(result).toEqual([{ foo: 1, bar: 2 }, { foo: 10, bar: 20 }]);
    });

    it("property name can be any string", function() {
        var array = [{
            "foo bar": 1,
            "'in' 'valid'": 3
        }];

        var result = iter(array).select('foo bar', "'in' 'valid'").toArray();

        expect(result).toEqual(array);
    });
});


