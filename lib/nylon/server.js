/*!
 * Nylon - server
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
 * Nylonサーバ(Server)オブジェクトを生成する。
 * @class Nylonサーバを定義するクラス
 * @event receive パケットの受信時にemitされるべきイベント
 * @event send パケットの送信時にemitされるイベント
 * @event connect 接続要求のためのイベントキュー
 */
function Server() {
	
	// private properties
	
	/**
	 * イベントキューを設定
	 * @type Array
	 */
	this.queue = [];

	/**
	 * ロードしたモジュールの配列
	 * @type Array
	 */
	this.modules = [];
	
	// Initialize
	var self = this;
	
	// receiveが呼ばれたらパケットをモジュールに分配
	self.on("receive", function(packet) {
		
		if (packet.type == "send") {
			packet.body = [packet.body];
		}
		
		var modules = self.modules;
		var queue = packet.body;
		
		for (var i=0, mods=modules.length; i<mods; i++) {
			for (var n in queue) {
				queue[n].from = packet.from;
//			modules[i].emit("receive", queue[n]);
				modules[i].emit(queue[n].type, queue[n].body, queue[n]);
			}
		}
	});
}

// 継承
sys.inherits(Server, EventEmitter);

/**
 * モジュールをサーバに適用する
 * @param {Module} module 適用するモジュール
 */
Server.prototype.apply = function(module) {
	var self = this, modules = this.modules, queue = this.queue;
	if (modules.indexOf(module) == -1) {
		
		// キューに残さないパケット送信イベント処理
		module.on("send", function(packet) {
			self.emit("send", {
				type: "send",
				body: [packet]
			});
		});
		
		// イベントキューに残すパケット送信イベント処理
		module.on("queue", function(packet) {
			if (packet) queue.push(packet);
			self.emit("send", {
				type: "queue"
			});
		});
		
		modules.push(module);
	}
};

/**
 * 接続要求を登録する
 * @param {Function} responseHandler 接続要求解放時に実行される関数
 */
Server.prototype.get = function(index, responseHandler) {
	var self = this, queue = this.queue;
	
	var handler = function(packet) {
		self.removeListener("send", handler);
		
		if (packet.type == "queue") {
			packet.body = queue.slice(index);
		}
		responseHandler(packet);
	};
	
	if (index < queue.length) {
		return handler({type: "queue"});
	}
	
	this.on("send", handler);
};

/**
 * 受信したデータをキューに追加する
 */
Server.prototype.post = function(packet) {
	this.emit("receive", packet);
};

module.exports = {
	Server: Server,
	createServer: function() {
		return new Server();
	}
};
