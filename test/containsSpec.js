/* jshint globalstrict: true, curly: false */
'use strict';

var iter = window.iter;

describe('contains', function() {
    it('given empty sequence returns false', function() {
        var result = iter([]).contains('foo');

        expect(result).toBe(false);
    });

    it('given sequence that doesnt contain given element returns false', function() {
        var result = iter.range(0,10).contains('foo');

        expect(result).toBe(false);
    });

    it('given sequence that contains given element returns true', function() {
        var result = iter.range(0,10).contains(5);

        expect(result).toBe(true);
    });

    it('accepts custom equality comparer', function() {
        var objects = [
            { id: 101, value: 'foo' },
            { id: 102, value: 'bar' },
            { id: 103, value: 'nyu' }
        ];
        
        var comparer = function(element, value) {
            return (element.id === value);
        };

        var result102 = iter(objects)
            .contains(102, comparer);

        var result105 = iter(objects)
            .contains(105, comparer);

        expect(result102).toBe(true);
        expect(result105).toBe(false);
    });

    it('context can be set for custom comparer', function() {
        var $this = null, context = {};

        iter([1,2,3])
            .contains(1, function() { $this = this; }, context);

        expect($this).toBe(context);
    });
});
