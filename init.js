/*!
 * MeSH initializer
 * require this script on your app.js
 */

/**
 * Module dependencies.
 */

var fs = require("fs");

var express = require("express");
var mesh = require("./lib/mesh");
var nylon = require("./lib/nylon");

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
	
	app.users.search(user, function(result) {
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
	delete app.servers[req.user.name];
	req.session.user = undefined;
	res.redirect("/");
});

// Home

app.get("/home", function(req, res, next) {
	var lessons	= [];
	var servers = app.servers;

	for (var n in servers) {
		lessons.push(servers[n].subject);
	}
	
	req.lessons = lessons;

	// load logs
	var sql = "SELECT logs.id, title, description, password FROM logs, subejcts WHERE logs.subject_id = subjects.id";
	db.connect();
	db.query(sql, function(err, rows) {
		var list = [];
		consoel.log(rows);
		/*
		for (var n in servers) {
			var id = servers[n].log.id;
			for (var i=0, len=rows.length; i<len; i++) {
				if () rows[];
			}
		}
		*/

		next();
	});

}, function(req, res) {
	var lessons = req.lessons;

	if (req.user.granted) {
		var sql = "SELECT id, title, description, password FROM subjects WHERE teacher = ?";
		db.connect();
		db.query(sql, [req.user.name], function(err, rows) {
			db.end();
			res.render("home.ejs", {
				locals: {
					lessonStarted: app.servers[req.user.name],
					subjects: rows,
					lessons: lessons	
				}
			});
		});
	} else {
		res.render("home.ejs", {
			locals: {
				lessons: lessons
			}
		});
	}
});

// Lesson

app.get("/lesson", function(req, res) {
	if (app.servers[req.user.name]) {
		res.redirect("/lesson/"+req.user.name);
	} else {
		res.redirect("/home");
	}
});

app.get("/lesson/:teacher", function(req, res) {
	var teacher = req.param("teacher");
	var server = app.servers[teacher];
	
	if (!server) return res.redirect("/lesson");
	
	res.render("lesson.ejs", {
		layout: "lessonLayout",
		locals: {
			subject: server.subject
		}
	});
});

app.post("/lesson/start", mesh.restrict(), mesh.params("subject_id"), function(req, res) {
	var id = req.param("subject_id");
	var servers = app.servers;
	
	if (!servers[req.user.name]) {
		
		var server = nylon.createServer();
		var closed = false;
		db.connect();

		var subjectSql = "SELECT title, description, teacher, fullname FROM subjects, users WHERE name = teacher AND name = ? AND id = ?";
		db.query(subjectSql, [req.user.name, id], function(err, rows) {
			
			if (!closed) {
				db.end(); closed = true;
			}
			
			server.subject = rows.pop();
			var list = fs.readdirSync(__dirname+"/modules");
			for (var i=0, len=list.length; i<len; i++) {
				if (/.js$/.test(list[i])) {
					server.apply(require(__dirname+"/modules/"+list[i]).create());
				}
			}
			servers[req.user.name] = server;
		});

		var logSql = "INSERT INTO logs (subject_id, json, date) VALUES(?, '{}', NOW())";
		db.query(logSql, [id], function(err, result) {
			
			if (!closed) {
				db.end(); closed = true;
			}
			
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

					var json = { events: events };
					db.connect();
					db.query("UPDATE logs SET json = ? WHERE id = ?", [JSON.stringify(json), server.log.id], function() {
						db.end();
					});
				}, 10*1000)
			};
		});
		
	}
	res.redirect("/lesson/"+req.user.name);
});

app.post("/lesson/stop", mesh.restrict(), function(req, res) {
	var servers = app.servers;

	if (!servers[req.user.name]) {
		var server = servers[req.user.name];
		
		clearInterval(server.log.intervals);

		delete servers[req.user.name];
	}
	res.redirect("/home");
});

// Connection - Comet (long-polling)

app.get("/connect/:server_id", mesh.params("index"), function(req, res) {
	var id = req.param("server_id");
	var index = req.param("index");
	
	if (!(id in app.servers)) return res.send(404);
	var server = app.servers[id];
	
	server.request({index: index, from: req.user}, function(packet) {
		server.log.events.push({
			time: (new Date()).getTime() - server.log.beginDate,
			packet: packet
		});
		res.send(packet);
	});
});

app.post("/connect/:server_id", mesh.params("packet"), function(req, res) {
	var id = req.param("server_id");
	var packet = req.param("packet");
	
	if (!(id in app.servers)) return res.send(404);
	var server = app.servers[id];
	
	server.response({packet: packet, from: req.user});
	res.send(200);
});

// Trickster

app.get("/users.js", function(req, res) {
	res.send("window.users = "+JSON.stringify({
		name: req.user.name, fullname: req.user.fullname, granted: req.user.granted
	})+";");
});

