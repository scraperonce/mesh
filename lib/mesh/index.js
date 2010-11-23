/**
 * MeSH - index (loader)
 */

/**
 * Module dependencies.
 */

var exports = module.exports = require("./server");

exports.db = require("./db");
exports.middleware = require("./middleware");
exports.filter = require("./filter");
exports.users = require("./users");

for (var n in exports.middleware) {
	exports[n] = exports.middleware[n];
}