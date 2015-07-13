
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
    var ALWAYS_TRUE_PREDICATE = function() { return true; };

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

    var ArrayKeyHashtable = (function() {
        var ArrayKeyHashtable = function ArrayKeyHashtable() {
            this.items = Object.create(null);
        };

        var computeHash = function(key) {
            return key.join('#');
        };

        var keysEqual = function(leftKey, rightKey) {
            if (leftKey.length !== rightKey.length) {
                return false;
            }

            for (var i = 0; i < leftKey.length; i += 1) {
                if (leftKey[i] !== rightKey[i]) {
                    return false;
                }
            }

            return true;
        };

        var getCollisionList = function(hashtable, key, options) {
            if (!isArray(key)) {
                throw new TypeError('key must be array of primitives.');
            }

            var items = hashtable.items;
            var hash = computeHash(key);

            var collisionList = items[hash + '$'];

            if (!collisionList && options && options.insertIfNotExist) {
                items[hash + '$'] = collisionList = [];
            }

            return collisionList;
        };

        var getObjectWithKey = function(collisionList, key) {
            for (var i = 0; i < collisionList.length; i += 1) {
                if (keysEqual(collisionList[i].key, key)) {
                    return collisionList[i];
                }
            }

            return null;
        };

        ArrayKeyHashtable.prototype.put = function(key, value) {
            var collisionList = getCollisionList(this, key, { insertIfNotExist: true });
            
            var obj = getObjectWithKey(collisionList, key);
            if (obj) {
                obj.value = value;
            }
            else {
                collisionList.push({ key: key, value: value });
            }
        };

        var internalGet = function(hashtable, key) {
            var collisionList = getCollisionList(hashtable, key, { insertIfNotExist: false });
            if (!collisionList) {
                return null;
            }

            return getObjectWithKey(collisionList, key);
        };

        ArrayKeyHashtable.prototype.get = function(key) {
            var obj = internalGet(this, key);
            return (obj ? obj.value : undefined);
        };

        ArrayKeyHashtable.prototype.contains = function(key) {
            return (internalGet(this, key) !== null);
        };

        ArrayKeyHashtable.prototype.toArray = function() {
            var result = [];
            var items = this.items;
            var hasOwnProperty = {}.hasOwnProperty;

            for (var hash in items) {
                if (!hasOwnProperty.call(items, hash)) {
                    continue;
                }

                var collisionList = items[hash];

                for(var i = 0; i < collisionList.length; i += 1) {
                    result.push({
                        key: collisionList[i].key,
                        value: collisionList[i].value
                    });
                }
            }

            return result;
        };

        return ArrayKeyHashtable;
    })();

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

    ArrayIterator.prototype.getUnderlyingArray = function() {
        return this.$$array;
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

    Iterable.prototype.forEach = function(action, context) {
        var options = {
            func: action,
            funcResult: QUICK_RESULT.VOID,
            context: context,

            funcArgName: 'action',
            methodName: 'forEach',

            iterable: this
        };

        standardFunction(options, function(action, iterable) {
            var it = iterable.iterator();
            var index = 0;

            while (it.next()) {
                action(it.current(), index);
                index += 1;
            }
        });
    };

    Iterable.prototype.isEmpty = function() { 
        var it = this.iterator();
        return (Boolean(it.next()) === false);
    };

    var SOME_DEFAULT_PRED = function(x) { return x; };

    Iterable.prototype.some = function(predicate, context) {
        var options = {
            func: (predicate === undefined ? SOME_DEFAULT_PRED : predicate),
            context: context,

            funcArgName: 'predicate',
            methodName: 'some',

            iterable: this
        };
       
        return standardFunction(options, function(predicate, iterable) {
            var it = iterable.iterator();
            var index = 0;
            
            while (it.next()) {
                if (predicate(it.current(), index)) {
                    return true;
                }
                
                index += 1;
            }

            return false;
        });
    };

    var EVERY_DEFAULT_PRED = function(x) { return x; };

    Iterable.prototype.every = function(predicate, context) {
        var options = {
            func: (predicate === undefined ? EVERY_DEFAULT_PRED : predicate),
            context: context,

            funcArgName: 'predicate',
            methodName: 'every',

            iterable: this
        };
       
        return standardFunction(options, function(predicate, iterable) {
            var it = iterable.iterator();
            var index = 0;
            
            while (it.next()) {
                if (!predicate(it.current(), index)) {
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

    Iterable.prototype.count = function(predicate, context) {
        var it = null;

        if (predicate) {
            it = this.filter(predicate, context).iterator();
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

    var iteratorToArray = function(it) {
        var result = [];
        
        while (it.next()) {
            result.push(it.current());
        }

        return result;
    };

    Iterable.prototype.toArray = function() {
        var it = this.iterator();
        return iteratorToArray(it);
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

    Iterable.prototype.filter = function(predicate, context) {
        var options = {
            func: predicate,
            context: context,

            funcArgName: 'predicate',
            methodName: 'filter',

            iterable: this
        };

        return standardFunction(options, function(predicate, iterable) {
            return new Iterable(function() {
                var it = iterable.iterator();
                return new FilterIterator(it, predicate);
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

    Iterable.prototype.map = function(projection, context) {
        var options = {
            func: projection,
            funcResult: QUICK_RESULT.ANY,
            context: context,

            funcArgName: 'projection',
            methodName: 'map',

            iterable: this
        };
        
        return standardFunction(options, function(projection, iterable) {
            return new Iterable(function() {
                var it = iterable.iterator();
                return new MapIterator(it, projection);
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

    Iterable.prototype.reduce = function(seed, operation, context) {
        if (seed === undefined) {
            throw new Error('iter.reduce: missing required argument "seed". ' +
                            'Use iter.reduce1() to perform reduce without having to specify seed.');
        }

        var options = {
            func: operation,
            funcResult: QUICK_RESULT.ANY,
            funcParams: ['$acc', '$', '$index'],
            context: context,

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
    Iterable.prototype.reduce1 = function(operation, context) {
        var options = {
            func: operation,
            funcResult: QUICK_RESULT.ANY,
            funcParams: ['$acc', '$', '$index'],
            context: context,

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

    Iterable.prototype.sum = function(selector, context) {
        var options = {
            func: (selector === undefined ? IDENTITY_FUNCTION : selector),
            funcResult: QUICK_RESULT.ANY,
            context: context,

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

    Iterable.prototype.product = function(selector, context) {
        var options = {
            func: (selector === undefined ? IDENTITY_FUNCTION : selector),
            funcResult: QUICK_RESULT.ANY,
            context: context,

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

    Iterable.prototype.avg = function(selector, context) {
        var options = {
            func: (selector === undefined ? IDENTITY_FUNCTION : selector),
            funcResult: QUICK_RESULT.ANY,
            context: context,

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

    Iterable.prototype.skip = (function() {
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

        return function(count) {
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
    })();

    Iterable.prototype.skipWhile = (function() {
        var SkipWhileIterator = function($iterator, $pred) {
            this.$$iterator = $iterator;
            this.$$pred = $pred;
            this.$$index = -1;
            this.$$skipEnded = false;
        };

        SkipWhileIterator.prototype.next = function() {
            while (this.$$iterator.next()) {
                this.$$index += 1;

                var curr = this.$$iterator.current();
                var index = this.$$index;

                if (!this.$$skipEnded && this.$$pred(curr, index)) {
                    continue;
                }
                else {
                    this.$$skipEnded = true;
                    return true;
                }
            }

            return false;
        };

        SkipWhileIterator.prototype.current = function() {
            return this.$$iterator.current();
        };

        return function(predicate, context) {
           var options = {
                func: predicate,
                context: context,

                funcArgName: 'predicate',
                methodName: 'skipWhile',

                iterable: this
            };

            return standardFunction(options, function(pred, iterable) {
                return new Iterable(function() {
                    var it = iterable.iterator();
                    return new SkipWhileIterator(it, pred);
                });
            });
       };
    })();

    Iterable.prototype.take = (function() {
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

        return function(count) {
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
    })();
    
    Iterable.prototype.takeWhile = (function() {
        var TakeWhileIterator = function($iterator, $pred) {
            this.$$iterator = $iterator;
            this.$$pred = $pred;
            this.$$ended = false;
            this.$$index = -1;
        };

        TakeWhileIterator.prototype.next = function() {
            if (this.$$ended) {
                return false;
            }

            if (this.$$iterator.next()) {
                this.$$index += 1;
                
                var curr = this.$$iterator.current();
                var index = this.$$index;

                if (this.$$pred(curr, index)) {
                    this.$$current = { value: curr };
                    return true;
                }
                else {
                    this.$$ended = true;
                    return false;
                }
            }
            else {
                this.$$ended = true;
                return false;
            }
        };

        TakeWhileIterator.prototype.current = function() {
            if (!this.$$current) {
                throw new Error('iter.Iterator: this function can be called only when ' +
                                'previous call to next() returns true.');
            }

            return this.$$current.value;
        };

        return function(pred, $this) {
           var options = {
                func: pred,
                context: $this,

                funcArgName: 'pred',
                methodName: 'takeWhile',

                iterable: this
            };

            return standardFunction(options, function(pred, iterable) {
                return new Iterable(function() {
                    var it = iterable.iterator();
                    return new TakeWhileIterator(it, pred);
                });
            });
        };
    })();

    Iterable.prototype.join = function(separator) {
        var array = this.toArray();
        return array.join(separator);
    };
    
    Iterable.prototype.sort = function(comparer, context) {
        if (comparer !== undefined) {
            if (!isFunction(comparer)) {
                throw new TypeError('iter.sort: comparer must be a function.');
            }

            comparer = bindContext(comparer, context);
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
 
    var BackwardArrayIterator = function($array) {
        this.$$index = $array.length;
        this.$$arrayLength = $array.length;
        this.$$array = $array;
    };

    BackwardArrayIterator.prototype.next = function() {
        var decIndex = this.$$index - 1;

        if (decIndex >= 0) {
            this.$$index = decIndex;
            return true;
        }
        else {
            return false;
        }
    };

    BackwardArrayIterator.prototype.current = function() {
        if (this.$$index === this.$arrayLength) {
            throw new Error('Call next() before current().');
        }
        else {
            return this.$$array[this.$$index];
        }
    };


    Iterable.prototype.reverse = function() {
        var that = this;

        return new Iterable(function() {
            var it = that.iterator();
            var array;

            if (it instanceof ArrayIterator) {
                array = it.getUnderlyingArray();
                return new BackwardArrayIterator(array);
            }
            else {
                array = iteratorToArray(it);
                array.reverse();
                return new ArrayIterator(array);
            }
        });
    };

    (function(Iterable) {
        var internalFirst = function(iterable, funcName, predicate, context) {
            var options = {
                func: (predicate === undefined ? ALWAYS_TRUE_PREDICATE : predicate),
                context: context,

                funcArgName: 'predicate',
                methodName: funcName,

                iterable: iterable
            };

            return standardFunction(options, function(pred, iterable) {
                var it = iterable.iterator();
                var index = 0;

                while (it.next()) {
                    var curr = it.current();
                    if (pred(curr, index)) {
                        return { value: curr };
                    }

                    index += 1;
                }

                return null;
            });
        };

        Iterable.prototype.first = function(predicate, context) {
            var result = internalFirst(this, 'first', predicate, context);

            if (result) {
                return result.value;
            }
            else if (predicate) {
                throw new Error('iter.first: sequence contains no elements satisfying the predicate.');
            }
            else {
                throw new Error('iter.first: sequence contains no elements.');
            }
        };

        Iterable.prototype.firstOrDefault = function(defaultValue, predicate, context) {
            var result = internalFirst(this, 'firstOrDefault', predicate, context);

            if (result) {
                return result.value;
            }
            else {
                return defaultValue;
            }
        };
    })(Iterable);

    (function(Iterable) {
        var internalLast = function(iterable, funcName, predicate, context) {
            var options = {
                func: (predicate === undefined ? ALWAYS_TRUE_PREDICATE : predicate),
                context: context,

                funcArgName: 'predicate',
                methodName: funcName,

                iterable: iterable
            };

            return standardFunction(options, function(pred, iterable) {
                var it = iterable.iterator();
                var index = 0;

                var lastValue = null;

                while (it.next()) {
                    var curr = it.current();

                    if (pred(curr, index)) {
                        lastValue = { value: curr };
                    }

                    index += 1;
                }

                return lastValue;
            });
        };

        Iterable.prototype.last = function(predicate, context) {
            var result = internalLast(this, 'last', predicate, context);
            
            if (result) {
                return result.value; 
            }
            else if (predicate) {
                throw new Error('iter.last: sequence contains no elements statisfying the predicate.');
            }
            else {
                throw new Error('iter.last: sequence contains no elements.');
            }
        };

        Iterable.prototype.lastOrDefault = function(defaultValue, predicate, context) {
            var result = internalLast(this, 'lastOrDefault', predicate, context);
            
            if (result) {
                return result.value; 
            }
            else {
                return defaultValue;
            }
        };
    })(Iterable);

    Iterable.prototype.groupBy = (function() {
        
        var addValueToGrouping = function(groupping, key, value) {
            // group is array of values
            var group = groupping.get(key);

            if (group) {
                group.push(value);
            }
            else {
                groupping.put(key, [value]);
            }
        };

        var createKeySelector = function(selectors) {
            return function(obj) {
                var key = [], subkey;

                for (var i = 0; i < selectors.length; i += 1) {
                    subkey = selectors[i](obj);
                    key.push(subkey);
                }

                return key;
            };
        };

        var grouppingToArray = function(groupping, isSingleSelectorKey) {
            var result = [];
            var keyGroupPairs = groupping.toArray();

            for(var i = 0; i < keyGroupPairs.length; i += 1) {
                var groupElements = iter(keyGroupPairs[i].value);

                groupElements.key = (isSingleSelectorKey ? 
                                     keyGroupPairs[i].key[0] :
                                     keyGroupPairs[i].key);
                
                result.push(groupElements);
            }

            return result;
        };

        var createSelector = function(selector) {
            throwIfNotQuickOrFunction(selector, 'arguments', 'groupBy');
                
            if (isQuick(selector)) {
                selector = quickToFunction(selector);
            }

            return selector;
        };

        return function() {
            if (arguments.length === 0) {
                throw new Error('iter.groupBy: specify at least one property selector.');
            }

            var selectors = toArray(arguments);
  
            for (var i = 0; i < selectors.length; i += 1) {
                selectors[i] = createSelector(selectors[i]);   
            }

            var keySelector = createKeySelector(selectors);
            var isSingleSelectorKey = (selectors.length === 1);

            var that = this;

            return new Iterable(function() {
                var groupping = new ArrayKeyHashtable();

                var it = that.iterator();
                while (it.next()) {
                    var curr = it.current();
                    var key = keySelector(curr);
                    addValueToGrouping(groupping, key, curr);
                }

                var result = grouppingToArray(groupping, isSingleSelectorKey);
               return new ArrayIterator(result);
            });
        };
    })();

    Iterable.prototype.random = function() {
        var it = this.iterator();
        
        var index = 1;
        var current;

        if (!it.next()) {
            throw new Error('iter.random: sequence contains no elements.');
        }

        do {
            if (Math.random() < 1 / index) {
                current = it.current();
            }
            index += 1;
        } while (it.next());

        return current;
    };

    // spec: '$.age @asc' or '$.name @locale @desc'
    Iterable.prototype.orderBy = (function() {
        var comparerFactories;

        var resetComparerFactories = function() {
            comparerFactories = Object.create(null);
            
            // add default comparer
            addComparerFactory('', function(selector) {
                return function(left, right) {
                    var leftProp = selector(left);
                    var rightProp = selector(right);

                    if (leftProp < rightProp) {
                        return (-1);
                    }
                    else if (leftProp === rightProp) {
                        return 0;
                    }
                    else {
                        return 1;
                    }
                };
            });

            // add string localeCompare comparer
            addComparerFactory('localeCompare', function(selector) {
                return function(left, right) {
                    var leftProp = String(selector(left));
                    var rightProp = String(selector(right));

                    return leftProp.localeCompare(rightProp);
                };
            });
        };

        var addComparerFactory = function(comparerName, factory) {
            if (!isString(comparerName)) {
                throw new TypeError('iter.orderBy: comparer name must be a string.');
            }

            if (comparerName && !isJSIdentifier(comparerName)) {
                throw new Error('iter.orderBy: invalid comparer name.');
            }

            if (!isFunction(factory)) {
                throw new TypeError('iter.orderBy: factory must be a function.');
            }

            comparerFactories[comparerName + '$'] = factory;
        };
    
        var hasComparerFactory = function(comparerName) {
            return Object.prototype.hasOwnProperty.call(comparerFactories, comparerName + '$');
        };

        // initialize comparers
        resetComparerFactories();

        var createComparerUsingFactory = function(comparerName, selector) {
            if (!hasComparerFactory(comparerName)) {
                throw new Error('iter.orderby: comparer with name "' + comparerName + '" is not registered.');
            }

            var factory = comparerFactories[comparerName + '$'];
            return factory(selector);
        };
    
        var trimEnd = function(str) {
            return str.replace(/\s*$/, '');

        };

        var endsWith = function(str, ending) {
            if (str.lastIndexOf(ending) === (str.length - ending.length)) {
                return true;
            }
            else {
                return false;
            }
        };

        var removeLastCharacters = function(str, lastCharsCount) {
            if (str.length < lastCharsCount) {
                return '';
            }

            return str.slice(0, str.length - lastCharsCount);
        };

        var parseSelector = function(orderByQuick) {
            // format: standard-quick [@comparerName] [@desc|@asc]
            
            if (!isString(orderByQuick)) {
                return null;
            }

            var result = {};

            var q = trimEnd(orderByQuick);

            // @desc|@asc
            if (endsWith(q, "@desc")) {
                q = removeLastCharacters(q, "@desc".length);
                result.desc = true;
            }
            else if (endsWith(q, "@asc")) {
                q = removeLastCharacters(q, "@asc".length);
                result.desc = false;
            }
            q = trimEnd(q);

            // @comparerName
            if (/@[a-zA-Z0-9$]+$/.test(q)) {
                var atIndex = q.lastIndexOf('@');
                var comparerName = q.slice(atIndex);
                q = q.slice(0, atIndex);

                // comparer name without @
                result.comparerName = comparerName.slice(1);
            }
            else {
                result.comparerName = '';
            }

            // quick
            result.quick = q;

            return result;
        };

        var reverseComparer = function(comparer) {
            return function(left, right) {
                return -(comparer(left, right));
            };
        };

        var createComparer = function(selector) {
            if (isFunction(selector)) {
                return createComparerUsingFactory('', selector);
            }

            var parsedSelector = parseSelector(selector);
            if (!parsedSelector) {
                throw new Error('iter.orderBy: invalid property selector: "' + selector + '".');
            }

            selector = quickToFunction(parsedSelector.quick);
            var comparer = createComparerUsingFactory(parsedSelector.comparerName, selector);

            if (parsedSelector.desc) {
                comparer = reverseComparer(comparer);
            }

            return comparer;
        };

        var createMultiComparer = function() {
            var comparers = toArray(arguments);

            return function(left, right) {
                for (var i = 0; i < comparers.length; i += 1) {
                    var cmp = comparers[i](left, right);
                    if (cmp !== 0) {
                        return cmp;
                    }
                }

                return 0;
            };
        };

        return function() {
            var selectors = toArray(arguments);

            if (selectors.length === 0) {
                throw new Error('iter.orderBy: specify at least one property selector.');
            }

            var comparers = [];
            for (var i = 0; i < selectors.length; i += 1) {
                comparers[i] = createComparer(selectors[i]);
            }

            var multiComparer = (comparers.length === 1 ? 
                                 comparers[0] : 
                                 createMultiComparer.apply(null, comparers));

            var that = this;

            return new Iterable(function() {
                var data = that.toArray();
                data.sort(multiComparer);

                return new ArrayIterator(data);
            });
        };
    })();

    (function(Iterable) {
        var internalOne = function(iterable, funcName, predicate, context) {
            var options = {
                func: (predicate === undefined ? ALWAYS_TRUE_PREDICATE : predicate),
                context: context,

                funcArgName: 'predicate',
                methodName: funcName,

                iterable: iterable
            };

            return standardFunction(options, function(predicate, iterable) {
                var it = iterable.iterator();
                var index = -1;
                var one = null;

                while (it.next()) {
                    index += 1;
                    var curr = it.current();

                    if (predicate(curr, index)) {
                        if (one) {
                            throw new Error('iter.' + funcName + 
                                            ': sequence contains more than one matching element.');
                        }
                        else {
                            one = { value: curr };
                        }
                    }
                }

                return one;
            });
        };

        Iterable.prototype.one = function(predicate, context) {
            var result = internalOne(this, 'one', predicate, context);

            if (result) {
                return result.value;
            }
            else if (predicate) {
                throw new Error('iter.one: sequence contains no elements satisfying the predicate.');
            }
            else {
                throw new Error('iter.one: sequence contains no elements.');
            }
        };

        Iterable.prototype.oneOrDefault = function(defaultValue, predicate, context) {
            var result = internalOne(this, 'oneOrDefault', predicate, context);

            if (result) {
                return result.value;
            }
            else {
                return defaultValue;
            }
        };
    })(Iterable);

    Iterable.prototype.materialize = function() {
        var materializedData = this.toArray();

        return new Iterable(function() {
            return new ArrayIterator(materializedData);
        });
    };

    Iterable.prototype.isEmpty = function() {
        var it = this.iterator();
        if (it.next()) {
            return false;
        }
        else {
            return true;
        }
    };

    Iterable.prototype.contains = (function() {
        var DEFAULT_EQUALITY_COMPARER = function(element, value) {
            return (element === value);
        };

        return function(value, comparer, context) {
            var options = {
                func: (comparer === undefined ? DEFAULT_EQUALITY_COMPARER : comparer),
                context: context,

                funcArgName: 'comparer',
                methodName: 'contains',

                iterable: this 
            };

            return standardFunction(options, function(comparer, iterable) {
                var it = iterable.iterator();

                while (it.next()) {
                    if (comparer(it.current(), value)) {
                        return true;
                    }
                }

                return false;
            });
        };
    })();

    Iterable.prototype.flatMap = (function() {
        var FlatMapIterator = function(sequences) {
            this.$$sequences = sequences;
            this.$$currentSequence = null;
            this.$$end = false;
        };

        FlatMapIterator.prototype.next = function() {
            if (this.$$end) {
                return false;
            }

            while (!this.$$currentSequence || !this.$$currentSequence.next()) {
                if (this.$$sequences.next()) {
                    this.$$currentSequence = toIterable(this.$$sequences.current()).iterator();
                }
                else {
                    this.$$end = true;
                    return false;
                }
            }
        
            this.$$current = { 
                value: this.$$currentSequence.current()
            };
            return true;
        };

        FlatMapIterator.prototype.current = function() {
            if (this.$$current) {
                return this.$$current.value;
            }
            else {
                throw new Error('Iterator.current: call next() before call to current().');
            }
        };

        return function(projection, context) {
            var sequences = this.map(projection, context);

            return new Iterable(function() {
                var sequencesIterator = sequences.iterator();
                return new FlatMapIterator(sequencesIterator);
            });
        };
    })();

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
                var generatorFunction = obj();
                return new FunctionIterator(generatorFunction);
            });
        }
        else {
            throw new Error("iter: Only arrays, object and functions can be iterated.");
        }
    };

    iter.stateless = function(func) {
        if (!isFunction(func)) {
            throw new Error('iter.stateless: Invalid argument: ' + 
                            'passed argument should be function.');
        }

        return iter(function() {
            return func;
        });
    };

    var toIterable = function(obj) {
        if (obj instanceof Iterable) {
            return obj;
        }
        else {
            return iter(obj);
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

        if (step >= 0) {
            return iter(function() {
                var index = 0;

                return function() {
                    var next = from + index * step;
                    if (next >= to) {
                        return undefined;
                    }
                    else {
                        index += 1;
                        return next;
                    }
                };
            });
        }
        else {
            return iter(function() {
                var index = 0;

                return function() {
                    var next = from + index * step;
                    if (next <= to) {
                        return undefined;
                    }
                    else {
                        index += 1;
                        return next;
                    }
                };
            });
        }
    };

    iter.repeat = (function() {
        var RepeatIterator = function(value, times) {
            this.$$value = value;
            this.$$times = times;
            this.$$t = -1;
        };

        RepeatIterator.prototype.next = function() {
            if (this.$$times === undefined) {
                return true;
            }
            else if (this.$$t < this.$$times - 1) {
                this.$$t += 1;
                return true;
            }
            else {
                return false;
            }
        };

        RepeatIterator.prototype.current = function() {
            return this.$$value;
        };

        return function(value, times) {
            if (!arguments.length) {
                throw new Error('iter.repeat: missing argument "value".');
            }

            if (times === undefined) {
                // repeat forever
                return new Iterable(function() {
                    return new RepeatIterator(value);
                });
            }
            else {
                times = Math.max(0, Number(times));
                return new Iterable(function() {
                    return new RepeatIterator(value, times);
                });
            }
        };
    })();

    var EMPTY_ITERATOR_FUNCTION = function() { return undefined; };
    var EMPTY_ITERATOR_FUNCTION_FACTORY = function() {
        return EMPTY_ITERATOR_FUNCTION;
    };

    iter.empty = function() {
        return iter(EMPTY_ITERATOR_FUNCTION_FACTORY);
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

    iter.zipWith = (function() {
        var ZipWithIterator = function(leftIterator, rightIterator, mergeFunction) {
            this.$$left = leftIterator;
            this.$$right = rightIterator;
            this.$$mergeFunction = mergeFunction;
            this.$$end = false;
        };

        ZipWithIterator.prototype.next = function() {
            if (this.$$end) {
                return false;
            }

            if (!this.$$left.next() || !this.$$right.next()) {
                this.$$end = true;
                return false;
            }

            var curr = this.$$mergeFunction(this.$$left.current(), this.$$right.current());
            this.$$current = { value: curr };

            return true;
        };

        ZipWithIterator.prototype.current = function() {
            if (this.$$current) {
                return this.$$current.value;
            }
            else {
                throw new Error('Iterator.current: call next() before current().'); 
            }
        };

        return function(leftIterable, rightIterable, mergeFunction, $this) {
            if (arguments.length < 3) {
                throw new Error('iter.zipWith: missing arguments. ' + 
                                'To merge two iterables use syntax ' +
                                'iter.zip(leftIterable, rightIterable, mergeFunction).');
            }

            leftIterable = toIterable(leftIterable);
            rightIterable = toIterable(rightIterable);

            var options = {
                func: mergeFunction,
                funcParams: ['$left', '$right'],
                funcResult: QUICK_RESULT.ANY,
                context: $this,

                funcArgName: 'mergeFunction',
                methodName: 'zipWith',
            };

            return standardFunction(options, function(mergeFunction) {
                return new Iterable(function() {
                    var leftIterator = leftIterable.iterator();
                    var rightIterator = rightIterable.iterator();

                    return new ZipWithIterator(leftIterator, rightIterator, mergeFunction);
                });
            });
         };
    })();

    iter.concat = (function() {
        var ConcatIterator = function(iterators) {
            this.$$iterators = iterators;
            this.$$currentIterator = 0;
        };

        ConcatIterator.prototype.next = function() {
            while ((this.$$currentIterator < this.$$iterators.length) &&
                   !this.$$iterators[this.$$currentIterator].next()) 
            {
                this.$$currentIterator += 1;
            }

            if (this.$$currentIterator < this.$$iterators.length) {
                var curr = this.$$iterators[this.$$currentIterator].current();
                this.$$current = { value: curr };
                return true;
            }
            else {
                return false;
            }
        };

        ConcatIterator.prototype.current = function() {
            if (this.$$current) {
                return this.$$current.value;
            }
            else {
                throw new Error('Iterator.current: call next() before call to current().');
            }
        };

        return function() {
            var iterables = toArray(arguments);

            if (!iterables.length) {
                return iter.empty();
            }
            else {
                return new Iterable(function() {
                    var iterators = iterables.map(function(x) {
                        return toIterable(x).iterator();
                    });

                    return new ConcatIterator(iterators);
                });
            }
        };
    })();

    iter.interleave = (function() {
        var InterleaveIterator = function(iterators) {
            this.$$iterators = iterators;
            this.$$currentIterator = -1;
        };

        InterleaveIterator.prototype.next = function() {
            while (this.$$iterators.length) {
                this.$$currentIterator += 1;
                while (this.$$currentIterator >= this.$$iterators.length) {
                    this.$$currentIterator -= this.$$iterators.length; 
                }

                if (!this.$$iterators[this.$$currentIterator].next()) {
                    this.$$iterators.splice(this.$$currentIterator, 1);
                }
                else {
                    this.$$current = {
                        value: this.$$iterators[this.$$currentIterator].current()
                    };
                    return true;
                }
            }

            return false;
        };

        InterleaveIterator.prototype.current = function() {
            if (this.$$current) {
                return this.$$current.value;
            }
            else {
                throw new Error('Iterator.current: call next() before call to current().');
            }
        };

        return function() {
            var iterables = toArray(arguments);

            if (!iterables.length) {
                throw new Error('iter.interleave: missing argument, ' +
                                'specify at least one iterable.');
            }
            else {
                return new Iterable(function() {
                    var iterators = iterables.map(function(x) {
                        return toIterable(x).iterator();
                    });

                    return new InterleaveIterator(iterators);
                });
            }
        };   
    })();

    iter.cross = (function() {
        var CrossIterator = function(leftIterator, rightIterable, mergeFunction) {
            this.$$left = leftIterator;
            this.$$right = rightIterable;
            this.$$data = [];
            this.$$mergeFunction = mergeFunction;
            this.$$dataIndex = this.$$data.length;
        };

        CrossIterator.prototype.next = function() {
            while (true) {
                if (this.$$dataIndex >= this.$$data.length) {
                    if (this.$$left.next()) {
                        this.$$dataIndex = 0;
                        this.$$data = this.$$right.toArray();
                    }
                    else {
                        return false;
                    }
                }
                else {
                    var curr = this.$$mergeFunction(
                        this.$$left.current(),
                        this.$$data[this.$$dataIndex]);

                    this.$$dataIndex += 1;

                    if (curr === undefined) {
                        continue;
                    }
                    else {
                        this.$$current = { value: curr };
                        return true;
                    }
                }
            }
        };

        CrossIterator.prototype.current = function() {
            if (this.$$current) {
                return this.$$current.value;
            }
            else {
                throw new Error('Iterator.current: call next() before current().'); 
            }
        };

        // mergeFunction -> return undefined to skip
        return function(leftIterable, rightIterable, mergeFunction, $this) {
             if (arguments.length < 3) {
                throw new Error('iter.cross: missing arguments. ' + 
                                'To cross join two iterables use syntax ' +
                                'iter.cross(leftIterable, rightIterable, mergeFunction).');
            }

            leftIterable = toIterable(leftIterable);
            rightIterable = toIterable(rightIterable);

            var options = {
                func: mergeFunction,
                funcParams: ['$left', '$right'],
                funcResult: QUICK_RESULT.ANY,
                context: $this,

                funcArgName: 'mergeFunction',
                methodName: 'cross',
            };

            return standardFunction(options, function(mergeFunction) {
                return new Iterable(function() {
                    var leftIterator = leftIterable.iterator();
                    return new CrossIterator(leftIterator, rightIterable, mergeFunction);
                });
            });
        };
    })();

})(typeof window === "undefined" ? global : window);
