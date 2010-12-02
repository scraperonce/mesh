$(function() {
	var client = nylon.client;
	var core = nylon.require("/javascripts/mesh/petit-core-client");
	var ecoco = nylon.require("/javascripts/mesh/petit-ecoco-client");
	var playback = nylon.require("/javascripts/mesh/playback-client");
	
	var module = [];
	module.push(core.create("#mesh .slide"));
	module.push(ecoco.create());
	module.push(playback.create());
	
	client.listen(location.pathname+"/connect");
});
