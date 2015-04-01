
# iter.js - adds Iterators to JavaScript

## Introduction
This library allows you to write data processing statements using syntax similar to C# LINQ or Java 8 streams, for example:
```javascript
var firstTenPrimes = iter.range(2, 100)
    .filter(function(n) { return isPrime(n); })
    .take(10)
    .toArray();
```
additionaly it provides shorter syntax named _quick_ that alows you to drop `function` and `return` from lambda expressions e.g:
```javascript
var onlyEven = iter.range(0, 100)
    .filter('$ % 2 === 0')
    .toArray();
```
Here `'$ % 2 === 0'` is a _quick_ expression (_quicks_ are compiled using `eval` and they doesn't support closures).

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
**Only enumerable and own properties of object are returned by iterator.**

In current version of iter.js key value pairs are mutable (that's it you can change key and/or value property of pair), but in future version of the library this behaviour may change.

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
creates a sequence that consists of only four elements (when array is empty `pop()` returns `undefined` which ends the sequence).

## Iterable methods

### `Iterable.prototype.forEach(action[, context])`
<dl>
  <dt><strong>action</strong></dt>
  <dd>Function that is invoked for each of the sequence elements. It takes two arguments: the current element and zero based index of the current element in the sequence.</dd>

  <dt><strong>context</strong></dt>
  <dd>Optional. Value to use as <code>this</code> when executing <code>action</code>.</dd>
</dl>

`forEach` invokes `action` for each element of the sequence, e.g.
```javascript
iter(['foo', 'bar', 'baz']).forEach(function(x, index) {
	console.log('x: ' + x + ', index: ' + index);
});
// Output:
// x: foo, index: 0
// x: bar, index: 1
// x: baz, index: 2
```

Optionally you can specify value of `this` to use when calling `action`:
```javascript
var context = { sum: 0 }

iter([1, 2, 3]).forEach(function(x) {
	this.sum += x;
}, context);

console.log(context.sum);
// Output:
// 6
```

### `Iterable.prototype.isEmpty()`
Returns `true` if sequence is empty (contains no elements) and `false` otherwise. It evaluates at most one sequence element.
```javascript
var result1 = iter([]).isEmpty();
console.log(result1);
// Output:
// true

var result2 = iter([1,2,3]).isEmpty();
console.log(result2);
// Output:
// false
```

### `Iterable.prototype.some(predicate[, context])`
<dl>
  <dt><strong>predicate</strong></dt>
  <dd>Function that returns either `true` or `false` for every sequence element. It takes two arguments: the current element and zero based index of the current element in the sequence.</dd>

  <dt><strong>context</strong></dt>
  <dd>Optional. Value to use as <code>this</code> when executing <code>predicate</code>.</dd>
</dl>

Returns `true` if sequence contains element for which `predicate` returns `true`, otherwise returns `false`. It stops evaluating sequence after it finds an element fulfilling the predicate.

```javascript
var hasFoo = iter(['foo', 'bar', 'nyu']).some(function(x) {
	return (x === 'foo');
});
console.log(hasFoo);
// Output:
// true

var hasAlladin = iter(['foo', 'bar', 'nyu']).some(function(x) {
	return (x === 'Alladin');
});
console.log(hasAlladin);
// Output:
// false
```

## Helper methods

## Writing custom iterators
