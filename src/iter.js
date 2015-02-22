
;(function(global) {
    'use strict';

    var noConflict = global.iter;
    var exports = {};

    var bindContext = function(func, $this) {
        if (!$this) {
            return func;
        }
        else {
            return func.bind($this);
        }
    };

    var quickToFunction = function(expression, options) {
        try {
            var parameters = options.parameters || '$, $index';

            if (options.boolResult) {
                return eval('(function(' + parameters +') { return !!(' + expression + '); })');
            }
            else {
                return eval('(function(' + parameters +') { return (' + expression + '); })');
            }
        }
        catch(ex) {
            var error = new Error(
                'Attempt to create function from expression "' + expression + '" failed. ' + 
                'See $details property for original exception.');

            error.$details = ex;
            throw error;
        }
    };

    var jsIdentifierRegex = /^[a-z_][a-z0-9_]*$/i;

    var isPropertySelector = function(obj) {
        return obj && (typeof obj === "string") && jsIdentifierRegex.test(obj);
    };

    var createPropertySelectorFunction = function(propertyName) {
        return eval('(function($) { return ($["' + propertyName + '"]); })');
    };

    var isPropertyMultiselector = function(obj) {
        if (!obj || !Array.isArray(obj))
            return false;

        for (var i = 0; i < obj.length; i += 1) {
            if (!isPropertySelector(obj[i]))
                return false;
        }

        return true;
    };

    var createPropertyMultiselectorFunciton = function(propertyNames) {
        // { "foo": $["foo"], "bar": $["bar"] }
        var selected = '{ ';
        var first = true;

        propertyNames.forEach(function(property) {
            if (!first) {
                selected += ", ";
            }
            first = false;

            selected += '"' + property + '": ' + '$["' + property + '"]';
        });

        selected += " }";

        return eval('(function($){ return (' + selected + '); })');
    };

    var isQuickRegex = /\$/;
    var isQuick = function(str) {
        return str && typeof str === "string" && isQuickRegex.test(str);
    };

    var throwIfNotQuickOrFunction = function(argValue, argName, funcName) {
        if (!argValue || (typeof argValue !== "string" && typeof argValue !== "function")) {
            throw new Error(
                'Invalid value of iter.' + funcName + '() ' +
                'argument ' + argName + '. ' +
                'Valid values are quick expressions and functions');
        }
    };

    var argsToArray = function(args) {
        return Array.prototype.slice.call(args);
    };

    var ArrayIterator = function($array) {
        this.$$index = -1;
        this.$$array = $array;
    };

    ArrayIterator.prototype.next = function() {
        var incIndex = this.$$index + 1;

        if (incIndex < this.$$array.length) {
            this.$$index = incIndex;
            return true;
        }
        else {
            return false;
        }
    };

    ArrayIterator.prototype.current = function() {
        if (this.$$index === -1) {
            throw new Error('Call next() before current().');
        }
        else {
            return this.$$array[this.$$index];
        }
    };

    var ObjectIterator = function($object, $keys) {
        this.$$index = -1;
        this.$$keys = Object.keys($object);
        this.$$object = $object;
    };

    ObjectIterator.prototype.next = function() {
        var i = this.$$index + 1, keys = this.$$keys, obj = this.$$object;

        while (i < keys.length) {
            if (Object.prototype.hasOwnProperty.call(obj, keys[i])) {
                this.$$index = i;
                break;
            }
            else {
                i += 1;       
            }
        }

        return (i < keys.length);
    };

    ObjectIterator.prototype.current = function() {
        if (this.$$index === -1) {
            throw new Error('call next() before current()');
        }
        else {
            var key = this.$$keys[this.$$index],
                value = this.$$object[key];

            return { key: key, value: value };
        }
    };
 
    var FunctionIterator = function($func) {
        this.$$func = $func;
    };

    FunctionIterator.prototype.next = function() {
        try {
            var newCurrent = this.$$func();
            if (newCurrent !== undefined) {
                this.$$current = newCurrent;
                return true;
            }
            else {
                return false;
            }
        }
        catch(ex) {
            var error = new Error(
                'Function thrown exception ' +
                '($details property contains original exception).');
         
            error.$details = ex;
            throw error;
        }
    };

    FunctionIterator.prototype.current = function() {
        if (this.$$current === undefined) {
            throw new Error("Call next() before current().");
        }
        else {
            return this.$$current;
        }
    };

    var Iterable = function(iteratorFunction) {
        if (!iteratorFunction || typeof iteratorFunction !== "function") {
            throw new Error("iteratorFunction must be a function.");
        }

        this.iterator = iteratorFunction;
    };

    Iterable.prototype.forEach = function(func, $this) {
        var it = this.iterator(), i = 0;
        
        func = bindContext(func, $this);

        while (it.next()) {
            func(it.current(), i);
            i += 1;
        }
    };

    Iterable.prototype.isEmpty = function() {
        var it = this.iterator();
        return (it.next() === false);
    };

    var ANY_DEFAULT_PRED = function(x) { return x; };

    Iterable.prototype.any = function(pred, $this) {
        pred = pred || ANY_DEFAULT_PRED;

        throwIfNotQuickOrFunction(pred, 'pred', 'any');

        if (isQuick(pred)) {
            pred = quickToFunction(pred, { boolResult: true });
        }

        pred = bindContext(pred, $this);

        var it = this.iterator();

        var index = -1;
        while (it.next()) {
            index += 1;

            if (pred(it.current(), index))
                return it.current();
        }

        return false;
    };

    var ALL_DEFAULT_PRED = function(x) { return x; };

    Iterable.prototype.all = function(pred, $this) {
        pred = pred || ALL_DEFAULT_PRED;

        throwIfNotQuickOrFunction(pred, 'pred', 'all');

        if (isQuick(pred)) {
            pred = quickToFunction(pred, { boolResult: true });
        }

        pred = bindContext(pred, $this);

        var it = this.iterator();

        var index = -1;
        while (it.next()) {
            index += 1;

            if (!pred(it.current(), index))
                return false;
        }

        return (index === -1 ? true : it.current());
    };

    Iterable.prototype.count = function(predOpt, $this) {
        var it = null;

        if (predOpt) {
            it = this.filter(predOpt, $this).iterator();
        }
        else {
            it = this.iterator();
        }

        var count = 0;
        while (it.next()) {
            count += 1;
        }
        return count;
    };

    Iterable.prototype.toArray = function() {
        var result = [], it = this.iterator();

        while (it.next()) {
            result.push(it.current());
        }

        return result;
    };

    var FilterIterator = function($iterator, $pred) {
        this.$$iterator = $iterator;
        this.$$pred = $pred;
        this.$$index = -1;
    };

    FilterIterator.prototype.next = function() {
        while (this.$$iterator.next()) {
            this.$$index += 1;
            if (this.$$pred(this.$$iterator.current(), this.$$index)) {
                return true;
            }
        }

        return false;
    };

    FilterIterator.prototype.current = function() {
        return this.$$iterator.current();
    };

    Iterable.prototype.filter = function(pred, $this) {
        var that = this;

        throwIfNotQuickOrFunction(pred, 'pred', 'filter');

        if (typeof pred === "string") {
            pred = quickToFunction(pred, { boolResult: true });
        }

        pred = bindContext(pred, $this);

        return new Iterable(function() {
            var it = that.iterator();
            return new FilterIterator(it, pred);
        });
    };

    var MapIterator = function($iterator, $map) {
        this.$$iterator = $iterator;
        this.$$map = $map;
        this.$$index = -1;

        this.$$evaluated = false;
    };

    MapIterator.prototype.next = function() {
        if (this.$$iterator.next()) {
            this.$$cache = undefined;
            this.$$evaluated = false;

            this.$$index += 1;
            return true;
        }
        else {
            return false;
        }
    };

    MapIterator.prototype.current = function() {
        if (!this.$$evaluated) {
            this.$$cache = this.$$map(this.$$iterator.current(), this.$$index);
            this.$$evaluated = true;
        }

        return this.$$cache;
    };

    Iterable.prototype.map = function(map, $this) {
        var that = this;

        throwIfNotQuickOrFunction(map, 'map', 'map');
        
        if (isQuick(map)) {
            map = quickToFunction(map, { boolResult: false });
        }
        
        map = bindContext(map, $this);

        return new Iterable(function() {
            var it = that.iterator();
            return new MapIterator(it, map);
        });
    };

    Iterable.prototype.select = function() {
        var args = argsToArray(arguments);

        if (args.length === 0) {
            throw new Error(
                'iter.select: No properties to select passed to select() call.');
        }

        var mapFunc;

        if ((args.length > 1) && isPropertyMultiselector(args)) {
            mapFunc = createPropertyMultiselectorFunciton(args);
        }
        else if (args.length === 1 && isPropertySelector(args[0])) {
            mapFunc = createPropertySelectorFunction(args[0]);
        }
        else {
            throw new Error(
                'iter.select: Invalid argument, select() only accept property name(s). ' + 
                'To select single property use select("propertyName") syntax, to select multiple ' +
                'properties use select("prop1", "prop2", "prop3").');
        }
        
        return this.map(mapFunc);
    };

    // call fold(0, '$acc + $')
    Iterable.prototype.foldl = function(seed, operation, $this) {
        throwIfNotQuickOrFunction(operation, 'operation', 'foldl');
        
        if (isQuick(operation)) {
            map = quickToFunction(map, { boolResult: false, parameters: '$acc, $' });
        }
        
        operation = bindContext(operation, $this);

        var acc = seed;
        var it = this.iterator();

        while (it.next()) {
            acc = operation(acc, it.current());
        }

        return acc;
    };

    // call foldl1('$acc + $')
    Iterable.prototype.foldl1 = function(operation, $this) {
        throwIfNotQuickOrFunction(operation, 'operation', 'foldl1');
        
        if (isQuick(operation)) {
            map = quickToFunction(map, { boolResult: false, parameters: '$acc, $' });
        }
        
        operation = bindContext(operation, $this);

        var it = this.iterator();
        if (!it.next()) {
            throw new Error('iter.foldl1: sequence contains no elements.');
        }

        var acc = it.current();
        while (it.next()) {
            acc = operation(acc, it.current());
        }

        return acc;
    };

    var OP_PLUS = function(acc, x) { return acc + Number(x); };

    Iterable.prototype.sum = function(seed) {
        seed = Number(seed) || 0;

        return this.foldl(seed, OP_PLUS);
    };

    var OP_MUL = function(acc, x) { return acc*Number(x); };

    Iterable.prototype.product = function(seed) {
        seed = Number(seed) || 1;

        return this.foldl(seed, OP_MUL);
    };

    Iterable.prototype.avg = function() {
        var it = this.iterator();

        var n = 0, sum = 0;

        while (it.next()) {
            n += 1;
            sum += Number(it.current());
        }

        return (n === 0 ? NaN : (sum / n));
    };

    // TODO:
    // FoldLeft
    // Take
    // Skip
    // Sort
    // Reverse
    // string Join
    // GroupBy
    // InnerJoin
    // LeftJoin
    // CrossJoin ??
    
    // iter.range
    // iter.concat(it1, it2, it3)
    // iter.empty
    // 

    var iter = global.iter = function(obj) {
        if (Array.isArray(obj)) {
            return new Iterable(function() {
                return new ArrayIterator(obj);
            });
        }
        else if (obj && typeof obj === "object") {
            return new Iterable(function() {
                return new ObjectIterator(obj);
            });
        }
        else if(obj && typeof obj === "function") {
            return new Iterable(function() {
                return new FunctionIterator(obj);
            });
        }
        else {
            throw new Error("Only arrays and object can be iterated.");
        }
    };

    // call from : to
    // call from : step : to
    // [from..step..to)
    iter.range = function() {
        var argsLenght = arguments.length;
        var args = Array.prototype.slice.call(arguments);

        if (argsLenght != 2 && argsLenght != 3) {
            throw new Error(
                'iter.range: Invalid range arguments. ' +
                'Use range(from, to) or range(from, step, to).');
        }

        var hasStep = (argsLenght === 3);
        
        var from = Number(args[0]);
        var to = Number(hasStep ? args[2] : args[1]);

        if (!isFinite(from)) {
            throw new Error('iter.range: from must be a finite number.');
        }

        if (!isFinite(to)) {
            throw new Error('iter.range: to must be a finite number.');
        }

        var step;
        if (from <= to) {
            step = (hasStep ? args[1] : 1);
            if (step <= 0) {
                throw new Error('iter.range: step must be a positive number.');
            }
        }
        else {
            step = (hasStep ? args[1] : -1);
            if (step >= 0) {
                throw new Error('iter.range: step must be a negative number.');
            }
        };

        if (!isFinite(step)) {
            throw new Error('iter.range: step must be finite number.');
        }

        var index = 0;
        if (step >= 0) {
            return iter(function() {
                var next = from + index * step;
                if (next >= to) {
                    return undefined;
                }
                else {
                    index += 1;
                    return next;
                }
            });
        }
        else {
            return iter(function() {
                var next = from + index * step;
                if (next <= to) {
                    return undefined;
                }
                else {
                    index += 1;
                    return next;
                }
            });
        }
    };

})(window);
