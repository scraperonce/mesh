/**
 * Module dependencies.
 */

var express = require("express");
var db = new (require("./db")).Client();

var inherits = require("sys").inherits;

var users = require("./users");
var middleware = require("./middleware");
var filter = require("./filter");

var exports = module.exports = {};

exports.Server = function(modules) {
	// Inheritance
	express.Server.call(this);
	
	// Publics
	this.servers = {};
	this.modules = modules || [];
	
	// Initialize
	var app = this;
}
inherits(exports.Server, express.Server);

exports.Server.prototype.users = users;

exports.Server.prototype.listen = function() {
	var app = this;
	
	// Configration
	
	express.Server.prototype.listen.apply(this, arguments);
};

