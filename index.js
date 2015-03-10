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

function onCmd(expirer, separator, type, key) {
	var commandResponses = {
		del: expirer.forget,
		put: expirer.touch
	}
	if (isFromThisSpace(key, separator)) {
		commandResponses[type](key)
	}
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

	db.on('put', onCmd.bind(null, expirer, separator, 'put'))
	db.on('del', onCmd.bind(null, expirer, separator, 'del'))
	db.on('batch', function (cmds) {
		cmds.forEach(function (cmd) {
			onCmd(expirer, separator, cmd.type, cmd.key)
		})
	})

	expirer.on('expire', function (key) {
		var unlock = lock(db, key, 'w')
		if (unlock) {
			db.del(key, unlock)
		} else {
			expirer.touch(key) // Retry later
		}
	})
	db.refreshTtl = expirer.touch
}
