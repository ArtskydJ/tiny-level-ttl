var Expirer = require('expire-unused-keys')

module.exports = function ttl(db, ttl, checkInterval) {
	if (!db) {
		throw new Error('You must pass a level database to ttl()')
	} else if (!db.sublevel) {
		throw new Error('You must pass a level-sublevel ready database')
	}

	var expirer = new Expirer(
		ttl || 3600000, //1 hour, as specified in readme.md
		db.sublevel('expirer'),
		checkInterval || 10000 //10 seconds, as specified in readme.md
	)

	db.on('put', function (key, value) { //I hope this is not recursive; touch() calls put() in a subDb
		expirer.touch(key)
	})

	expirer.on('expire', db.del.bind(db)) //if err, this will probably throw
}