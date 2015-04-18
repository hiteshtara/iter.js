
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
  <dd>Function that returns either <code>true</code> or <code>false</code> for every sequence element. It takes two arguments: the current element and zero based index of the current element in the sequence.</dd>

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
  <dd>Function that returns either <code>true</code> or <code>false</code> for every sequence element. It takes two arguments: the current element and zero based index of the current element in the sequence.</dd>

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
  <dd>Function that returns either <code>true</code> or <code>false</code> for every sequence element. It takes two arguments: the current element and zero based index of the current element in the sequence.</dd>

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
  <dd>Function that returns either <code>true</code> or <code>false</code> for every sequence element. It takes two arguments: the current element and zero based index of the current element in the sequence.</dd>

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

### `Iterable.prototype.reduce(seed, operation, context)`
<dl>
  <dt><strong>seed</strong></dt>
  <dd>Initial value of accumulator.</dd>

  <dt><strong>operation(accumulator, element, index)</strong></dt>
  <dd>Function that produces new value of accumulator given previous value of accumulator, current element and element 0-based index within sequence.</dd>

  <dt><strong>context</strong></dt>
  <dd>Optional. Value to use as <code>this</code> when executing <code>operation</code>.</dd>
</dl>

Performs [reduce](http://en.wikipedia.org/wiki/Fold_%28higher-order_function%29) (sometimes called fold-left or agreegate) operation on sequence. `operation` is invoked only once for each sequence element. Elements are processed in order in which they appear in sequence. If sequence is empty `reduce` returns `seed` value.

Following call to `reduce`
```javascript
var result = iter([el1, el2, el3])
	.reduce(seed, op);
```
is equivalent to
```javascript
var acc = seed;
acc = op(acc, el1);
acc = op(acc, el2);
acc = op(acc, el3);

var result = acc;
```

```javascript
var data = [1,2,3,4,5,6,7,8,9];

var sum = iter(data)
	.reduce(0, function(acc, curr) { return acc + curr; });
console.log(sum);
//Output:
// 45

var product = iter(data)
    .reduce(1, function(acc, curr) { return acc * curr; });
console.log(product);
//Output:
// 362880

var max = iter(data)
	.reduce(data[0], function(acc, curr) { return (acc < curr ? curr : acc); });
console.log(max);
//Output:
// 9

var joined = iter(data)
	.map(String)
    .reduce('start', function(acc, curr) { return acc + '-' + curr; });
console.log(joined);
//Output:
// start-1-2-3-4-5-6-7-8-9
```

### `Iterable.prototype.reduce1(operation, context)`
<dl>
  <dt><strong>operation(accumulator, element, index)</strong></dt>
  <dd>Function that produces new value of accumulator given previous value of accumulator, current element and element 0-based index within sequence.</dd>

  <dt><strong>context</strong></dt>
  <dd>Optional. Value to use as <code>this</code> when executing <code>operation</code>.</dd>
</dl>

Performs [reduce](http://en.wikipedia.org/wiki/Fold_%28higher-order_function%29) (sometimes called fold-left or agreegate) operation on sequence. `operation` is invoked only once for each sequence element. Elements are processed in order in which they appear in sequence. Sequence cannot be empty, if it is `reduce1` will throw `Error('sequence contains no elements')` exception.

The following call to `reduce1`
```javascript
var result = iter([el1, el2, el3])
	.reduce1(op);
```
is equivalent to
```javascript
var acc = op(el1, el2);
acc = op(acc, el3);

var result = acc;
```
```javascript
var data = [1,2,3,4,5,6,7,8,9];

var sum = iter(data)
	.reduce1(function(acc, curr) { return acc + curr; });
console.log(sum);
//Output:
// 45

var product = iter(data)
    .reduce1(function(acc, curr) { return acc * curr; });
console.log(product);
//Output:
// 362880

var max = iter(data)
	.reduce1(function(acc, curr) { return (acc < curr ? curr : acc); });
console.log(max);
//Output:
// 9
```

### `Iterable.prototype.sum([selector[, context]])`
<dl>
  <dt><strong>selector(element, index)</strong></dt>
  <dd>Optional. Function that transforms sequence elements into numbers. It takes two arguments: the current element and zero based index of the current element in the sequence.</dd>

  <dt><strong>context</strong></dt>
  <dd>Optional. Value to use as <code>this</code> when executing <code>selector</code>.</dd>
</dl>

Returns sum of elements of the sequence if `selector` is not specified, otherwise computes sum of values returned by `selector`. If sequence is empty returns `0`.

```javascript
var sum1 = iter([1,2,3,4,5]).sum();
console.log(sum1);
//Output:
// 15

var sum2 = iter(['foo','bar','baz'])
	.sum(function(x) { return x.length; });
console.log(sum2);
//Output:
// 9
```

### `Iterable.prototype.product([selector[, context]])`
<dl>
  <dt><strong>selector(element, index)</strong></dt>
  <dd>Optional. Function that transforms sequence elements into numbers. It takes two arguments: the current element and zero based index of the current element in the sequence.</dd>

  <dt><strong>context</strong></dt>
  <dd>Optional. Value to use as <code>this</code> when executing <code>selector</code>.</dd>
</dl>

Returns [product](http://en.wikipedia.org/wiki/Product_%28mathematics%29) of elements of the sequence if `selector` is not specified, otherwise computes product of values returned by `selector`. If sequence is empty returns `1`.

```javascript
var prod1 = iter([1,2,3,4,5]).product();
console.log(prod1);
//Output:
// 120

var prod2 = iter(['foo','bar','baz'])
	.product(function(x) { return x.length; });
console.log(prod2);
//Output:
// 27
```

### `Iterable.prototype.avg([selector[, context]])`
<dl>
  <dt><strong>selector(element, index)</strong></dt>
  <dd>Optional. Function that transforms sequence elements into numbers. It takes two arguments: the current element and zero based index of the current element in the sequence.</dd>

  <dt><strong>context</strong></dt>
  <dd>Optional. Value to use as <code>this</code> when executing <code>selector</code>.</dd>
</dl>

Returns [average](http://en.wikipedia.org/wiki/Average) of elements of the sequence if `selector` is not specified, otherwise computes average of values returned by `selector`. If sequence is empty returns `NaN`.

```javascript
var prod1 = iter([1,2,3,4,5]).avg();
console.log(prod1);
//Output:
// 3

var prod2 = iter(['foo','bar','baz'])
	.avg(function(x) { return x.length; });
console.log(prod2);
//Output:
// 3
```

### `Iterable.prototype.skip(count)`
<dl>
  <dt><strong>count</strong></dt>
  <dd>Number of elements to skip.</dd>
</dl>

Returns new sequence that contains elements of original sequence without first `count` elements. Order of elements is preserved. If `count` is negative or equal zero no elements are skipped. If `count` is greater or equal to number of elements in original sequence then empty sequence is retuned.

```javascript
var data = ['a', 'b', 'c', 'd', 'e'];

var result1 = iter(data)
	.skip(3)
    .toArray();
console.log(result1);
//Output:
// ["d", "e"]

var result2 = iter(data)
	.skip(200)
    .toArray();
console.log(result2);
//Output:
// []

var result3 = iter(data)
	.skip(0)
    .toArray();
console.log(result3);
//Output:
// ["a", "b", "c", "d", "e"]

var result4 = iter(data)
	.skip(-1)
    .toArray();
console.log(result4);
//Output:
// ["a", "b", "c", "d", "e"]
```

### `Iterable.prototype.skipWhile(predicate[, context])`
<dl>
  <dt><strong>predicate(element, index)</strong></dt>
  <dd>Function that returns either <code>true</code> or <code>false</code> for every sequence element. It takes two arguments: the current element and zero based index of the current element in the sequence.</dd>

  <dt><strong>context</strong></dt>
  <dd>Optional. Value to use as <code>this</code> when executing <code>predicate</code>.</dd>
</dl>

Returns sequence that starts at the first element of the original sequence for which `predicate` returned `false` and contains all consecutive elements of the original sequence from that point on. If `predicate` returns `true` for all sequence elements then it returns empty sequence.

```javascript
var data = ['a', 'b', 'c', 'd', 'e'];

var result1 = iter(data)
	.skipWhile(function(c) { return c < 'd'; })
    .toArray();
console.log(result1);
//Output:
// ["d", "e"]

var result2 = iter(data)
	.skipWhile(function() { return true; })
    .toArray();
console.log(result2);
//Output:
// []

var result3 = iter(data)
	.skipWhile(function() { return false; })
    .toArray();
console.log(result3);
//Output:
// ["a", "b", "c", "d", "e"]
```

### `Iterable.prototype.take(count)`
<dl>
  <dt><strong>count</strong></dt>
  <dd>Number of elements to take.</dd>
</dl>

Returns new sequence that contains first `count` elements of the original sequence. Order of elements is preserved. If `count` is negative or equal zero then it returns empty sequence. If `count` is greater than or equal to number of elements in original sequence then it returns new sequence that contains all elements of the original sequence.

```javascript
var data = ['a', 'b', 'c', 'd', 'e'];

var result1 = iter(data)
	.take(3)
    .toArray();
console.log(result1);
//Output:
// ["a", "b", "c"]

var result2 = iter(data)
	.take(200)
    .toArray();
console.log(result2);
//Output:
// ["a", "b", "c", "d", "e"]

var result3 = iter(data)
	.take(0)
    .toArray();
console.log(result3);
//Output:
// []

var result4 = iter(data)
	.take(-1)
    .toArray();
console.log(result4);
//Output:
// []
```

### `Iterable.prototype.takeWhile(predicate[, context])`
<dl>
  <dt><strong>predicate(element, index)</strong></dt>
  <dd>Function that returns either <code>true</code> or <code>false</code> for every sequence element. It takes two arguments: the current element and zero based index of the current element in the sequence.</dd>

  <dt><strong>context</strong></dt>
  <dd>Optional. Value to use as <code>this</code> when executing <code>predicate</code>.</dd>
</dl>

Returns sequence that contains initial elements of the original sequence and that ends at the first element of the original sequence for which `predicate` returned `false`.

```javascript
var data = ['a', 'b', 'c', 'd', 'e'];

var result1 = iter(data)
	.takeWhile(function(c) { return c < 'd'; })
    .toArray();
console.log(result1);
//Output:
// ["a", "b", "c"]

var result2 = iter(data)
	.takeWhile(function() { return true; })
    .toArray();
console.log(result2);
//Output:
// ["a", "b", "c", "d", "e"]

var result3 = iter(data)
	.takeWhile(function() { return false; })
    .toArray();
console.log(result3);
//Output:
// []
```

### `Iterable.prototype.join(separator)`
<dl>
  <dt><strong>separator</strong></dt>
  <dd>String that separates adjacent elements</dd>
</dl>

Converts all sequence elements to strings then `Array.join` them using specified `separator`.
```javascript
var data = [1, 4.32, 'foo', { bar:1 }];
var str1 = iter(data).join(':::');
console.log(str1);
//Output:
// 1:::4.32:::foo:::[object Object]

var str2 = iter.range(0, 10).join('-');
console.log(str2);
//Output:
// 0-1-2-3-4-5-6-7-8-9
```

### `Iterable.prototype.sort([comparer[, context]])`
<dl>
  <dt><strong>comparer(left, right)</strong></dt>
  <dd>Optional. Function that compares sequence elements. <code>comparer</code> should return negative number if <code>left</code> is lower than <code>right</code>, zero if
  	<code>left</code> is equal to <code>right</code>, and positive number 
  	if <code>left</code> is greater than <code>right</code>.
  </dd>

  <dt><strong>context</strong></dt>
  <dd>Optional. Value to use as <code>this</code> when executing <code>comparer</code>.</dd>
</dl>

Returns new sequence containing sorted elements of the original sequence. Elements are sorted according to `comparer` in ascending order. This method internally uses `Array.sort` to perform sorting of sequence elements, before sorting sequence is first converted to array (this happends on call to `iterator()` method.)

 _Warning: `Array.sort` is not guaranted to perform stable sort._

`comparer` may not be specified when sorting sequences of strings.

_Warning: `Array.sort` sorts numbers by first converting them to strings so 11 is less than 2, to properly sort array of numbers specify custom comparer (see example #1 and #2 below)._

```javascript
var data1 = [1, 9, 2, 23, 1, 2, 11];
var sorted1 = iter(data1)
	.sort()
    .toArray();
console.log(sorted1);
//Output:
// [1, 1, 11, 2, 2, 23, 9]

var data2 = [1, 9, 2, 23, 1, 2, 11];
var sorted2 = iter(data2)
	.sort(function(l,r) { return l-r; })
    .toArray();
console.log(sorted2);
//Output:
// [1, 1, 2, 2, 9, 11, 23]

var data3 = ['foo', 'aazb', 'zzz', 'bar'];
var sorted3 = iter(data3)
	.sort()
    .toArray();
console.log(sorted3);
//Output:
// ["aazb", "bar", "foo", "zzz"]

var data4 = [
    { name: 'jon doe', priority: 3 },
    { name: 'miyako night', priority: 100 },
    { name: 'maya culpa', priority: 2 }
];
var sorted4 = iter(data4)
	// we want to sort in _descending_ order
	.sort(function(left, right) { return -(left.priority - right.priority); })
    .map(function(patient) { return patient.name; })
    .toArray();
console.log(sorted4);
//Output:
// ["miyako night", "jon doe", "maya culpa"]
```

### `Iterable.prototype.reverse()`

Returns new sequence that contains elements of the original sequence in the reversed order.

```javascript
var data = [1, 2, 3, 4, 5];
var result = iter(data)
	.reverse()
    .toArray();
console.log(result);
//Output:
// [5, 4, 3, 2, 1]
```

### `Iterable.prototype.first([predicate[, context]])`
<dl>
  <dt><strong>predicate(element, index)</strong></dt>
  <dd>Optional. Function that returns either <code>true</code> or <code>false</code> for every sequence element. It takes two arguments: the current element and zero based index of the current element in the sequence.</dd>

  <dt><strong>context</strong></dt>
  <dd>Optional. Value to use as <code>this</code> when executing <code>predicate</code>.</dd>
</dl>

Invoked without `predicate` returns first element of the original sequence or throws exception if sequence is empty.
Invoked with `predicate` returns first element of the original sequence fulfiling the `predicate` or throws exception if there is no such element.

```javascript
var data = [83, 2, 181, 3, 237, 32];
var result1 = iter(data)
	.first();
console.log(result1);
//Output:
// 83

var result2 = iter(data)
	.first(function(element) { return element > 100; });
console.log(result2);
//Output:
// 181

var result3 = iter([]).first();
//Output:
//Error: iter.first: sequence contains no elements.

iter(data).first(function() { return false; });
//Output:
//Error: iter.first: sequence contains no elements satisfying the predicate.
```

### `Iterable.prototype.firstOrDefault(defaultValue, [predicate[, context]])`
<dl>
  <dt><strong>defaultValue</strong></dt>
  <dd>Value to return if sequence is empty or no element fulfills the <code>predicate</code>.</dd>
  
  <dt><strong>predicate(element, index)</strong></dt>
  <dd>Optional. Function that returns either <code>true</code> or <code>false</code> for every sequence element. It takes two arguments: the current element and zero based index of the current element in the sequence.</dd>

  <dt><strong>context</strong></dt>
  <dd>Optional. Value to use as <code>this</code> when executing <code>predicate</code>.</dd>
</dl>

Invoked without `predicate` returns first element of the original sequence or returns `defaultValue` if sequence is empty.
Invoked with `predicate` returns first element of the original sequence fulfiling the `predicate` or returns `defaultValue` if there is no such element.

```javascript
var data = [83, 2, 181, 3, 237, 32];
var result1 = iter(data)
	.firstOrDefault('???');
console.log(result1);
//Output:
// 83

var result2 = iter(data)
	.firstOrDefault('???', function(element) { return element > 100; });
console.log(result2);
//Output:
// 181

var result3 = iter([]).firstOrDefault('???');
console.log(result3);
//Output:
// ???

var result4 = iter(data)
	.firstOrDefault(101, function() { return false; });
console.log(result4);
//Output:
// 101
```

### `Iterable.prototype.last([predicate[, context]])`
<dl>
  <dt><strong>predicate(element, index)</strong></dt>
  <dd>Optional. Function that returns either <code>true</code> or <code>false</code> for every sequence element. It takes two arguments: the current element and zero based index of the current element in the sequence.</dd>

  <dt><strong>context</strong></dt>
  <dd>Optional. Value to use as <code>this</code> when executing <code>predicate</code>.</dd>
</dl>

Invoked without `predicate` returns last element of the original sequence or throws exception if sequence is empty.
Invoked with `predicate` returns last element of the original sequence fulfiling the `predicate` or throws exception if there is no such element.

```javascript
var data = [83, 2, 181, 3, 237, 32];
var result1 = iter(data)
	.last();
console.log(result1);
//Output:
// 32

var result2 = iter(data)
	.last(function(element) { return element > 100; });
console.log(result2);
//Output:
// 237

var result3 = iter([]).last();
//Output:
// Error: iter.last: sequence contains no elements.

iter(data).last(function() { return false; });
//Output:
// Error: iter.last: sequence contains no elements statisfying the predicate.
```

### `Iterable.prototype.lastOrDefault(defaultValue, [predicate[, context]])`
<dl>
  <dt><strong>defaultValue</strong></dt>
  <dd>Value to return if sequence is empty or no element fulfills the <code>predicate</code>.</dd>
  
  <dt><strong>predicate(element, index)</strong></dt>
  <dd>Optional. Function that returns either <code>true</code> or <code>false</code> for every sequence element. It takes two arguments: the current element and zero based index of the current element in the sequence.</dd>

  <dt><strong>context</strong></dt>
  <dd>Optional. Value to use as <code>this</code> when executing <code>predicate</code>.</dd>
</dl>

Invoked without `predicate` returns last element of the original sequence or returns `defaultValue` if sequence is empty.
Invoked with `predicate` returns last element of the original sequence fulfiling the `predicate` or returns `defaultValue` if there is no such element.

```javascript
var data = [83, 2, 181, 3, 237, 32];
var result1 = iter(data)
	.lastOrDefault('???');
console.log(result1);
//Output:
// 32

var result2 = iter(data)
	.lastOrDefault('???', function(element) { return element > 100; });
console.log(result2);
//Output:
// 237

var result3 = iter([]).lastOrDefault('???');
console.log(result3);
//Output:
// ???

var result4 = iter(data)
	.lastOrDefault(101, function() { return false; });
console.log(result4);
//Output:
// 101
```

### `Iterable.prototype.groupBy(selector1[, ... selectorN])`
<dl>
  <dt><strong>selector*(element)</strong></dt>
  <dd>Functions that returns _primitive values_ for each sequence elements.</dd>
</dl>

Groups sequence elements according to values returned by `selector1` ... `selectorN` functions. `selector*` functions must return JavaScript [primitive value](https://developer.mozilla.org/en-US/docs/Glossary/Primitive).

For example if we want to group people by sex and by whenever they are at least 25 years old we could write:
```javascript
var people = [
	{ name: 'jon', sex: 'male', age: 30 },
    { name: 'marry', sex: 'female', age: 28 },
    { name: 'karen', sex: 'female', age: 16 },
    { name: 'itzki', sex: 'male', age: 33 }
];

var result = iter(people)
	.groupBy(
    	function(p) { return p.sex; },
        function(p) { return (p.age < 25 ? 'under25' : 'atLeast25'); });
```
Each group is returned as sequence object, that additionaly has `key` property containing group key (in our case this will be an array of two elements contining value of `sex` property, and either `'under25'` or `'atLeast25'` string.) In general `key` property is an array that contains values returned by `selector*` functions, in case when there is only single selector function, `key` is value returned by that selector (it is not wrapped in array).

_Warning: No order of groups is guaranted. Use `orderBy` or `sort` to force specific order._

Coming back to our example, we can use `Iterable` methods to access group elements:
```javascript
result.forEach(function(group) {
	console.log('group key: ' + group.key.join(', '));

	// use any Iterable method
    group.forEach(function(groupElement) {
    	console.log('\tgroup element: ' + JSON.stringify(groupElement.name));
    });
});
//Output:
// group key: male, atLeast25
// 	 group element: "jon"
// 	 group element: "itzki"
// group key: female, atLeast25
// 	 group element: "marry"
// group key: female, under25
// 	 group element: "karen"
```
`groupBy` supports _quick_ expressions, so instead of
```javascript
var result = iter(people)
	.groupBy(
    	function(p) { return p.sex; },
        function(p) { return (p.age < 25 ? 'under25' : 'atLeast25'); });
```
we could write
```javascript
var result = iter(people)
	.groupBy('$.sex', '($.age < 25 ? "under25" : "atLeast25")');
```
(in _quick_ `$` contains current element value).

Examples of using `groupBy`:
```javascript
var people = [
	{ name: 'jon', sex: 'male', age: 30 },
    { name: 'marry', sex: 'female', age: 28 },
    { name: 'karen', sex: 'female', age: 16 },
    { name: 'itzki', sex: 'male', age: 33 }
];

// 1. Compute average age for males and females in peoples
iter(people)
	.groupBy('$.sex')
    .map(function(group) {
    	return {
        	// single selector - key is just a value of sex property
        	sex: group.key,
            avgAge: group.avg('$.age')
        }
    })
    .forEach(function(x) {
    	console.log('average age for ' + x.sex + ' is ' + x.avgAge + ' years');
    });
//Output:
// average age for male is 31.5 years
// average age for female is 22 years

// 2. Compute number of people per age range
iter(people)
	.groupBy(function(x) { return Math.floor(x.age / 10); })
    .forEach(function(ageGroup) {
    	console.log('age group: ' + (ageGroup.key*10) + ' - ' + (ageGroup.key*10 + 9));
        console.log('\tcount: ' + ageGroup.count());
    });
//Output:
//age group: 30 - 39
// 	count: 2
// age group: 20 - 29
// 	count: 1
// age group: 10 - 19
// 	count: 1
```

### `Iterable.prototype.random()`
Returns random element from sequence using [uniform distribution](http://en.wikipedia.org/wiki/Uniform_distribution_%28discrete%29) (all elements all equaly likely to be chosen). If sequence is empty throws exception.

```javascript
var random = iter([1,2,3,4]).random();
console.log(random);
//Output:
// 3

var random = iter([]).random();
Error: iter.random: sequence contains no elements.
```

### `Iterable.prototype.orderBy(selector1[, ... selectorN])`
<dl>
  <dt><strong>selector*</strong></dt>
  <dd>Expression of form `property [@comparer] [@asc|@desc]` that describes property accessor, optional comparer to use when comparing property values and optional sort order. Property accessor should return only JavaScript <a href="https://developer.mozilla.org/en-US/docs/Glossary/Primitive">primitive values</a>.</dd>
</dl>

Returns new sequence of elements that is sorted version of the original sequence. Returned sequence elements are sorted according to conditions specified by `selector`s.

_Warning: Internally sorting is performed by invoking `Array.sort` which doesn't guarantee stable sort._

For example to sort array of numbers we could write:
```javascript
var data = [5, 1, 3, 7, 2, 24, 3, 4];
var sorted1 = iter(data)
	.orderBy('$')
    .toArray();
console.log(sorted1);
//Output:
// [1, 2, 3, 3, 4, 5, 7, 24]
```
`$` selector means that we want to use entire object as sort key (this is possible with numbers and strings).

We can sort numbers in descending order by appending `@desc` to `$` selector:
```javascript
var sorted1 = iter(data)
	.orderBy('$ @desc')
    .toArray();
console.log(sorted1);
//Output:
// [24, 7, 5, 4, 3, 3, 2, 1]
```
We can also sort objects using values of thier properties:
```javascript
var people = [
	{ name: 'jon',    sex: 'male',    age: 30 },
    { name: 'marry',  sex: 'female',  age: 24 },
    { name: 'karen',  sex: 'female',  age: 30 },
    { name: 'itzki',  sex: 'male',    age: 33 },
    { name: 'damian', sex: 'male',    age: 24 },
    { name: 'iwan',   sex: 'male',    age: 13 }
];

// sort by age descending then by sex
var result1 = iter(people)
	.orderBy('$.age @desc', '$.sex')
    .map(function(x) { return x.name; })
    .toArray();
console.log(result1);
//Output:
// ["itzki", "karen", "jon", "marry", "damian", "iwan"]
```
In general `$` represents current element in the `selector`. We can access object properties using `$.propertyName` or `$["propertyName"]` syntax. We can also use expressions like 
```javascript
.orderBy('($.age==24 ? 999: $.age) @desc', '$.sex')
```
in place of properties.

When comparing strings we can use `@localeCompare` comparer to specify that comparision should be performed using [String.prototype.localeCompare](https://developer.mozilla.org/en-US/docs/Glossary/Primitive) function:
```javascript
var names = ['a', 'A', 'ą', 'Ą', 'b', 'B'];

console.log(
	iter(names)
    	.orderBy('$ @asc')
        .toArray());
//Output:
// ["A", "B", "a", "b", "Ą", "ą"]
        
console.log(
	iter(names)
    	.orderBy('$ @localeCompare @asc')
        .toArray());
//Output:
// ["a", "A", "ą", "Ą", "b", "B"]
```

### `Iterable.prototype.one([predicate[, context]])`
<dl>
  <dt><strong>predicate(element, index)</strong></dt>
  <dd>Optional. Function that returns either <code>true</code> or <code>false</code> for every sequence element. It takes two arguments: the current element and zero based index of the current element in the sequence.</dd>

  <dt><strong>context</strong></dt>
  <dd>Optional. Value to use as <code>this</code> when executing <code>predicate</code>.</dd>
</dl>

If sequence contains exactly one element then `one` will return that element. If sequence is either empty or contains more than one element then `one` will throw exception.

If `predicate` is specified and there is exactly one element in sequence that fullfils the `predicate` then `one` will return that element. If sequence is empty, or no element fullfils the `predicate` or there is more than one element that fullfils the `predicate` then `one` will throw exception.

```javascript
var result1 = iter(['foo']).one();
console.log(result1);
//Output:
// foo

iter([]).one();
Error: iter.one: sequence contains no elements.

iter([1, 2, 3]).one();
Error: iter.one: sequence contains more than one matching element.

var result2 = iter([1, 34, 2, 201, 3, 43])
	.one(function(x) { return x > 100; });
console.log(result2);
//Output:
// 201

iter([1, 34, 2, 201, 3, 43])
	.one(function(x) { return x > 1000; });
Error: iter.one: sequence contains no elements satisfying the predicate.

iter([1, 34, 2, 201, 3, 43])
	.one(function(x) { return x > 40; });
Error: iter.one: sequence contains more than one matching element.
```

### `Iterable.prototype.oneOrDefault(defaultValue, [predicate[, context]])`
<dl>
  <dt><strong>defaultValue</strong></dt>
  <dd>Value to return if sequence is empty or no element fulfills the <code>predicate</code>.</dd>
  
  <dt><strong>predicate(element, index)</strong></dt>
  <dd>Optional. Function that returns either <code>true</code> or <code>false</code> for every sequence element. It takes two arguments: the current element and zero based index of the current element in the sequence.</dd>

  <dt><strong>context</strong></dt>
  <dd>Optional. Value to use as <code>this</code> when executing <code>predicate</code>.</dd>
</dl>

If sequence contains exactly one element then `one` will return that element. If sequence is empty then `one` will return `defaultValue`, otherwise it will throw exception.

If `predicate` is specified and there is exactly one element in sequence that fullfils the `predicate` then `one` will return that element. If sequence is empty, or no element fullfils the `predicate` then `one` will return `defaultValue`, otherwise it will throw exception.

```javascript
var result1 = iter(['foo']).oneOrDefault('default');
console.log(result1);
//Output:
// foo

var result2 = iter([]).oneOrDefault('default');
console.log(result2);
//Output:
// default

iter([1, 2, 3]).oneOrDefault('default');
Error: iter.oneOrDefault: sequence contains more than one matching element.

var result3 = iter([1, 34, 2, 201, 3, 43])
	.oneOrDefault(666, function(x) { return x > 100; });
console.log(result3);
//Output:
// 201

var result4 = iter([1, 34, 2, 201, 3, 43])
	.oneOrDefault(666, function(x) { return x > 1000; });
console.log(result4);
//Output:
// 666

iter([1, 34, 2, 201, 3, 43])
	.oneOrDefault(666, function(x) { return x > 40; });
Error: iter.oneOrDefault: sequence contains more than one matching element.
```

## Helper methods

## Writing custom iterators
