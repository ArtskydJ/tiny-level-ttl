var Expirer = require('expire-unused-keys')
var xtend = require('xtend')
var lock = require('level-lock')
var spaces = require('level-spaces')
var deepEqual = require('deep-equal')

function noRecursion(key) {
	var sublevels = key.split(/ÿ+/).slice(-3,-1) //take last two sub levels (do not include the key name)
	return (sublevels[0] !== sublevels[1] || typeof sublevels[0] === "undefined") //make sure they differ
}

function onCmd(expirer, type, key) {
	if (type && typeof type === 'object') {
		key = type.key
		type = type.type
	}
	if (noRecursion(key)) {
		if (type === 'del') {
			expirer.forget(key)
		} else if (type === 'put') {
			expirer.touch(key)
		}
	}
}

module.exports = function ttl(db, opts) {
	if (!db) {
		throw new Error('You must pass a level database to ttl()')
	}
	opts = xtend({ttl: 3600000, checkInterval: 10000}, opts)
	if (deepEqual(db, opts.db)) {
		opts.db = null
	}
	if (!opts.db) {
		opts.db = spaces(db, 'expirer')
	}
	var expirer = new Expirer(opts.ttl, opts.db, opts.checkInterval)
	db.on('put', onCmd.bind(null, expirer, 'put'))
	db.on('del', onCmd.bind(null, expirer, 'del'))
	db.on('batch', function (cmds) {
		cmds.forEach(onCmd.bind(null, expirer))
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
