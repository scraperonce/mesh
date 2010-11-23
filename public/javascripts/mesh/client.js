(function() {
/*!
 * Nylon - client
 * Asynchronous web messageing client
 *
 * Copyright(c) 2010 Hisataka Ishii <scraper.once@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

/**
 * Global namespace.
 */
var namespaces = "nylon";
 
/**
 * Implement event-driven system to any objects.
 */
function EventEmitter() {
	// prepare
	var self = this;
	
	// private properties
	var map = {};
	
	// public methods
	self.on = function(type, listener) {
		var events = map[type] || [];
		events.push(listener);
		map[type] = events;
	};

	self.removeListener = function(type, listener) {
		var events = map[type] || [];
		var index = events.indexOf(listener);
		if (index != -1) events.splice(index, 1);
		map[type] = events;
	};

	self.removeAllListeners = function(type) {
		if (map[type]) map[type] = [];
	};

	self.emit = function(type/* arg1,..., arg2*/) {
		var args = [];
		for (var n=1, p=arguments.length; n<p; n++) {
			args.push(arguments[n]);
		}
		
		var events = map[type] || [];
		for (var i=0, len=events.length; i<len; i++) (function(fx) {
			setTimeout(function() { fx.apply(null, args) }, 0);
		})(events[i]);
	};

	self.listener = function(type) {
		var events = map[type];
		return events ? events.concat() : null;
	};
}

/**
 * The nylon client.
 */
function Client() {
	// inherit
	EventEmitter.call(this);

	// prepare
	var self = this;
	
	// private properties
	var name = null;

	// public methods
	self.send = function(type, param) {
		self.emit("send", {
			type: type,
			body: param
		});
	};
	
	self.listen = function() {
		self.on("receive", function(message) {
			self.emit(message.type, message.body, message.dest);
		});
	};
}

/**
 * Interface Message
 */
Client.Message = {
	type: String,
	body: Object,
	dest: {
		from: String,
		to: String
	}
};

function CometClient() {
	// inherit
	Client.call(this);
	
	// prepare
	var self = this;
	
	// private properties
	var buffer = [];
	var queue = [];
	var path = "/";
	
	// private methods
	var clone = function(obj) {
		var lambda = function() {};
		lambda.prototype = obj;
		return new lambda();
	};
	var comet = {
		get: (function() {
			var option = {
				url: path,
				type: "GET",
				cache: false,
				timeout: 3*60*1000,
				dataType: "json",
				data: null,
				success: function(packet) {
					if (!packet || !packet.body || !$.isArray(packet.body))
						return setTimeout(this._processedCallback, 0);;
					
					var list = packet.body;
					for (var n in list) {
						if (list[n]) self.emit("receive", list[n]);
						if (packet.type == "queue")
							queue.push(list[n]);
					}
					setTimeout(this._processedCallback, 0);
				},
				error: function() {
					setTimeout(this._processedCallback, 1000);
				},
				_processedCallback: function() {}
			};
			return function(path, data, callback) {
				var opt = clone(option);
				opt.url = path;
				opt.data = data;
				if (callback) opt._processedCallback = callback;
				$.ajax(opt);
			};			
		})(),
		post: (function() {
			var option = {
				url: path,
				type: "POST",
				data: {	queue: {} }
			};
			return function(path, data) {
				var opt = clone(option);
				opt.url = path;
				opt.data = data;
				$.ajax(opt);
			};
		})()
	};
	
	// public methods
	var super_listen = self.listen;
	self.listen = function(httpPath) {
		path = httpPath || path;
		
		var polling = function() {
			comet.get(path, {
				index: queue.length
			}, polling);
		};
		polling();
		
		var qid = setInterval(function() {
			if (!buffer.length) return false;
			var buf = buffer.concat();
			buffer = [];
			
			comet.post(path, {
				packet: {
					type: "queue",
					body: buf
				}
			});
		}, 70);
		
		super_listen();
	};

	// initialize
	var jq = jQuery;
	
	self.on("send", function(packet) {
		buffer.push(packet);
	});
}

window[namespaces] = {
	EventEmitter: EventEmitter,
	Client: Client,
	CometClient: CometClient,
	client: new CometClient(),
	require: function(path) {
		var req = new XMLHttpRequest();
		req.open("GET", path + ".js", false);
		req.send();

		if (req.status != 200) {
			req.abort();
			throw new Error("failed to load remote script file. ["+path+"]");
		}

		// 評価
		var script = req.responseText;
		return eval(script);
	}
};
})();
