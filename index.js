var Expirer = require('expire-unused-keys')
var xtend = require('xtend')
var lock = require('level-lock')
var spaces = require('level-spaces')
var defaultOpts = {
	ttl: 3600000,
	checkInterval: 10000
}

// https://github.com/rvagg/level-spaces/issues/2
function isFromThisSpace(key) {
	function lacks(char) {
		return (key.indexOf(char) === -1)
	}
	return ( lacks('ÿ') && lacks('~') && lacks('\xff') && lacks('\x00') )
}

function onCmd(expirer, type, key) {
	var commandResponses = {
		del: expirer.forget,
		put: expirer.touch
	}
	if (isFromThisSpace(key)) {
		commandResponses[type](key)
	}
}

function makeChildDb(db) {
	return db.sublevel ? db.sublevel('expirer') : spaces(db, 'expirer')
}

module.exports = function ttl(db, opts) {
	if (!db) {
		throw new Error('You must pass a level database to ttl()')
	}
	var options = xtend(defaultOpts, opts)
	var childDb = makeChildDb(db)
	var expirer = new Expirer(options.ttl, childDb, options.checkInterval)

	db.on('put', onCmd.bind(null, expirer, 'put'))
	db.on('del', onCmd.bind(null, expirer, 'del'))
	db.on('batch', function (cmds) {
		cmds.forEach(function (cmd) {
			onCmd(expirer, cmd.type, cmd.key)
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
