/*!
 * MeSH initializer
 * require this script on your app.js
 */

/**
 * Module dependencies.
 */

var fs = require("fs");
var events = require("events");
var sys = require("sys");

var express = require("express");
var mesh = require("./lib/mesh");
var nylon = require("./lib/nylon");

// Initialize

mesh.db.inits = {
	database: "mesh_core_schema",
	username: "root",
	password: "mesh"
};

var app = module.exports = new mesh.Server();
var db = new mesh.db.Client();

// Configuration

app.configure(function(){
	app.set("views", __dirname + "/views");

	app.use(express.bodyDecoder());
	app.use(express.methodOverride());
	app.use(express.cookieDecoder());
	app.use(express.session());
	app.use(mesh.authorizer("/login",{
		through: ["/javascripts", "/stylesheets", "/images", "/objects", "/tmp", "/data"]
	}));
	
	app.use(app.router);
	app.use(express.staticProvider(__dirname + "/public"));
});

app.configure("development", function(){
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure("production", function(){
	app.use(express.errorHandler()); 
});

app.dynamicHelpers({
	session: function(req, res) {
		return req.session;
	},
	page: (function() {
		var pages = {
			"/login": "ログイン",
			"/home": "ホーム"
		};
		return function(req, res) {
			return pages[req.url] || null;
		};
	})()
});

app.helpers({
	title: "MeSH",
	error: null,
	filestat: require("fs").statSync,
	__dirname: __dirname
});

// Routes
	
app.get("/", function(req, res){
	res.redirect("/home");
});

// Login

app.get("/login", function(req, res) {
	if (req.user) res.redirect("/");
	
	res.render("login.ejs");
});

app.post("/login", function(req, res) {
	if (req.user) res.redirect("/");

	var user = req.param("user") || "";
	var pass = req.param("pass") || "";
	var auth = mesh.authorizer("/");

	var errorRender = function(error) {
		res.render("login.ejs", {
			locals: {
				error: error
			}
		});
	};
	
	// check input
	if (!/\w/.test(user) || pass.length && !/\w/.test(pass)) {
		return errorRender("BADINPUT");
	}
	
	mesh.users.search(user, function(result) {
		if (result) {
			if (!result.password(pass)) {
				return errorRender("BADPASS");
			}
			req.session.user = result;
			req.session.user.granted = true;
			auth(req, res, function() {
				res.redirect("/");
			});
		} else {
			req.session.user = { name: user };
			req.session.user.granted = false;
			auth(req, res, function() {
				res.redirect("/");
			});
		}
	});
});

// Logout
app.post("/logout", function(req, res) {
	delete app.lesson.servers[req.user.name];
	delete app.log.servers[req.user.name];
	req.session.user = undefined;
	res.redirect("/");
});

// Home

app.get("/home", function(req, res, next) {
	var lessons = [];
	var servers = app.lesson.servers;
	for (var n in servers) {
		lessons.push(servers[n].subject);
	}
	req.lessons = lessons;
	
	// load logs
	var sql =[
		"SELECT logs.id, title, description, users.fullname, logs.date",
		"FROM logs, subjects, users WHERE logs.subject_id = subjects.id AND users.name = subjects.teacher"
	].join(" ");
	db.connect();
	db.query(sql, function(err, rows) {
		if (err) throw err;
		
		for (var n in servers) {
			var id = servers[n].log.id;
			for (var i=0; i<rows.length; i++) {
				if (rows[i].id == id) {
					rows.splice(i, 1);
				}
			}
		}
		
		req.logs = rows;

		next();
	});

}, function(req, res) {
	var lessons = req.lessons;
	var logs = req.logs;

	if (req.user.granted) {
		lessons.isStarted = app.lesson.servers[req.user.name];
		
		var sql = "SELECT id, title, description, password FROM subjects WHERE teacher = ?";
		db.connect();
		db.query(sql, [req.user.name], function(err, rows) {
			db.end();
			res.render("home.ejs", {
				locals: {
					subjects: rows,
					lessons: lessons,
					logs: logs
				}
			});
		});
	} else {
		res.render("home.ejs", {
			locals: {
				lessons: lessons,
				logs: logs
			}
		});
	}
});

// Additional method

/*
 * options = {
 * 	path: <String> mount path,
 *	restrict: <Boolean>
 * }
 *
 * return:
 * 	event: "start"
 */
app.deploy = (function() {

	/**
	 * 送信するパケットのあて先フィルタリング
	 */
	var filter = function(packets, dest) {
		if (dest) {
			for (var i=0, len=packets.length; i<len; i++) {
				if (packets[i].dest && packets[i].dest != dest) {
					packets[i] = null;
				}
			}
		}
		return packets;
	};
	
	return function(path, restrict) { 
		var servers = {};
		var emitter = new events.EventEmitter();

		var localHelpers = {};
		var dynamicHelperHandler = function() {};
		
		var name = path.split("/").join("");
		
		var through = function(req, res, next) { next(); };
		
		// Mounting
		
		app.get(path, function(req, res) {
			if (servers[req.user.name]) {
				res.redirect(path + "/" + req.user.name);
			} else {
				res.redirect("/home");
			}
		});
		
		// View
		
		app.get(path + "/:moderator", function(req, res) {
			var teacher = req.param("moderator");
			var server = servers[teacher];
			
			if (!server) return res.redirect(path);
			
			localHelpers.subject = server.subject;
			if (teacher == req.user.name) {
				localHelpers.isModerator = true;
			} else {
				localHelpers.isModerator = false;
			}
			
			var dynamics = dynamicHelperHandler(req, res);
			
			var helpers = {};
			for (var n in dynamics) helpers[n] = dynamics[n];
			for (var n in localHelpers) helpers[n] = localHelpers[n];
			
			res.render(name + ".ejs", {
				layout: name + "Layout",
				locals: helpers
			});
		});
		
		// Session control
		
		app.post(path + "/start", restrict ? mesh.restrict() : through, function(req, res) {
			emitter.emit("start", req, res);
		});
		
		app.post(path + "/stop", restrict ? mesh.restrict() : through, function(req, res) {
			
			if (servers[req.user.name]) {
				var server = servers[req.user.name];
				
				//clearInterval(server.log.intervals);
				emitter.emit("stop", req, res);
				
				delete servers[req.user.name];
			}
			res.redirect("/home");
		});
		
		// Comet Connection 
		
		app.get(path + "/:moderator/connect", mesh.params("index"), function(req, res) {
			var id = req.param("moderator");
			var index = req.param("index");
			
			var server = servers[id];
			
			if (server) {
				server.get(index, function(packet) {
					packet.body = filter(packet.body, req.user.name);
					emitter.emit("response", req, res, packet);
					res.send(packet);
				});
			} else {
				res.send(404);
			}
		});
		
		app.post(path + "/:moderator/connect", mesh.params("packet"), function(req, res) {
			var id = req.param("moderator");
			var packet = req.param("packet");
			
			var server = servers[id];
			
			if (server) {
				packet.from = req.user;
				server.post(packet);
				res.send(200);
			} else {
				res.send(404);
			}
		});
		
		emitter.localHelpers = function(obj) {
			localHelpers = obj
		};
		emitter.dynamicLocalHelpers = function(fn) {
			dynaminHelperHandler = fn;
		};
		
		emitter.servers = servers;
		
		return emitter;
	};
})();

// Lesson
app.lesson = app.deploy("/lesson", true);
(function() {
	var servers = app.lesson.servers;
	var modules = [
		require("./modules/petit-core"),
		require("./modules/petit-ecoco")
	];
	
	app.lesson.on("start", function(req, res) {
		var id = req.param("subject_id");
		if (!servers[req.user.name]) {
			
			var server = nylon.createServer();
			db.connect();
			
			var subjectSql = "SELECT title, description, teacher, fullname FROM subjects, users WHERE name = teacher AND name = ? AND id = ?";
			db.query(subjectSql, [req.user.name, id], function(err, rows) {
				if (err) return;
				
				server.subject = rows.pop();
				for (var i=0, len=modules.length; i<len; i++) {
					server.apply(modules[i].create());
				}
				servers[req.user.name] = server;

				res.redirect("/lesson/"+req.user.name);
			});
			
			var logSql = "INSERT INTO logs (subject_id, json, date, moderator) VALUES(?, '[]', NOW(), ?)";
			db.query(logSql, [id, req.user.name], function(err, result) {
				if (err) return;
				
				server.log = {
					id: result.insertId,
					events: [],
					lastLength: 0,
					beginDate: (new Date()).getTime(),
					intervals: setInterval(function() {
						var events = server.log.events;
						var lastLength = server.log.lastLength;

						if (lastLength < events.length) {
							lastLength = events.length;
						} else {
							return;
						}
						
						server.log.update();
					}, 10*1000),
					update: function() {
						db.connect();
						var events = server.log.events;
						db.query("UPDATE logs SET json = ? WHERE id = ?", [JSON.stringify(server.log.events), server.log.id], function() {
							db.end();
						});
					},
					close: function() {
						server.log.update();
						clearInterval(server.log.intervals);
					}
				};
				
				db.end();
			});
			
		}
	});
	
	app.lesson.on("stop", function(req, res) {
		var server = servers[req.user.name];
		server.log.close();	
	});
	
	app.lesson.on("response", function(req, res, packet) {
		var server = servers[req.param("moderator")];
		server.log.events.push({
			time: (new Date()).getTime() - server.log.beginDate,
			packet: JSON.parse(JSON.stringify(packet))
		});	
	});
})();

// Log

app.log = app.deploy("/log");
(function() {
	var servers = app.log.servers;
	var modules = [
		require("./modules/playback")
	];
	
	app.log.on("start", function(req, res) {
		if (!servers[req.user.name]) {
			
			var server = nylon.createServer();
			for (var i=0, len=modules.length; i<len; i++) {
				server.apply(modules[i].create());
			} 
			servers[req.user.name] = server;
			
			res.redirect("/log/"+req.user.name);
		}
	});
})();

// Trickster

app.get("/users.js", function(req, res) {
	res.send("window.users = "+JSON.stringify({
		name: req.user.name, fullname: req.user.fullname, granted: req.user.granted
	})+";");
});

