
# iter.js - adds Iterators to JavaScript

This library allows you to write data processing statements using syntax similar to C# LINQ or Java 8 streams, for example:
```javascript
var firstTenPrimes = iter.range(2, 100)
    .filter(function(n) { return isPrime(n); })
    .take(10)
    .toArray();
```
additionally it provides shorter syntax named _quick_ that allows you to drop `function` and `return` from lambda expressions e.g:
```javascript
var onlyEven = iter.range(0, 100)
    .filter('$ % 2 === 0')
    .toArray();
```
Here `'$ % 2 === 0'` is a _quick_ expression (_quicks_ are compiled using `eval` and they doesn't support closures).

Full library documentation is contained on [wiki pages](https://github.com/marcin-chwedczuk/iter.js/wiki).
