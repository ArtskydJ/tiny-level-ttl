var Expirer = require('expire-unused-keys')
var xtend = require('xtend')
var lock = require('level-lock')
var spaces = require('level-spaces')

function isFromThisSpace(key) {
	return key.indexOf('ÿ') === -1
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

function onBatch(expirer, cmd) {
	onCmd(expirer, cmd.type, cmd.key)
}

function makeChildDb(db) {
	return db.sublevel ? db.sublevel('expirer') : spaces(db, 'expirer')
}

module.exports = function ttl(db, opts) {
	if (!db) {
		throw new Error('You must pass a level database to ttl()')
	}
	opts = xtend({ttl: 3600000, checkInterval: 10000}, opts)
	var childDb = makeChildDb(db)
	var expirer = new Expirer(opts.ttl, childDb, opts.checkInterval)

	db.on('put', onCmd.bind(null, expirer, 'put'))
	db.on('del', onCmd.bind(null, expirer, 'del'))
	db.on('batch', function (cmds) {
		cmds.forEach(onBatch.bind(null, expirer))
	})

	expirer.on('expire', function (key) {
		var unlock = lock(db, key, 'w')
		if (unlock) {
			db.del(key, unlock)
		} else {
			expirer.touch(key) //retry next time
		}
	}) //if err, this will probably throw
	db.refreshTtl = expirer.touch
}
