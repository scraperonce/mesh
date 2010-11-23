/**
 * Module dependencies.
 */
var exports = module.exports = {};

exports.authorizer = function(path, options) {
	return function(req, res, next) {
		var through = options && options.through || [];
		var bool = [
			(req.user),
			(req.session && req.session.user),
			(req.url == path),
			(RegExp("^("+through.join("|")+")/.*$").test(req.url)),
		].some(function(e) {return e;});
		
		if (bool) {
			req.user = req.session.user;
			return next();
		} else {
			res.redirect(path);
		}
	};
};

exports.params = function() {
	var needs = Array.prototype.slice.apply(arguments);
	return function(req, res, next) {
		for (var i=0, len=needs.length; i<len; i++) {
			if (req.param(needs[i]) == "" || !req.param(needs[i])) {
				return res.send("Lack of parameters", 403);
			}
		}
		next();
	};
};

exports.restrict = function() {
	var who = arguments.length && Array.prototype.slice.apply(arguments) || null;
	return function(req, res, next) {
		
		var userGate = who && who.every(function(elm) { return elm == req.user.name; });
		if (!req.user.granted || userGate) {
			return res.redirect("/");
		}
		next();
	};
};
