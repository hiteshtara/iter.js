
# iter.js - adds Iterators to JavaScript

## Introduction
This library allows you to write data processing statements using syntax similar to C# LINQ or Java 8 streams. For example:
```javascript
var firstTenPrimes = iter.range(2, 100)
    .filter(function(n) { return isPrime(n); })
    .take(10)
    .toArray();
```
additionaly it provides shorter syntax named "quick" that alows you to drop `function` and `return` from lambda expressions e.g:
```javascript
var onlyEven = iter.range(0, 100)
    .filter('$ % 2 === 0')
    .toArray();
```
In this case `'$ % 2 === 0'` is a quick expression (quicks are compiled using `eval` and they doesn't support closures).

## What can be iterated over?
Currently iter.js supports iterating over arrays, objects and generators (functions).

### Iterating over arrays
To iterate over array use syntax `iter(array)` e.g.
```javascript
iter([1,2,3,4])
	.forEach(function(x) {
    	console.log(x);
    });
    	
```
When iterating over array holes are not skipped so:
```javascript
iter([1,,3])
	.forEach(function(x) {
    	console.log(x);
    });	
```
will print:
```javascript
1
undefined
3
```

### Iterating over objects
Iterating over object returns sequence of key value pairs e.g.
```javascript
iter({ prop1: 'foo', prop2: 'bar' })
	.forEach(function(x) {
    	console.log(x);
    });
```
will print:
```javascript
Object {key: "prop1", value: "foo"}
Object {key: "prop2", value: "bar"}
```
**Iteration over object returns only enumerable and own properties of object.**

In current version of iter.js key value pairs are mutable (that's it you can change key and/or value property of pair).

### Iterating over generators (functions)
Functions can be used as sequence generators, in this case sequence ends when function returns `undefined`.
For example:
```javascript
var i = 0;

var first10Nums = iter(function() { return i++; })
	.take(10)
    .toArray();

```
creates infinite sequence of numbers starting from 0, then takes only first ten elements of that sequence.

On the other hand:
```javascript
iter(Math.random).take(10).toArray()
```
creates array of ten random numbers, and:
```
var arr = [1,2,3,4];

iter(function() { return arr.pop(); })
```
creates a sequence that consists of only four elements (when array is empty `pop()` returns `undefined` which ends sequence).

## Iterable methods

## Helper methods

## Writing custom iterators
