
;(function(global) {
    'use strict';

    var isArray = function(value) {
        return value && Array.isArray(value);  
    };

    var isString = function(value) {
        return (typeof value === "string");
    };

    var isFunction = function(value) {
        return value && (typeof value === "function");
    };

    var bindContext = function(func, $this) {
        if ($this === undefined) {
            return func;
        }
        else {
            return func.bind($this);
        }
    };

    var argsToArray = function(args) {
        return Array.prototype.slice.call(args);
    };

    var ASCII_JS_IDENTIFIER_REGEX = /^[$a-z_][$a-z0-9_]*$/i;
    
    var isJSIdentifier = function(value) {
        return value && isString(value) && ASCII_JS_IDENTIFIER_REGEX.test(value);
    };

    var quickToFunction = function(expression, options) {
        try {
            options = options || {};
            var parameters = options.parameters || ['$', '$index'];
           
            var body;
            if (options.boolResult) {
                body = 'return Boolean(' + expression + ');';
            }
            else {
                body = 'return (' + expression + ');';
            }

            return Function.apply(null, parameters.concat([body]));
        }
        catch(ex) {
            var error = new Error(
                'Attempt to create function from expression "' + expression + '" failed. ' + 
                'See $details property for original exception.');

            error.$details = ex;
            throw error;
        }
    };

    var isPropertySelector = function(value) {
        // any value different than undefined can be used as property selector
        // e.g. foo[1], foo['bar'], foo[true]
        
        return (value !== undefined);
    };

    var createPropertySelectorFunction = function(propertyName) {
        return function($) {
            return $[propertyName];
        };
    };

    var isPropertyMultiselector = function(obj) {
        if (!isArray(obj)) {
            return false;
        }

        for (var i = 0; i < obj.length; i += 1) {
            if (!isPropertySelector(obj[i])) {
                return false;
            }
        }

        return true;
    };

    var createPropertyMultiselectorFunciton = function(propertyNames) {
        return function($) {
            var result = {};

            for (var i = 0; i < propertyNames.length; i += 1) {
                result[propertyNames[i]] = $[propertyNames[i]];
            }

            return result;
        };
    };

    var isQuick = function(value) {
        return value && isString(value);
    };

    var throwIfNotQuickOrFunction = function(argValue, argName, funcName) {
        if (!argValue || (!isString(argValue) && !isFunction(argValue))) {
            throw new Error(
                'Invalid value of iter.' + funcName + '() ' +
                'argument ' + argName + '. ' +
                'Valid values are quick expressions and functions');
        }
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

    var ObjectIterator = function($object) {
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

    var SOME_DEFAULT_PRED = function(x) { return x; };

    Iterable.prototype.some= function(pred, $this) {
        pred = pred || SOME_DEFAULT_PRED;

        throwIfNotQuickOrFunction(pred, 'pred', 'some');

        if (isQuick(pred)) {
            pred = quickToFunction(pred, { boolResult: true });
        }

        pred = bindContext(pred, $this);

        var it = this.iterator();

        var index = -1;
        while (it.next()) {
            index += 1;

            if (pred(it.current(), index)) {
                return true;
            }
        }

        return false;
    };

    var EVERY_DEFAULT_PRED = function(x) { return x; };

    Iterable.prototype.every = function(pred, $this) {
        pred = pred || EVERY_DEFAULT_PRED;

        throwIfNotQuickOrFunction(pred, 'pred', 'every');

        if (isQuick(pred)) {
            pred = quickToFunction(pred, { boolResult: true });
        }

        pred = bindContext(pred, $this);

        var it = this.iterator();

        var index = -1;
        while (it.next()) {
            index += 1;

            if (!pred(it.current(), index)) {
                return false;
            }
        }

        return true;
    };

    Iterable.prototype.and = function() {
        var it = this.iterator();
        var curr = true;

        while (it.next()) {
            curr = it.current();
            if (!curr) {
                break;
            }
        }

        return curr;
    };

    Iterable.prototype.or = function() {
        var it = this.iterator();
        var curr = false;

        while (it.next()) {
            curr = it.current();
            if (curr) {
                break;
            }
        }

        return curr;
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
            operation = quickToFunction(operation, { boolResult: false, parameters: '$acc, $' });
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
            operation = quickToFunction(operation, { boolResult: false, parameters: '$acc, $' });
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

    var SkipIterator = function($iterator, $skip) {
        this.$$iterator = $iterator;
        this.$$skip = $skip;
    };

    SkipIterator.prototype.next = function() {
        while (this.$$iterator.next()) {
            if (this.$$skip !== 0) {
                this.$$skip -= 1;
                continue;
            }
            else {
                return true;
            }
        }

        return false;
    };

    SkipIterator.prototype.current = function() {
        return this.$$iterator.current();
    };

    Iterable.prototype.skip = function(count) {
        count = Number(count);
        var that = this;

        if (!isFinite(count)) {
            throw new Error(
                'iter.skip: invalid argument value.');
        }

        count = (count < 0 ? 0 : count);

        return new Iterable(function() {
            var it = that.iterator();
            return new SkipIterator(it, count);
        });
    };

    var TakeIterator = function($iterator, $take) {
        this.$$iterator = $iterator;
        this.$$take = $take;
    };

    TakeIterator.prototype.next = function() {
        if (this.$$take === 0) {
            return false;
        }

        if (this.$$iterator.next()) {
            this.$$take -= 1;
            return true;
        }
        else {
            return false;
        }
    };

    TakeIterator.prototype.current = function() {
        return this.$$iterator.current();
    };

    Iterable.prototype.take = function(count) {
        count = Number(count);
        var that = this;

        if (!isFinite(count)) {
            throw new Error(
                'iter.take: invalid argument value.');
        }

        count = (count < 0 ? 0 : count);

        return new Iterable(function() {
            var it = that.iterator();
            return new TakeIterator(it, count);
        });
    };

    Iterable.prototype.join = function(separator) {
        var array = this.toArray();
        return array.join(separator);
    };

    // use: SORT_BY_COMPARER_CONSTRUCTOR (cmp1, cmp2, comp3, ...)
    var SORT_BY_COMPARER_CONSTRUCTOR = function() {
        var comparers = argsToArray(arguments);

        return function(left, right) {
            for (var i = 0; i < comparers.length; i++) {
                var cmp = comparers[i](left, right);
                if (cmp !== 0) {
                    return cmp;
                }
            }

            return 0;
        };
    };

    // $comparer.propertyName
    //
    var SORT_BY_QUICK_REGEX = /^\$[a-z_][a-z0-9_]*\.[a-z_][a-z0-9_]*/i;
    var isSortByQuick = function(str) {
        return SORT_BY_QUICK_REGEX.test(str);
    };

    var createComparerFromQuick = function(quick) {
        var dot = quick.indexOf('.');
        var comparer = quick.substr(0, dot);
        var propertyName = quick.substr(dot + 1);

        var comparerFunction = Iterable.prototype.sortBy.comparers[comparer];
        if (!comparerFunction) {
            throw new Error('iter.sortBy: cannot find comparer: "' + comparer + '"');
        }

        var propertySelector = createPropertySelectorFunction(propertyName);
        return (function(l, r) {
            l = propertySelector(l);
            r = propertySelector(r);

            return comparerFunction(l, r);
        });
    };

    Iterable.prototype.sortBy = function() {
        var sortCriteria = argsToArray(arguments);

        if (sortCriteria.length === 0) {
            throw new Error('iter.sortBy: specify at least one sorting criteria');
        }

        for (var i = 0; i < sortCriteria.length; i += 1) {
            throwIfNotQuickOrFunction(sortCriteria[i], 'sort criteria', 'sortBy');

            if (typeof sortCriteria[i] === "string" && !isSortByQuick(sortCriteria[i])) {
                throw new Error('iter.sortBy: invalid sort criteria: "' + sortCriteria[i] + '". ' + 
                                'Quick sort criteria have $desc.propName or $asc.propName format.');
            }

            sortCriteria[i] = createComparerFromQuick(sortCriteria[i]);
        }

        var cmp = SORT_BY_COMPARER_CONSTRUCTOR.apply(null, sortCriteria);
        var that = this;

        return new Iterable(function() {
            var data = that.toArray();
            Array.sort(data, cmp);

            return ArrayIterator(data);
        });
    };

    Iterable.prototype.sortBy.comparers = {
        asc: function(l, r) {
            if (l < r) {
                return (-1);
            }
            else if (l > r) {
                return 1;
            }
            else {
                return 0;
            }
        },

        desc: function(l, r) {
            if (l < r) {
                return 1;
            }
            else if (l > r) {
                return (-1);
            }
            else {
                return 0;
            }
        },

        localeAsc: function(l, r) {
            return (l || '').localeCompare(r);
        },

        localeDesc: function(l, r) {
            return -(l || '').localeCompare(r);
        }
    };

    // Sort
    // foo.sortBy('$desc.name', '$asc.age')
    // foo.sort(cmp) - sort using standart comparision

    // TODO:
    // Sort .sortBy - .sortBy
    // Reverse
    // string Join
    // GroupBy
    // InnerJoin
    // LeftJoin
    // CrossJoin ??
    
    // iter.concat(it1, it2, it3)
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
            throw new Error("Only arrays, object and functions can be iterated.");
        }
    };

    // EXPORTS THROUGH ITER
    iter.Iterable = Iterable;

    // call from : to
    // call from : step : to
    // [from..step..to)
    iter.range = function() {
        var argsLenght = arguments.length;
        var args = Array.prototype.slice.call(arguments);

        if (argsLenght !== 2 && argsLenght !== 3) {
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
        }

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

    var EMPTY_ITERATOR_FUNCTION = function() { return undefined; };
    iter.empty = function() {
        return iter(EMPTY_ITERATOR_FUNCTION);
    };

    // usage: iter.quick('$ > 10')
    // or iter.quick(['$', '$index'], '$ + $index');
    iter.quick = function(parameters, expression, options) {
        var args = argsToArray(arguments);
        
        if (args.length === 1) {
            parameters = ['$'];
            expression = args[0];
            options = {};
        }

        // validate parameters
        if (!isArray(parameters)) {
            throw new Error('iter.quick: parameters should be passed as array of identifiers e.g. ' +
                            'iter.quick(["$"], "$ > 3")');
        }

        for (var i = 0; i < parameters.length; i += 1) {
            if (!isJSIdentifier(parameters[i])) {
                throw new Error('iter.quick: invalid JavaScript parameter name: "' + parameters[i] + '"');
            }
        }

        // validate expression
        if (!isQuick(expression)) {
            throw new Error('iter.quick: invalid or missing expression argument');
        }
    
        options = options || {};

        return quickToFunction(expression, {
            parameters: parameters
        });
    };

})(typeof window === "undefined" ? global : window);
