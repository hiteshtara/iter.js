
;(function(global) {
    'use strict';

    var isArray = function(value) {
        return value && Array.isArray(value);  
    };

    var isString = function(value) {
        return (typeof value === "string");
    };

    /*var isNumber = function(value) {
        return (typeof value === "number");
    };*/

    var isFunction = function(value) {
        return value && (typeof value === "function");
    };

    var isObject = function(value) {
        return value && (typeof value === "object");
    };

    var bindContext = function(func, $this) {
        if ($this === undefined) {
            return func;
        }
        else {
            return func.bind($this);
        }
    };

    var toArray = function(args) {
        return Array.prototype.slice.call(args);
    };

    var IDENTITY_FUNCTION = function(x) { return x; };

    var isJSIdentifier = (function() {
        var ASCII_JS_IDENTIFIER_REGEX = /^[$a-z_][$a-z0-9_]*$/i;
        
        return function(value) {
            return value && isString(value) && ASCII_JS_IDENTIFIER_REGEX.test(value);
        };
    })();

    var QUICK_RESULT = {
        BOOL: "bool",
        VOID: "void",
        ANY:  "any"
    };

    var quickToFunction = function(expression, options) {
        try {
            options = options || {};
            var parameters = options.parameters || ['$', '$index'];
           
            var body;
            
            switch(options.result) {
            case QUICK_RESULT.BOOL:
                body = 'return Boolean(' + expression + ');';
                break;

            case QUICK_RESULT.VOID:
                body = expression + '; return;';
                break;

            default:
                body = 'return (' + expression + ');';
                break;
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

    var extend = function() {
        var args = toArray(arguments);
        var result = {};

        for(var i = 0; i < args.length; i += 1) {
            var ithObject = args[i];

            for(var prop in ithObject) {
                if (Object.prototype.hasOwnProperty.call(ithObject, prop)) {
                    result[prop] = ithObject[prop];
                }
            }
        }

        return result;
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
            var key = this.$$keys[this.$$index];
            var value = this.$$object[key];

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
            // FIXME: function returns undefined on first call
            // then this generates wrong message
            throw new Error("Call next() before current().");
        }
        else {
            return this.$$current;
        }
    };

    var Iterable = function(iteratorFunction) {
        if (!iteratorFunction || !isFunction(iteratorFunction)) {
            throw new Error("iter.Iterable: iteratorFunction must be a function.");
        }

        this.iterator = iteratorFunction;
    };

    var STANDARD_FUNCTION_OPTIONS_DEFAULTS = {
        funcResult: QUICK_RESULT.BOOL,
        funcParams: null // use defaults 
    };

    var standardFunction = function(options, callback) {
        options = extend({}, STANDARD_FUNCTION_OPTIONS_DEFAULTS, options);

        var func = options.func;
        var context = options.context;
        var iterable = options.iterable;

        throwIfNotQuickOrFunction(func, options.funcArgName, options.methodName);

        if (isQuick(func)) {
            func = quickToFunction(func, {
                result: options.funcResult,
                parameters: options.funcParams
            });
        }

        func = bindContext(func, context);
        
        return callback(func, iterable);
    };

    Iterable.prototype.forEach = function(func, $this) {
        var options = {
            func: func,
            funcResult: QUICK_RESULT.VOID,
            context: $this,

            funcArgName: 'func',
            methodName: 'forEach',

            iterable: this
        };

        standardFunction(options, function(func, iterable) {
            var it = iterable.iterator();
            var index = 0;

            while (it.next()) {
                func(it.current(), index);
                index += 1;
            }
        });
    };

    Iterable.prototype.isEmpty = function() { 
        var it = this.iterator();
        return (Boolean(it.next()) === false);
    };

    var SOME_DEFAULT_PRED = function(x) { return x; };

    Iterable.prototype.some = function(pred, $this) {
        var options = {
            func: (pred === undefined ? SOME_DEFAULT_PRED : pred),
            context: $this,

            funcArgName: 'pred',
            methodName: 'some',

            iterable: this
        };
       
        return standardFunction(options, function(pred, iterable) {
            var it = iterable.iterator();
            var index = 0;
            
            while (it.next()) {
                if (pred(it.current(), index)) {
                    return true;
                }
                
                index += 1;
            }

            return false;
        });
    };

    var EVERY_DEFAULT_PRED = function(x) { return x; };

    Iterable.prototype.every = function(pred, $this) {
        var options = {
            func: (pred === undefined ? EVERY_DEFAULT_PRED : pred),
            context: $this,

            funcArgName: 'pred',
            methodName: 'every',

            iterable: this
        };
       
        return standardFunction(options, function(pred, iterable) {
            var it = iterable.iterator();
            var index = 0;
            
            while (it.next()) {
                if (!pred(it.current(), index)) {
                    return false;
                }
                
                index += 1;
            }

            return true;
        });
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
        var it = this.iterator();
        var result = [];
        
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
        var options = {
            func: pred,
            context: $this,

            funcArgName: 'pred',
            methodName: 'filter',

            iterable: this
        };

        return standardFunction(options, function(pred, iterable) {
            return new Iterable(function() {
                var it = iterable.iterator();
                return new FilterIterator(it, pred);
            });
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
        var options = {
            func: map,
            funcResult: QUICK_RESULT.ANY,
            context: $this,

            funcArgName: 'map',
            methodName: 'map',

            iterable: this
        };
        
        return standardFunction(options, function(map, iterable) {
            return new Iterable(function() {
                var it = iterable.iterator();
                return new MapIterator(it, map);
            });
        });
    };

    Iterable.prototype.select = function() {
        var args = toArray(arguments);

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
                'properties use select("prop1", "prop2", "prop3") syntax.');
        }
        
        return this.map(mapFunc);
    };

    Iterable.prototype.reduce = function(seed, operation, $this) {
        if (seed === undefined) {
            throw new Error('iter.reduce: missing required argument "seed". ' +
                            'Use iter.reduce1() to perform reduce without having to specify seed.');
        }

        var options = {
            func: operation,
            funcResult: QUICK_RESULT.ANY,
            funcParams: ['$acc', '$', '$index'],
            context: $this,

            funcArgName: 'operation',
            methodName: 'reduce',

            iterable: this
        };
       
        return standardFunction(options, function(operation, iterable) {
            var it = iterable.iterator();
            var acc = seed;
            var index = 0;

            while (it.next()) {
                acc = operation(acc, it.current(), index);
                index += 1;
            }

            return acc;
        });
    };

    // call reduce1('$acc + $')
    Iterable.prototype.reduce1 = function(operation, $this) {
        var options = {
            func: operation,
            funcResult: QUICK_RESULT.ANY,
            funcParams: ['$acc', '$', '$index'],
            context: $this,

            funcArgName: 'operation',
            methodName: 'reduce1',

            iterable: this
        };
      
        return standardFunction(options, function(operation, iterable) {
            var it = iterable.iterator();
            
            if (!it.next()) {
                throw new Error('iter.reduce1: sequence contains no elements.');
            }

            var acc = it.current();
            var index = 1;

            while (it.next()) {
                acc = operation(acc, it.current(), index);
                index += 1;
            }

            return acc;
        });
    };

    Iterable.prototype.sum = function(selector, $this) {
        var options = {
            func: (selector === undefined ? IDENTITY_FUNCTION : selector),
            funcResult: QUICK_RESULT.ANY,
            context: $this,

            funcArgName: 'selector',
            methodName: 'sum',

            iterable: this
        };
        
        return standardFunction(options, function(selector, iterable) {
            var it = iterable.iterator();
            var index = 0;
            var sum = 0;

            while (it.next()) {
                var tmp = selector(it.current(), index);
                sum += Number(tmp);
                index += 1;
            }

            return sum;
        });
    };

    Iterable.prototype.product = function(selector, $this) {
        var options = {
            func: (selector === undefined ? IDENTITY_FUNCTION : selector),
            funcResult: QUICK_RESULT.ANY,
            context: $this,

            funcArgName: 'selector',
            methodName: 'product',

            iterable: this
        };
        
        return standardFunction(options, function(selector, iterable) {
            var it = iterable.iterator();
            var index = 0;
            var prod = 1.0;

            while (it.next()) {
                var tmp = selector(it.current(), index);
                prod *= Number(tmp);
                index += 1;
            }

            return prod;
        });
    };

    Iterable.prototype.avg = function(selector, $this) {
        var options = {
            func: (selector === undefined ? IDENTITY_FUNCTION : selector),
            funcResult: QUICK_RESULT.ANY,
            context: $this,

            funcArgName: 'selector',
            methodName: 'avg',

            iterable: this
        };

        return standardFunction(options, function(selector, iterable) {
            var it = iterable.iterator();
            var n = 0, sum = 0;

            while (it.next()) {
                var tmp = selector(it.current(), n);
                
                n += 1;
                sum += Number(tmp);
            }

            return (n === 0 ? NaN : (sum / n));
        });
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

    var multiComparer = function() {
        var comparers = toArray(arguments);

        return function(left, right) {
            for (var i = 0; i < comparers.length; i++) {
                var comparisionResult = comparers[i](left, right);
                if (comparisionResult !== 0) {
                    return comparisionResult;
                }
            }

            return 0;
        };
    };

    // $.age or $local."first name" or $.age desc or $local."first name" desc
    // $ desc - in case of numbers, $locale in case of strings
    var SORT_BY_QUICK_REGEX = /^\$[a-z0-9_]*(\.(([$a-z_][$a-z0-9_]*)|("[^"]*"))( desc)?)?/i;
    var isSortByQuick = function(str) {
        return SORT_BY_QUICK_REGEX.test(str);
    };

    var parseSortByQuick = function(quick) {
        var quickWithoutDesc = quick;
        var desc = false;

        if (quick.lastIndexOf(" desc") === (quick.length - " desc".length)) {
            quickWithoutDesc = quick.substring(0, (quick.length - " desc".length));
            desc = true;
        }

        var dot = quickWithoutDesc.indexOf('.');
        var hasProperty = true;
        if (dot === -1) {
            dot = quickWithoutDesc.length;
            hasProperty = false;
        }

        var comparer = quick.substring(0, dot);
        var propertyName = (hasProperty ? quickWithoutDesc.substring(dot + 1) : null);

        // remove " from property name e.g. "foo" -> foo
        if (propertyName && (propertyName.indexOf('\"') === 0)) {
            propertyName = propertyName.substring(1, propertyName.length-1);
        }

        return {
            original: quick,
            comparer: comparer,
            propertyName: propertyName,
            desc: desc
        };
    };

    var reverseCompareFunction = function(compareFunction) {
        return function() {
            return -(compareFunction.apply(this, arguments));
        };
    };

    // map string -> function
    // $ is added to keys to allow inserting keys like __proto__
    var sortByComparers = null;
    
    var resetComparers = function() {
        sortByComparers = Object.create(null);
        
        sortByComparers.$$ = function(l, r) {
            if (l < r) {
                return (-1);
            }
            else if (l > r) {
                return 1;
            }
            else {
                return 0;
            }
        };
        
        sortByComparers.$locale$ = function(l, r) {
            return String(l || '').localeCompare(r);
        };
    };

    resetComparers();

    var addSortByComparer = function(comparerName, comparerFunction) {
        sortByComparers[comparerName + '$'] = comparerFunction;
    };

    var getSortByComparer = function(comparerName) {
        return sortByComparers[comparerName + '$'];
    };

    var createComparerFromQuick = function(quick) {
        quick = parseSortByQuick(quick);
        
        var comparerFunction = getSortByComparer(quick.comparer);
        if (!comparerFunction) {
            throw new Error('iter.sortBy: cannot find comparer: "' + quick.comparer + '"');
        }

        if (quick.desc) {
            comparerFunction = reverseCompareFunction(comparerFunction);
        }

        if (quick.propertyName !== null) {
            var propertySelector = createPropertySelectorFunction(quick.propertyName);

            return function(l, r) {
                l = propertySelector(l);
                r = propertySelector(r);

                return comparerFunction(l, r);
            };
        }
        else {
            return comparerFunction;
        }
    };

    Iterable.prototype.sortBy = function() {
        var sortCriteria = toArray(arguments);

        if (sortCriteria.length === 0) {
            throw new Error('iter.sortBy: specify at least one sorting criteria.');
        }

        for (var i = 0; i < sortCriteria.length; i += 1) {
            throwIfNotQuickOrFunction(sortCriteria[i], 'arguments', 'sortBy');

            if (isString(sortCriteria[i])) {
                if (!isSortByQuick(sortCriteria[i])) {
                    throw new Error('iter.sortBy: invalid sort criteria: "' + sortCriteria[i] + '". ' + 
                                    'Quick sort criteria have $comparer.propName or ' +
                                    '$comparer."prop name" format.');
                }

                sortCriteria[i] = createComparerFromQuick(sortCriteria[i]);
            }
            else if (!isFunction(sortCriteria[i])) {
                throw new Error('iter.sortBy: sort criteria must be quick or function.' +
                                'Invalid argument at position: ' + i + '.');
            }
        }

        var cmp = multiComparer.apply(null, sortCriteria);
        var that = this;

        return new Iterable(function() {
            var data = that.toArray();
            data.sort(cmp);

            return new ArrayIterator(data);
        });
    };

    Iterable.prototype.sort = function(comparer, $this) {
        if (comparer !== undefined) {
            if (!isFunction(comparer)) {
                throw new TypeError('iter.sort: comparer must be a function.');
            }

            comparer = bindContext(comparer, $this);
        }

        var that = this;

        return new Iterable(function() {
            var data = that.toArray();

            if (comparer) {
                data.sort(comparer);
            }
            else {
                data.sort();
            }

            return new ArrayIterator(data);
        });
    };
    
    // TODO:
    // Reverse
    // GroupBy
    // InnerJoin
    // LeftJoin
    // CrossJoin ??
    
    // iter.concat(it1, it2, it3)
    // 

    var iter = global.iter = function(obj) {
        if (isArray(obj)) {
            return new Iterable(function() {
                return new ArrayIterator(obj);
            });
        }
        else if (isObject(obj)) {
            return new Iterable(function() {
                return new ObjectIterator(obj);
            });
        }
        else if(isFunction(obj)) {
            return new Iterable(function() {
                return new FunctionIterator(obj);
            });
        }
        else {
            throw new Error("iter: Only arrays, object and functions can be iterated.");
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
        var args = toArray(arguments);
        
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
            result: QUICK_RESULT.ANY,
            parameters: parameters
        });
    };

    iter.sortBy = Object.create(null);

    iter.sortBy.addComparer = function(comparerName, comparerFunction) {
        if (!comparerName) {
            throw new Error('iter.sortBy.addComparer: comparer name cannot be empty.');
        }

        if (!isString(comparerName)) {
            throw new TypeError('iter.sort.addComparer: comparer name must be a string.');
        }

        if (comparerName.indexOf('$') !== 0) {
            throw new Error('iter.sortBy.addComparer: comparer name must start with $.');
        }

        if (!comparerFunction) {
            throw new Error('iter.sort.addComparer: missing argument - comparerFunction.');
        }

        if (!isFunction(comparerFunction)) {
            throw new TypeError('iter.sort.addComparer: Comparer function must be a function.'); 
        }

        addSortByComparer(comparerName, comparerFunction);
    };
     
    iter.sortBy.resetComparers = function() {
        resetComparers();
    };

})(typeof window === "undefined" ? global : window);
