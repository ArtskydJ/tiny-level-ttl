tiny-level-ttl
==============

[![Build Status](https://travis-ci.org/ArtskydJ/tiny-level-ttl.svg?branch=master)](https://travis-ci.org/ArtskydJ/tiny-level-ttl)

- [Information](#information)
- [Install](#install)
- [Require](#require)
- [ttl(db, ttl, checkInterval)](#ttldb-ttl-checkinterval)
- [Example](#example)
- [License](#license)

#Information

Small addon to node-level that enforces a time to live (TTL).

Must include a sublevel ready database. You choose between sublevel 5 and 6. This doesn't care.

Why use this instead of [`node-level-ttl`](https://github.com/rvagg/node-level-ttl)? Because [`level-sublevel`](https://github.com/dominictarr/level-sublevel) and [`node-level-ttl`](https://github.com/rvagg/node-level-ttl) conflict. (Info to back this up is coming soon. Have to get the bug reproduction code from a friend.)

#Install

With `npm` do:
	
	npm install tiny-level-ttl

#Require

```js
var ttl = require('tiny-level-ttl')
```

#ttl(db, ttl, checkInterval)

- `db` is a levelup database that is sublevel ready, or a sub database.
- `ttl` is a number of milliseconds for how long a key lives in the db.
- `checkInterval` is a number of milliseconds for how long the interval between checking keys is.

#Example

```js
var level = require('level-mem')
var sublevel = require('level-sublevel')
var ttl = require('./index.js')

var db = level('/levelmem/does/not/care')
db = sublevel(db) //Must run sublevel on it.
ttl(db, 1000, 50) //1000 ms ttl, 50 ms check interval

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
