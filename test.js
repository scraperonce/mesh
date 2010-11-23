var express = require("express");
var app = express.createServer();

app.configure(function() {
	app.use(express.logger());
	app.use(express.bodyDecoder());
});

app.get("/:id?", function(req, res) {
	res.send(200);

	console.log(req);
});

app.listen(3601);
