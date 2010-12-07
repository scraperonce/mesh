/**
 * MeSH - index (loader)
 */

/**
 * Module dependencies.
 */

var exports = module.exports = require("./server");

exports.middleware = require("./middleware");
exports.db = require("./db");
exports.users = require("./users");

for (var n in exports.middleware) {
	exports[n] = exports.middleware[n];
}
