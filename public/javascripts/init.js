$(function() {
	var client = nylon.client;
	var core = nylon.require("/javascripts/mesh/petit-core-client");
	var ecoco = nylon.require("/javascripts/mesh/petit-ecoco-client");
	
	var module = [];
	module.push(core.create("#mesh .slide"));
	module.push(ecoco.create());
	
	client.listen("/connect/"+location.pathname.split("/").slice(2,3).pop());
});
