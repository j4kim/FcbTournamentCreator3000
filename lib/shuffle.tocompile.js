// browserify shuffle.tocompile.js -o shuffle.js

shuffle = require('shuffle-array');

console.log("test shuffle", shuffle([1,2,3,4,5]));