/**
 * Module dependencies.
 */

var mysql = require("mysql");
var inherits = require("sys").inherits;
var crypto = require("crypto");

var exports = module.exports = {};

// Define constants

exports.DB_NAME = "mesh_core_schema";
exports.DB_USER = "root";
exports.DB_PASS = "mesh";

exports.Client = function() {
	mysql.Client.apply(this, arguments);
	
	this.database = exports.DB_NAME;
	this.user = exports.DB_USER;
	this.password = exports.DB_PASS;
}
inherits(exports.Client, mysql.Client);