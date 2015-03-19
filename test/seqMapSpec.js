/* jshint globalstrict: true, curly: false */
'use strict';

var iter = window.iter;

describe('seqMap', function() {
    it('maps empty sequence into empty sequence', function() {
        var result = iter([])
            .seqMap(function() { return [1]; })
            .toArray();

        expect(result).toEqual([]);
    });

    it('maps list of empty sequences into empty sequence', function() {
        var result = iter([1,2,3])
            .seqMap(function() { return iter([]); })
            .toArray();

        expect(result).toEqual([]);
    });

    it('joins sequences returned from map into single sequence', function() {
        var result = iter.range(0,3)
            .seqMap(function(n) { return iter.range(0,n); })
            .toArray();

        expect(result).toEqual([
            0,   // n = 1
            0,1  // n = 2
        ]);
    });

    it('sequences returned by map are evaluated lazely', function() {
        var func1Evaluated = false, func2Evaluated = false;

        var func1 = function() { 
            if (!func1Evaluated) {
                func1Evaluated = true;
                return 'ok';
            }
        };

        var func2 = function() {
            if (!func2Evaluated) {
                func2Evaluated = true;
                return 'ack';
            }
        };

        var it = iter([iter(func1), iter(func2)])
            .seqMap(function(x) { return x; })
            .iterator();

        expect(func1Evaluated).toBe(false);
        expect(func2Evaluated).toBe(false);

        it.next();

        expect(func1Evaluated).toBe(true);
        expect(func2Evaluated).toBe(false);

        it.next();

        expect(func1Evaluated).toBe(true);
        expect(func2Evaluated).toBe(true);
    });

    it('converts values returned from map to Iterable when necessary', function() {
        var i = 0;

        var result = iter([
            ['foo'],
            { foo: 1 },
            function() { return (i++ === 0 ? 'ok' : undefined); }
        ])
        .seqMap(function(x) { return x; })
        .toArray();

        expect(result).toEqual([
            'foo',
            { key:'foo', value:1 },
            'ok'
        ]);
    });

    it('context can be set for map function', function() {
        var context = {}, $this;

        iter([1])
            .seqMap(function() {
                $this = this;
                return iter.empty();
            }, context)
            .toArray();

        expect($this).toBe(context);
    });

    it('supports quick as map function', function() {
        var result = iter([1,2])
            .seqMap('iter.range(0,$+1)')
            .toArray();

        expect(result).toEqual([
            0, 1,
            0, 1, 2
        ]);
    });
});
