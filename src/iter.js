
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
            if (options.boolResult) {
                return eval('(function($) { return !!(' + expression + '); })');
            }
            else {
                return eval('(function($) { return (' + expression + '); })');
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

    var throwIfNotQuickOrFunction = function(argValue, argName, funcName) {
        if (!argValue || (typeof argValue !== "string" && typeof argValue !== "function")) {
            throw new Error(
                'Invalid value of ' + funcName + ' ' +
                'argument ' + argValue + '. ' +
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
            if(newCurrent) {
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
        if (!this.$$current) {
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

    Iterable.prototype.any = function(pred, $this) {
        throw 1;
    };

    Iterable.prototype.all = function(pred, $this) {
        throw 1;
    };

    Iterable.prototype.count = function(predOpt, $this) {
        throw 1;
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
    };

    FilterIterator.prototype.next = function() {
        while (this.$$iterator.next()) {
            if (this.$$pred(this.$$iterator.current())) {
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
    };

    MapIterator.prototype.next = function() {
        if (this.$$iterator.next()) {
            this.$$cache = null;
            return true;
        }
        else {
            return false;
        }
    };

    MapIterator.prototype.current = function() {
        if (!this.$$cache) {
            this.$$cache = this.$$map(this.$$iterator.current());
        }

        return this.$$cache;
    };

    Iterable.prototype.map = function(map, $this) {
        var that = this;
        var args = argsToArray(arguments);

        throwIfNotQuickOrFunction(map, 'map', 'map');

        if ((args.length > 1) && isPropertyMultiselector(args)) {
            map = createPropertyMultiselectorFunciton(args);
        }
        else if (isPropertySelector(map)) {
            map = createPropertySelectorFunction(map);
        }
        else {
            map = bindContext(map, $this);
        }

        return new Iterable(function() {
            var it = that.iterator();
            return new MapIterator(it, map);
        });

    };

    // TODO:
    // FoldLeft
    // Take
    // Skip
    // Sort
    // Reverse
    // toArray
    // string Join
    // GroupBy
    // InnerJoin
    // LeftJoin
    // CrossJoin ??
    
    // iter.range
    // iter.concat(it1, it2, it3)
    // iter.empty
    // iter(function() { return x++; }) <-- generator
    // 

    global.iter = function(obj) {
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

})(window);
