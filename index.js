var Expirer = require('expire-unused-keys')
var xtend = require('xtend')

module.exports = function ttl(db, opts) {
	if (!db) {
		throw new Error('You must pass a level database to ttl()')
	} else if (!db.sublevel) {
		throw new Error('You must pass a level-sublevel ready database')
	}
	opts = xtend({ttl: 3600000, checkInterval: 10000, refreshOnGet: false}, opts)
	var expirer = new Expirer(opts.ttl, db.sublevel('expirer'), opts.checkInterval)
	var put = db.put
	db.put = function (key) {
		expirer.touch(key)
		put.apply(db, arguments)
	}
	if (opts.refreshOnGet) {
		var get = db.get
		db.get = function (key) {
			expirer.touch(key)
			get.apply(db, arguments)
		}
	}
	expirer.on('expire', db.del.bind(db)) //if err, this will probably throw
}
