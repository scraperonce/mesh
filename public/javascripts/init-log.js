$(function() {
	var client = nylon.client;
	//var core = nylon.require("/javascripts/mesh/petit-core-client");
	var slide = nylon.require("/javascripts/mesh/slide-client");
	var ecoco = nylon.require("/javascripts/mesh/petit-ecoco-client");
	var playback = nylon.require("/javascripts/mesh/playback-client");
	
	var module = [];
	m//odule.push(core.create("#mesh .slide"));
	module.push(slide.create("#mesh .slide"));
	module.push(ecoco.create());
	module.push(playback.create());
	
	client.listen(location.pathname+"/connect");
});
