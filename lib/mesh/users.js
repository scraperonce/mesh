/**
 * Module dependencies.
 */

var db = new (require("./db")).Client();

var exports = module.exports = {};

exports.search = function(name, fn) {
	var sql = db.format("SELECT * FROM users WHERE name = ?", [name]);
	db.connect();
	db.query(sql, function(err, rows) {
		db.end();
		
		var user = rows[0];
		if (rows.length == 1) {
			var pass = user.password;
			user.password = function(p) {
				return (pass == p);
			}
			fn(user);
		} else {
			fn(null);
		}
	});
}

/*
exports.authorize = function(name, pass, fn) {
	search("name", name, function(user) {
		if (user) {
			if (user.passowrd == pass) {
				fn(true);
			} else {
				fn(false);
			}
		} else {
			fn(null);
		}		
	});
};

exports.search = function(key, value, fn) {
	search(key, value, function(user) {
		user.password = undefined;
		fn(user);
	});
};
*/