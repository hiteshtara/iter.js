
;(function(global) {
    'use strict';

    var noConflict = global.iter;
    var exports = {};

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

    var Iterable = function(arrayOrObject) {
        if (Array.isArray(arrayOrObject)) {
            this.$$array = arrayOrObject;
        }
        else if (arrayOrObject != null && typeof arrayOrObject === "object") {
            this.$$object = arrayOrObject;
        }
        else {
            throw new Error("Only arrays and object can be iterated.");
        }
    };

    Iterable.prototype.iterator = function() {
        if (this.$$array) {
            return new ArrayIterator(this.$$array);
        }
        else if(this.$$object) {
            return new ObjectIterator(this.$$object);
        }
        else {
            throw new Error("Iterator is in invalid state.");
        }
    };

    Iterable.prototype.forEach = function(func, $this) {
        var it = this.iterator(), i = 0;
        
        if ($this !== undefined) {
            func = func.bind($this);
        }

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

    // TODO:
    // Filter
    // Map
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

    global.iter = function(arrayOrObject) {
        return new Iterable(arrayOrObject);   
    };

})(window);
