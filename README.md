tiny-level-ttl
==============

[![Build Status](https://travis-ci.org/ArtskydJ/tiny-level-ttl.svg?branch=master)](https://travis-ci.org/ArtskydJ/tiny-level-ttl)

Small addon to node-level that enforces a time to live (TTL).

- ttl is specified once when the library is initialized (unlike level-ttl where ttl must be included with each `put()` call)
- supports [`level-sublevel`](https://github.com/dominictarr/level-sublevel) 5 & 6, but falls back on [`level-spaces`](https://github.com/rvagg/level-spaces)
- respects [level-lock](https://github.com/substack/level-lock) locks

Why use this instead of [`node-level-ttl`](https://github.com/rvagg/node-level-ttl)? Because [`level-sublevel`](https://github.com/dominictarr/level-sublevel) and [`node-level-ttl`](https://github.com/rvagg/node-level-ttl) conflict.

[Bug reproduction test code here.](https://gist.github.com/ArtskydJ/65ebbd9cdbcdea9f091e)  
The bug was found with `level-sublevel@6.x.x` & `level-ttl@2.x.x`, and `level-sublevel@5.x.x` & `level-ttl 0.6.x`.

# api

```js
var ttl = require('tiny-level-ttl')
```

# `ttl(db, opts)`

Adds a `refreshTtl()` property to the `db`. `refreshTtl()` is a function, which, when called, will refresh the ttl on a key. This adds the ability to make the ttl act like a session manager by calling `refreshTtl()` every time you do `db.get()`.

Also, this respects the locks that [`level-lock`](https://github.com/substack/level-lock) creates. If `tiny-level-ttl` attempts to delete a key, and the key's write access is locked, it will restart the key's life. (In most cases, this is the desired outcome. If the key is being written to, you would've restarted the key's life anyway. If the key is being deleted, restarting its life will not mess anything up.)

- `db` is a levelup database.
- `opts` is an object with the following properties:
	- `ttl` is a number of milliseconds for how long a key lives in the `db`. Optional; defaults to `3600000`, (1 hour).
	- `checkInterval` is a number of milliseconds for how long the interval between checking keys is. Optional; defaults to `10000`, (10 seconds).

# example

Basic usage:

```js
var level = require('level-mem')
var ttl = require('tiny-level-ttl')

var db = level('/levelmem/does/not/care')
ttl(db, {
	ttl: 1000,
	checkInterval: 50
})

db.put('hi', 'wuzzup') //this sets the ttl

setTimeout(function () { //before key expires
	db.get('hi', function (err, value) {
		console.log(err && err.notFound) // -> null
		console.log(value) // -> 'wazzup'
	})
}, 900)

setTimeout(function () { //after key expires
	db.get('hi', function (err, value) {
		console.log(err && err.notFound) // -> true
		console.log(value) // -> undefined
	})
}, 1100)
```

# install

With [`npm`](http://nodejs.org/download) do:

```
npm install tiny-level-ttl
```

# license

[VOL](http://veryopenlicense.com/)
