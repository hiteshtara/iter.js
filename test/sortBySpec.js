/* jshint globalstrict: true, curly: false */
'use strict';

var iter = window.iter;

describe("sortBy", function() {
    var people;
    var jon_doe_21, marry_doe_22, jon_wozniak_33,
        old_man_101, jessica_cartman_15, jessica_wozniak_35;

    beforeEach(function() {
        people = [
            jon_doe_21 =        { name: 'jon',      surname: 'doe',     age: 21 },
            marry_doe_22 =      { name: 'marry',    surname: 'doe',     age: 22 },
            jon_wozniak_33 =    { name: 'jon',      surname: 'wozniak', age: 33 },
            old_man_101 =       { name: 'old',      surname: 'man',     age: 101 },
            jessica_cartman_15 = { name: 'jessica',  surname: 'cartman', age: 15 },
            jessica_wozniak_35 = { name: 'jessica',  surname: 'wozniak', age: 35 }
        ];

        iter.sortBy.resetComparers();
    });

    it("given empty sequence returns empty sequence", function() {
        var result = iter([])
            .sortBy('$')
            .toArray();

        expect(result).toEqual([]);
    });

    it("number array can be sorted in ascending and descending order", function() {
        var resultAsc = iter([1,4,2,3])
            .sortBy('$')
            .toArray();

        var resultDesc = iter([1,4,2,3])
            .sortBy('$ desc')
            .toArray();

        expect(resultAsc).toEqual([1,2,3,4]);
        expect(resultDesc).toEqual([4,3,2,1]);
    });

    it("string can be compared using localeCompare", function() {
        var resultAsc = iter(['foo', 'bar', 'nyan'])
            .sortBy('$locale')
            .toArray();

        var resultDesc = iter(['foo', 'bar', 'nyan'])
            .sortBy('$locale desc')
            .toArray();

        expect(resultAsc).toEqual(['bar', 'foo', 'nyan']);
        expect(resultDesc).toEqual(['nyan', 'foo', 'bar']);
    });

    it("objects can be compared using properties", function() {
        var resultAsc = iter([jon_doe_21, marry_doe_22, old_man_101])
            .sortBy('$.age')
            .toArray();

        var resultDesc = iter([jon_doe_21, marry_doe_22, old_man_101])
            .sortBy('$.age desc')
            .toArray();

        expect(resultAsc).toEqual([jon_doe_21, marry_doe_22, old_man_101]);
        expect(resultDesc).toEqual([old_man_101, marry_doe_22, jon_doe_21]);
    });

    it("objects can be compared using string properties e.g. 'foo bar'", function() {
        var resultAsc = iter([old_man_101, jon_doe_21, marry_doe_22])
            .sortBy('$."name"')
            .toArray();

        var resultDesc = iter([old_man_101, jon_doe_21, marry_doe_22])
            .sortBy('$."name" desc')
            .toArray();

        expect(resultAsc).toEqual([jon_doe_21, marry_doe_22, old_man_101]);
        expect(resultDesc).toEqual([old_man_101, marry_doe_22, jon_doe_21]);

        var complex1 = { 'foo bar': 1 };
        var complex2 = { 'foo bar': 2 };

        resultAsc = iter([complex1, complex2])
            .sortBy('$."foo bar"')
            .toArray();

        resultDesc = iter([complex1, complex2])
            .sortBy('$."foo bar" desc')
            .toArray();

        expect(resultAsc).toEqual([complex1, complex2]);
        expect(resultDesc).toEqual([complex2, complex1]);
    });

    it("objects can be compared using many conditions", function() {
        var result1 = iter(people)
            .sortBy('$.name', '$.age desc')
            .toArray();

        var result2 = iter(people)
            .sortBy('$.name desc', '$.age desc')
            .toArray();

        expect(result1).toEqual([
            jessica_wozniak_35, jessica_cartman_15,
            jon_wozniak_33, jon_doe_21,
            marry_doe_22, old_man_101
        ]);

        expect(result2).toEqual([
            old_man_101, marry_doe_22,
            jon_wozniak_33, jon_doe_21,
            jessica_wozniak_35, jessica_cartman_15
        ]);
    });

    it("users can install custom comparers", function() {
        iter.sortBy.addComparer('$name', function(l,r) {
            if (l.name > r.name)
                return 1;
            else if (l.name < r.name)
                return (-1);
            else
                return 0;
        });

        var resultAsc = iter([jon_wozniak_33, jessica_cartman_15, old_man_101])
            .sortBy('$name')
            .toArray();
        
        var resultDesc = iter([jon_wozniak_33, jessica_cartman_15, old_man_101])
            .sortBy('$name desc')
            .toArray();

        expect(resultAsc).toEqual([jessica_cartman_15, jon_wozniak_33, old_man_101]);
        expect(resultDesc).toEqual([old_man_101, jon_wozniak_33, jessica_cartman_15]);
    });

    it("custom comparers can be used with property names", function() {
        var data1 = { point: { x: 1, y: 2 } };
        var data2 = { point: { x: 10, y: 20 } };

        iter.sortBy.addComparer('$pointDistance', function(lp, rp) {
            var lpDistance = Math.sqrt(lp.x*lp.x + lp.y*lp.y);
            var rpDistance = Math.sqrt(rp.x*rp.x + rp.y*rp.y);

            return lpDistance - rpDistance;
        });

        var resultAsc = iter([data1, data2])
            .sortBy('$pointDistance."point"')
            .toArray();

        var resultDesc = iter([data1, data2])
            .sortBy('$pointDistance.point desc')
            .toArray();

        expect(resultAsc).toEqual([data1, data2]);
        expect(resultDesc).toEqual([data2, data1]);
    });
});

