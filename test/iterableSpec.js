/* jshint globalstrict: true, curly: false */
'use strict';

var iter = window.iter;

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


