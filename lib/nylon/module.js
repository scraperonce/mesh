/**
 * Nylon - Module.
 *
 * Copyright(c) 2010 Hisataka Ishii <scraper.once@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
var sys = require("sys");
var EventEmitter = require("events").EventEmitter;

/**
 * Nylonモジュール(Module)オブジェクトを作成する。
 * @class Nylonモジュール作成する際の基底クラス。
 */
function Module() {}

// 継承
sys.inherits(Module, EventEmitter);

/**
 * EventEmitterのonメソッドを拡張。typeを「｜」で区切って複数指定できる。
 */
Module.prototype.on = function() {
	var self =this;
	var args = Array.prototype.slice.call(arguments);
	var types = args.shift().split("|");

	while(types.length) (function(arities) {
		EventEmitter.prototype.on.apply(self, arities);
	})([types.shift()].concat(args));
};

/**
 * 自己の"send"イベントを指定されたtypeとparamで発行する。
 * @param {String} type イベントのタイプ名
 * @param {Object} param イベントに紐付けられるオブジェクト
 */
Module.prototype.send = function(type, param, dest) {
	this.emit("send", {
		type: type,
		body: param,
		dest: dest
	});
};

/**
 * 自己の"queue"イベントを指定されたtypeとparamで発行する。
 * @param {String} type イベントのタイプ名
 * @param {Object} param イベントに紐付けられるオブジェクト
 */
Module.prototype.queue = function(type, param, dest) {
	this.emit("queue", {
		type: type,
		body: param,
		dest: dest
	});
};

// export
module.exports = {
	Module: Module,
};
