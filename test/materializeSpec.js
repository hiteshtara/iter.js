/* jshint globalstrict: true, curly: false */
'use strict';

var iter = window.iter;

describe('materialize', function() {
    it('evaluates sequence immediately and only once', function() {
        var data = [1,2,3], i = 0;
        var callCount = 0;

        var generator = function _f() {
            callCount++;
            return (i < data.length ? data[i++] : undefined);   
        };

        var materialized = iter(generator)
            .materialize();
        
        expect(callCount).toBe(4);

        materialized.toArray();
        materialized.toArray();

        expect(callCount).toBe(4);
        
    });
});
