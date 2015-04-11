
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
  <dt><strong>action(element, index)</strong></dt>
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
  <dt><strong>predicate(element, index)</strong></dt>
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

### `Iterable.prototype.every(predicate[, context])`
<dl>
  <dt><strong>predicate(element, index)</strong></dt>
  <dd>Function that returns either `true` or `false` for every sequence element. It takes two arguments: the current element and zero based index of the current element in the sequence.</dd>

  <dt><strong>context</strong></dt>
  <dd>Optional. Value to use as <code>this</code> when executing <code>predicate</code>.</dd>
</dl>

Returns `true` if predicate returns `true` for every sequence element, otherwise returns `false`.
```javascript
var isEven = function(n) {
	return (n % 2 === 0);
};

var result1 = iter([4,8,66,88]).every(isEven);
console.log(result1);
// Output:
// true

var result2 = iter([4,8,66,7,88]).every(isEven);
console.log(result2);
// Output:
// false
```

### `Iterable.prototype.and()`
Performs logical `&&` operation on sequence elements, e.g. 
```javascript
iter([el1, el2, el3]).and()
```
will return value of expression: `el1 && el2 && el3`.

Like `&&`, `and` will return last sequence value when all sequence values are [truthy](https://developer.mozilla.org/en-US/docs/Glossary/Truthy), or first [falsy](https://developer.mozilla.org/en-US/docs/Glossary/Falsy) value in the sequence.

```javascript
var result1 = iter([3,'foo',true,4.343]).and();
console.log(result1);
//Output:
// 4.343

var result2 = iter([3,'foo',null,4.343]).and();
console.log(result2);
//Output:
// null
```

### `Iterable.prototype.or()`
Performs logical `||` operation on sequence elements, e.g. 
```javascript
iter([el1, el2, el3]).or()
```
will return value of expression: `el1 || el2 || el3`.

Like `||`, `or` will return last sequence value when all sequence values are [falsy](https://developer.mozilla.org/en-US/docs/Glossary/Falsy), or first [truthy](https://developer.mozilla.org/en-US/docs/Glossary/Truthy) value in the sequence.

```javascript
var result1 = iter([null,undefined,0,'',NaN]).or();
console.log(result1);
//Output:
// NaN

var result2 = iter([null,undefined,0,'foo',NaN]).or();
console.log(result2);
//Output:
// foo
```

### `Iterable.prototype.count([predicate[, context]])`
<dl>
  <dt><strong>predicate(element, index)</strong></dt>
  <dd>Function that returns either `true` or `false` for every sequence element. It takes two arguments: the current element and zero based index of the current element in the sequence.</dd>

  <dt><strong>context</strong></dt>
  <dd>Optional. Value to use as <code>this</code> when executing <code>predicate</code>.</dd>
</dl>

Invoked without `predicate` returns number of elements in the sequence.
Invoked with `predicate` returns number of elements fullfilling predicate (elements for which `predicate` returns `true`) in the sequence.

```javascript
var seq = iter([1,2,3,4]);

var result1 = seq.count();
console.log(result1);
//Output:
// 4

var result2 = seq.count('$ > 2');
console.log(result2);
//Output:
// 2
```
In second example we used quick expression `'$ > 2'`, this is shorthand for writing `function($) { return $ > 2; }`.

### `Iterable.prototype.toArray()`
Returns array containing sequence elements as they occurr in the sequence. Each `toArray` call returns new array that can be modified by user.

```javascript
var arr = iter.range(0,10).toArray();
console.log(arr);
//Output:
// [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
```

### `Iterable.prototype.filter(predicate[, context])`
<dl>
  <dt><strong>predicate(element, index)</strong></dt>
  <dd>Function that returns either `true` or `false` for every sequence element. It takes two arguments: the current element and zero based index of the current element in the sequence.</dd>

  <dt><strong>context</strong></dt>
  <dd>Optional. Value to use as <code>this</code> when executing <code>predicate</code>.</dd>
</dl>

Returns new sequence consisting of elements of the original sequence for which `predicate` returned `true`. Order of elements is preserved.
```javascript
var onlyEven = iter.range(0,10)
		.filter('$ % 2 === 0')
        .toArray();
console.log(onlyEven);
//Output:
// [0, 2, 4, 6, 8]

var firstThree = iter.range(0,10)
		.filter(function(element, index) { return index < 3; })
        .toArray();
console.log(firstThree);
//Output:
// [0, 1, 2]
```
In the first example we used quick expression `'$ % 2 === 0'`, this is shorthand for writing `function($) { return $ % 2 === 0; }`. In _quicks_ `$` usually refers to current element, and `$index` refers to current element index.

### `Iterable.prototype.map(projection[, context])`
<dl>
  <dt><strong>projection(element, index)</strong></dt>
  <dd>Function that transforms sequence elements. It takes two arguments: the current element and zero based index of the current element in the sequence.</dd>

  <dt><strong>context</strong></dt>
  <dd>Optional. Value to use as <code>this</code> when executing <code>projection</code>.</dd>
</dl>

Returns new sequence consisting of elements created by application of `projection` to elements of the original sequence. `projection` is invoked only once for each element of the original sequence. Order of elements is preserved.
```javascript
var people = [
	{ firstName: 'jon', lastName: 'doe' },
    { firstName: 'ann', lastName: 'doe' },
    { firstName: 'tom', lastName: 'doe' }
];

var fullNames = iter(people)
	.map(function(person) {
    	return [person.firstName, ' ', person.lastName].join('');
     })
    .toArray();
console.log(fullNames);
//Output:
// ["jon doe", "ann doe", "tom doe"]
```

### `Iterable.prototype.select(propertyName)`
Returns new sequence consisting of elements that are values of property `propertyName` of elements of the original sequence. `propertyName` cannot be equal to `__proto__`.
```javascript
var pets = [
	{ name: 'wobby', weightKg: 100 },
    { name: 'droppy', weightKg: 3 },
    { name: 'mooo', weightKg: 350 }
];

var names = iter(pets)
	.select('name')
    .toArray();
console.log(names);
//Output:
// ["wobby", "droppy", "mooo"]

var arrays = [
	[1,2,3],
    ['foo','bar','baz'],
    [true, false]
];

var firstElements = iter(arrays)
	.select(0)
    .toArray();
console.log(firstElements);
//Output:
// [1, "foo", true]
```

### `Iterable.prototype.select(propertyName1, propertyName2 ...)`
Returns new sequence consisting of elements that contains values of `propertyName1` ... `propertyNameN` properties from elements of the original sequence. Each `propertyName*` cannot be equal to `__proto__`.
```javascript
var data = [
	{ id: 1, name: 'jon', surname: 'doe', age: 33, hasCar: true },
    { id: 2, name: 'ann', surname: 'doe', age: 32, hasCar: true, likesCats: true }
];

var basicData = iter(data)
	.select('name', 'age')
    .toArray();
console.log(JSON.stringify(basicData))
//Output:
// [{"name":"jon","age":33},{"name":"ann","age":32}]
```

## Helper methods

## Writing custom iterators
