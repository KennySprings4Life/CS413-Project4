
//Author- Ryan Ladwig
//June 3, 2016
//Used:
//pixi.js
//pixi-audio.js
//tweenjs.min.js
//Wanted to use:
//State machine Library

var stageWidth = 32*8;
var stageHeight = 32*8;
var stageScale = 2;
var DIM = 16;	//My plots are supposed to be 16*16

var gameport = document.getElementById("gameport");
var renderer = PIXI.autoDetectRenderer(stageWidth, stageHeight, {backgroundColor: 0xfe00fe0});
gameport.appendChild(renderer.view);

var stage = new PIXI.Container();
stage.scale.x = stageScale;
stage.scale.y = stageScale;

//Useful variables and such
var player;
var trophy;
var ready = true;
var world;
var bricks;
var farmland;
var dirt;
PIXI.loader
	.add("map_json", "map.json")
	.add("tileset", "map.png")
	.add("assets.json")
	/* .add("shortenedTheme.wav") */
	.load(loadScreen);

var movingDown = [];
var movingSideways = [];
var movingUp = [];


function loadScreen(){
	//load the map
	var tileUtil = new TileUtilities(PIXI);
	world = tileUtil.makeTiledWorld("map_json", "map.png");
	stage.addChild(world);
	
	for(var i=1; i<=4; i++){
		movingDown.push(PIXI.Texture.fromFrame("walkingGoblin-front"+i+".png"));
	}
	for(var i=1; i<=4; i++){
		movingUp.push(PIXI.Texture.fromFrame("walkingGoblin-back"+i+".png"));
	}
	for(var i=1; i<=4; i++){
		movingSideways.push(PIXI.Texture.fromFrame("walkingGoblin"+i+".png"));
	}
	
	player = new PIXI.extras.MovieClip(movingSideways); 
	player.animationSpeed = 0.1;
	player.gx = 7; 
	player.gy = 3;
	player.x = player.gx*DIM;
	player.y = player.gy*DIM;
	
	player.anchor.x = 0;
	player.anchor.y = 1.0;
	player.direction = "none";
	player.moving = false;
	player.play();
	stage.addChild(player);
	
	bricks = world.getObject("Over").data;
	dirt = world.getObject("Dirt").data;
	farmland = world.getObject("Farmland").data;
	
}
function move() {
	ready = false;
	if(player.direction == "none"){
		player.moving = false;
		//console.log(player.y);
		ready = true;
		return;
	}
	player.moving = true;
	console.log("move");
	
	var dx = 0;
	var dy = 0;
	
	if (player.direction == "left") dx -= 1;
	
	if (player.direction == "right") dx += 1;
	if (player.direction == "up"){
		//player.texture = movingUp;
		dy -= 1;
	} 
	if (player.direction == "down") dy += 1;
	
	if (bricks[(player.gy+dy-1)*32 + (player.gx+dx)] != 0){
		player.moving = false;
		ready = true;
		return;
	}
	
	player.gx += dx;
	player.gy += dy;
	
	player.moving = true;
	
	createjs.Tween.get(player).to({x: player.gx*DIM, y: player.gy*DIM}, 250).call(move);
	
	ready = true;
}

var playingField = new PIXI.Container();
var mainMenu = new PIXI.Container();
var credits = new PIXI.Container();
var manual = new PIXI.Container();
var gameOver = new PIXI.Container();


window.addEventListener("keydown", 
	function (e) {
	  e.preventDefault();
	  if (!player) return;
	  if (player.moving) return;
	  if (e.repeat == true) return;
	  
	  player.direction = "none";

	  if (e.keyCode == 87)
		player.direction = "up";
	  else if (e.keyCode == 83)
		player.direction = "down";
	  else if (e.keyCode == 65)
		player.direction = "left";
	  else if (e.keyCode == 68)
		player.direction = "right";

	  console.log(e.keyCode);
	  move();
	});

window.addEventListener("keyup", function onKeyUp(e) {
  e.preventDefault();
  if (!player) return;
  player.direction = "none";
});

function animate() {
	requestAnimationFrame(animate);
	updateCamera();
	renderer.render(stage);
}

function updateCamera(){
	
	if(player != undefined){
		stage.x = -(player.x*stageScale) + stageWidth/2 - player.width/2*stageScale;
		stage.y = -player.y*stageScale + stageHeight/2 + player.height/2*stageScale;
		stage.x = -Math.max(0, Math.min(world.worldWidth*stageScale - stageWidth, -stage.x));
		stage.y = -Math.max(0, Math.min(world.worldHeight*stageScale - stageHeight, -stage.y));
	
	}
	
}

animate();