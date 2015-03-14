/* jshint globalstrict: true, curly: false */
'use strict';

var iter = window.iter;

describe('groupBy', function() {
    it('given no arguments throws exception', function() {
        expect(function() {
            iter([1,2,3]).groupBy();
        }).toThrow();
    });

    it('when grouping by single attribute key is that attribute', function() {
        var result = iter([1,2,3,4,5])
            .groupBy('$ % 2')
            .map('{ key: $.key, values: $.toArray() }')
            .orderBy('$.key')
            .toArray();

        expect(result).toEqual([
            { key: 0, values: [2,4] },
            { key: 1, values: [1,3,5] }
        ]);
    });

    it('when grouping by multiple attributes key is array of attributes', function() {
        var result = iter([
            { foo: 1, bar: 1, nyu: 1 }, { foo: 1, bar: 1, nyu: 2 },
            { foo: 1, bar: 2, nyu: 1 }, { foo: 1, bar: 2, nyu: 2 },
            { foo: 2, bar: 1, nyu: 1 }, { foo: 2, bar: 1, nyu: 2 }
        ])
        .groupBy('$.foo', '$.bar')
        .map('$.key.join(",")')
        .sort()
        .toArray();

        expect(result).toEqual(['1,1', '1,2', '2,1']);
    });

    it('performs grouping by given property selectors', function() {
        var jon = { name: 'jon', age: 20 },
            marry = { name: 'marry', age: 22 },
            edward = { name: 'edward', age: 16 },
            jessica = { name: 'jessica', age: 3 },
            patricia = { name: 'patricia', age: 34 };

        var people = [ jon, marry, edward, jessica, patricia ];

        var groupByAge = iter(people)
            .groupBy(function(v) { 
                return (v.age < 18 ? 'kid' : 'adult'); 
            })
            .map(function(v) { 
                return { 
                    k: v.key, 
                    v: v.toArray() 
                }; 
            })
            .orderBy(function(v) { return v.key; })
            .toArray();

        expect(groupByAge).toEqual([
            {
                k: 'adult',
                v: [jon, marry, patricia]
            },
            {
                k: 'kid',
                v: [edward, jessica]
            }
        ]);
    });

    it('preforms grouping by given property selectors 2', function() {
        var data = [
            { employee: 'jon', date: 20070101, value: 33 },
            { employee: 'jon', date: 20070101, value: 55 },
            { employee: 'jon', date: 20070101, value: 41 },

            { employee: 'samanta', date: 20070501, value: 101 },
            { employee: 'samanta', date: 20070501, value: 20 },

            { employee: 'jon', date: 20070201, value: 33 },
            { employee: 'jon', date: 20070201, value: 10 },

            { employee: 'samanta', date: 20070101, value: 101 }
        ];

        var result = iter(data)
            .groupBy('$.employee', '$.date')
            .map('{ key: $.key, sum: $.sum("$.value") }')
            .orderBy('$.key[0] @localeCompare', '$.key[1]')
            .toArray();

        expect(result).toEqual([
            { key: ['jon', 20070101], sum: 129 },
            { key: ['jon', 20070201], sum: 43 },
            { key: ['samanta', 20070101], sum: 101 },
            { key: ['samanta', 20070501], sum: 121 }
        ]);
    });
});
