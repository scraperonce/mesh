/**
 * Module dependencies.
 */
var exports = module.exports = {};

// depended express.cookieDecoder
exports.session = function(req, res, next) {
	if (req.sessionID) return next();
	
	res.send("Session disabled", 403);
};

exports.granted = function(req, res, next) {
	if (req.user)
		return next();
	
	res.send("User authentication failed", 403);
};

exports.params = function() {
	var needs = Array.prototype.slice.apply(arguments);
	return function(req, res, next) {
		for (var i=0, len=needs.length; i<len; i++) {
			if (req.param(needs[i]) == "" || !req.param(needs[i])) {
				res.send("Lack of parameters", 403);
			}
		}
		next();
	};
};
