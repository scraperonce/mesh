/*!
 * MeSH starter
 */
var app = require("./init");
 
MESH_PORT = 2525;
 
// Only listen on $ node app.js

if (!module.parent) {
	app.listen(MESH_PORT);
	console.log("Express server listening on port %d", app.address().port)
}
