tiny-level-ttl
==============

[![Build Status](https://travis-ci.org/ArtskydJ/tiny-level-ttl.svg?branch=master)](https://travis-ci.org/ArtskydJ/tiny-level-ttl)

- [Information](#information)
- [Install](#install)
- [Require](#require)
- [ttl(db, opts)](#ttldb-opts)
- [Example](#example)
- [License](#license)

#Information

Small addon to node-level that enforces a time to live (TTL).

- ttl is specified once when the library is initialized (unlike level-ttl where ttl must be included with each `put()` call)
- supports sublevel 5 & 6
- respects [level-lock](https://github.com/substack/level-lock) locks

Why use this instead of [`node-level-ttl`](https://github.com/rvagg/node-level-ttl)? Because [`level-sublevel`](https://github.com/dominictarr/level-sublevel) and [`node-level-ttl`](https://github.com/rvagg/node-level-ttl) conflict.

[Bug reproduction test code here.](https://gist.github.com/ArtskydJ/65ebbd9cdbcdea9f091e)  
The bug was found with `level-sublevel@6.x.x` & `level-ttl@2.x.x`, and `level-sublevel@5.x.x` & `level-ttl 0.6.x`.

#Install

With `npm` do:
	
	npm install tiny-level-ttl

#Require

```js
var ttl = require('tiny-level-ttl')
```

#ttl(db, opts)

Adds a `refreshTtl()` property to the `db`. `refreshTtl()` is a function, which, when called, will refresh the ttl on a key. This adds the ability to make the ttl act like a session manager by calling `refreshTtl()` every time you do `db.get()`.

Also, this respects the locks that [`level-lock`](https://github.com/substack/level-lock) creates. If `tiny-level-ttl` attempts to delete a key, and the key's write access is locked, it will restart the key's life. (In most cases, this is the desired outcome. If the key is being written to, you would've restarted the key's life anyway. If the key is being deleted, restarting its life will not mess anything up.)

- `db` is a levelup database that is sublevel ready, or a is a sub database.
- `opts` is an object with the following properties:
	- `ttl` is a number of milliseconds for how long a key lives in the `db`. Defaults to `3600000`, (1 hour).
	- `checkInterval` is a number of milliseconds for how long the interval between checking keys is. Defaults to `10000`, (10 seconds).

#Example

```js
var level = require('level-mem')
var sublevel = require('level-sublevel')
var ttl = require('./index.js')

var db = level('/levelmem/does/not/care')
db = sublevel(db) //Must run sublevel on it.
ttl(db, {ttl: 1000, checkInterval: 50})

db.put('hi', 'wuzzup') //this sets the ttl

setTimeout(function () { //before key expires
	db.get('hi', function (err, value) {
		// `err` should be falsey
		// `err.notFound` should be falsey
		// `value` should be 'wuzzup'
	})
}, 900)

setTimeout(function () { //after key expires
	db.get('hi', function (err, value) {
		// `err` should be truthy
		// `err.notFound` should be truthy
		// `value` should be falsey
	})
}, 1100)
```

#License

[MIT](http://opensource.org/licenses/MIT)
