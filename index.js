var Expirer = require('expire-unused-keys')
var xtend = require('xtend')
var lock = require('level-lock')
var spaces = require('level-spaces')
var defaultOpts = {
	ttl: 3600000,
	checkInterval: 10000,
	separator: [ '~', '\xff', '\x00' ]
}

function isFromThisSpace(key, separator) {
	if (!Array.isArray(separator)) {
		separator = [ separator ]
	}
	return separator.every(function (sep) {
		return key.indexOf(sep) === -1
	})
}

function createResponses(expirer, separator) {
	var responses = {}
	responses.del = function(key) {
		if (isFromThisSpace(key, separator)) {
			expirer.forget(key)
		}
	}
	responses.put = function(key) {
		if (isFromThisSpace(key, separator)) {
			expirer.touch(key)
		}
	}
	responses.batch = function(cmds) {
		cmds.forEach(function(cmd) {
			responses[cmd.type](cmd.key)
		})
	}
	return responses
}

function makeChildDb(db, separator) {
	return db.sublevel ?
		db.sublevel('expirer') :
		spaces(db, 'expirer', { separator: separator })
}

module.exports = function ttl(db, opts) {
	if (!db) {
		throw new Error('You must pass a level database to ttl()')
	}
	var options = xtend(defaultOpts, opts)
	var separator = options.separator
	var childDb = makeChildDb(db, separator)
	var expirer = new Expirer(options.ttl, childDb, options.checkInterval)
	var responses = createResponses(expirer, separator)

	db.on('put', responses.put)
	db.on('del', responses.del)
	db.on('batch', responses.batch)
	db.once('closing', shutdown)

	expirer.on('expire', function (key) {
		var unlock = lock(db, key, 'w')
		if (unlock) {
			db.del(key, unlock)
		} else {
			expirer.touch(key) // Retry later
		}
	})
	db.refreshTtl = expirer.touch

	function shutdown() {
		delete db.refreshTtl
		db.removeListener('put', responses.put)
		db.removeListener('del', responses.del)
		db.removeListener('batch', responses.batch)
		expirer.stop()
	}
}
