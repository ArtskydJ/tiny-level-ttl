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

Must include a sublevel ready database. You choose between sublevel 5 and 6. This doesn't care.

Why use this instead of [`node-level-ttl`](https://github.com/rvagg/node-level-ttl)? Because [`level-sublevel`](https://github.com/dominictarr/level-sublevel) and [`node-level-ttl`](https://github.com/rvagg/node-level-ttl) conflict. [Bug reproduction test code here.](https://gist.github.com/ArtskydJ/65ebbd9cdbcdea9f091e)

#Install

With `npm` do:
	
	npm install tiny-level-ttl

#Require

```js
var ttl = require('tiny-level-ttl')
```

#ttl(db, opts)

- `db` is a levelup database that is sublevel ready, or a sub database.
- `opts` is an object with the following properties:
	- `ttl` is a number of milliseconds for how long a key lives in the `db`. Defaults to `3600000`, (1 hour).
	- `checkInterval` is a number of milliseconds for how long the interval between checking keys is. Defaults to `10000`, (10 seconds).
	- `refreshOnGet` is a boolean of whether or not the key life should be restarted when `db.get()` is called during its life. Useful for session managers. Defaults to `false`.

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
