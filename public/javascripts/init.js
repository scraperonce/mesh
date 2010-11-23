$(function() {
	var client = nylon.client;
	var core = nylon.require("/javascripts/mesh/petit-core");
	
	var module = [];
	module.push(core.create("#mesh .slide"));
	
	client.listen("/connect/"+location.pathname.split("/").slice(2,3).pop());
});
