/* jshint globalstrict: true, curly: false */
'use strict';

var iter = window.iter;

describe("forEach", function() {
    it("given empty sequence does nothing", function() {
        var func = jasmine.createSpy('func');

        iter([]).forEach(func);

        expect(func).not.toHaveBeenCalled();
    });

    it("given non empty sequence calls passed function for every sequence element", function() {
        var func = jasmine.createSpy('func');

        iter([1,2,3]).forEach(func);

        expect(func.calls.count()).toBe(3);

        // func(value, index)
        expect(func.calls.argsFor(0)).toEqual([1, 0]);
        expect(func.calls.argsFor(1)).toEqual([2, 1]);
        expect(func.calls.argsFor(2)).toEqual([3, 2]);
    });
    
    it("function can have context set", function() {
        var context = {}, $this = null;

        iter([1]).forEach(function() {
            $this = this;
        }, context);

        expect($this).toBe(context);
    });

    it("quick can be used as function", function() {
        var context = { sum: 0 };

        iter([1,2,3,4]).forEach('this.sum += $', context);

        expect(context.sum).toBe(10);
    });
});
