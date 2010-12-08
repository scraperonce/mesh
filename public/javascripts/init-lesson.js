$(function() {
	var client = nylon.client;
	//var core = nylon.require("/javascripts/mesh/petit-core-client");
	var slide = nylon.require("/javascripts/mesh/slide-client");
	var ecoco = nylon.require("/javascripts/mesh/petit-ecoco-client");
	
	var module = [];
	//module.push(core.create("#mesh .slide"));
	module.push(slide.create("#mesh .slide"));
	module.push(ecoco.create());
	
	client.listen(location.pathname+"/connect");
});
