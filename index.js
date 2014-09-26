var Expirer = require('expire-unused-keys')
var xtend = require('xtend')
var hooks = require('level-hooks')
var lock = require('level-lock')

module.exports = function ttl(db, opts) {
	if (!db) {
		throw new Error('You must pass a level database to ttl()')
	} else if (!db.sublevel) {
		throw new Error('You must pass a level-sublevel ready database')
	}
	hooks(db)
	opts = xtend({ttl: 3600000, checkInterval: 10000}, opts)
	var expirer = new Expirer(opts.ttl, db.sublevel('expirer'), opts.checkInterval)
	db.hooks.post(function (change) {
		if (change.type === 'put') {
			expirer.touch(change.key)
		} else if (change.type === 'del') {
			expirer.forget(change.key)
		}
	})
	expirer.on('expire', function (key) {
		var unlock = lock(db, key, 'w')
		if (unlock) {
			db.del(key, function (err) {
				unlock()
			})
		} else {
			expirer.touch(key) //retry next time
		}
	}) //if err, this will probably throw
	db.refreshTtl = expirer.touch
}
