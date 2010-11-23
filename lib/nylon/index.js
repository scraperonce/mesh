/**
 * Nylon - index (loader)
 */

/**
 * Module dependencies.
 */
var server = require("./server");
var mods = require("./module");

module.exports = {
	Server: server.Server,
	createServer: server.createServer,
	Module: mods.Module
};
