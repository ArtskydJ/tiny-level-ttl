var Expirer = require('expire-unused-keys')

module.exports = function ttl(db, ttl, checkInterval) {
	if (!db) {
		throw new Error('You must pass a level database to ttl()')
	} else if (!db.sublevel) {
		throw new Error('You must pass a level-sublevel ready database')
	}

	var expirer = new Expirer(
		ttl || 60000,
		db.sublevel('expirer'),
		checkInterval || 1000
	)

	db.on('put', function (key, value) { //I hope this is not recursive; touch() calls put() in a subDb
		expirer.touch(key)
	})

	expirer.on('expire', db.del.bind(db)) //if err, this will probably throw
}