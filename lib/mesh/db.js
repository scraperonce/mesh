/**
 * Module dependencies.
 */

var mysql = require("mysql");
var inherits = require("sys").inherits;

var exports = module.exports = {};

// Define constants

exports.inits = {
	database: "mesh_core_schema",
	username: "root",
	password: "mesh"
};

exports.Client = function() {
	mysql.Client.apply(this, arguments);
	
	this.database = exports.inits.database;
	this.user = exports.inits.username;
	this.password = exports.inits.password;
};

inherits(exports.Client, mysql.Client);
