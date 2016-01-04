tiny-level-ttl
==============

> A tiny javascript module that enforces a [time to live (TTL)][wiki-ttl] on a [`node-levelup`][levelup] database.

[![Build Status](https://travis-ci.org/ArtskydJ/tiny-level-ttl.svg?branch=master)](https://travis-ci.org/ArtskydJ/tiny-level-ttl)

- The ttl is specified in the constructor. (In [`node-level-ttl`][ttl] you can set the ttl in the constructor, and/or in a `db.put()` call.)
- Supports [`level-sublevel`][sublevel] 5 & 6, and [`level-spaces`][spaces] 1 & 2. (Defaults to [`level-spaces@2`][spaces].)
- Respects [`level-lock`][lock] locks.

Why use this instead of [`node-level-ttl`][ttl]? Because [`level-sublevel`][sublevel] and [`node-level-ttl`][ttl] conflict.

[Bug reproduction test code here.][bug-code]  
The bug was found using `level-sublevel@6` with `level-ttl@2`, and `level-sublevel@5` with `level-ttl 0.6`.

# api

```js
var ttl = require('tiny-level-ttl')
```

# `ttl(db[, opts])`

Adds a `refreshTtl` method to the `db`. When `db.refreshTtl(key)` is called, it will refresh the ttl on the `key`. This adds the ability to make the ttl act like a session manager by calling `refreshTtl()` every time you do `db.get()`.

Also, this respects the locks that [`level-lock`][lock] creates. If `tiny-level-ttl` attempts to delete a key, and the key's write access is locked, it will restart the key's life. (In most cases, this is the desired outcome. If the key is being written to, you would've restarted the key's life anyway. If the key is being deleted, restarting its life will not mess anything up.)

- `db` is a levelup database.
- `opts` is an object with the following properties:
	- `ttl` is a number of milliseconds for how long a key lives in the `db`. Optional; defaults to `3600000`, (1 hour).
	- `checkInterval` is a number of milliseconds for how long the interval between checking keys is. Optional; defaults to `10000`, (10 seconds).
	- `separator` can be a string, buffer, or array of strings/buffers. These represent the separator used in the sub-database. For example, `level-spaces` by default has the separator `~`, so if you store the key `bar`, in the space `foo`, the key will be `~foo~bar`. Defaults to `[ '~', '\xff', '\x00' ]`.

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

With [npm](http://nodejs.org/download) do:

    npm install tiny-level-ttl

# license

[VOL](http://veryopenlicense.com/)


[bug-code]: https://gist.github.com/ArtskydJ/65ebbd9cdbcdea9f091e
[levelup]: https://github.com/rvagg/node-levelup
[lock]: https://github.com/substack/level-lock
[spaces]: https://github.com/rvagg/level-spaces
[sublevel]: https://github.com/dominictarr/level-sublevel
[ttl]: https://github.com/rvagg/node-level-ttl
[wiki-ttl]:https://en.wikipedia.org/wiki/Time_to_live
