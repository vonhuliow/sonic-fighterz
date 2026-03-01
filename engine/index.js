diff --git a/engine/index.js b/engine/index.js
index 1edac377170ae133c01b1dc4f0c297d846b1a7fe..b975b9d62255ca33252427c754ed0c45a20036d1 100644
--- a/engine/index.js
+++ b/engine/index.js
@@ -6,50 +6,52 @@
 ///////////////////////////////////////////////////////////
 
 // get the main canvas element, and its context
 var canvi = document.getElementById("myCanvas");
 var c = canvi.getContext("2d");
 
 // do some basic canvas configuration
 canvi.style.position = "absolute";
 canvi.style.top = "0px";
 canvi.style.left = "0px";
 canvi.style.border = "1px solid black";
 canvi.style.zIndex = "2";
 
 // create an additional canvas for motion blur effects, and get the context
 var mBlurCanvi = document.createElement("canvas"); 
 var mBlurCtx = mBlurCanvi.getContext("2d");
 
 
 // attempt to load custom contols from local storage, if not found load default controls:
 var leftKey = configuration.lKey;
 var rightKey = configuration.rKey;
 var upKey = configuration.upKey;
 var downKey = configuration.dKey;
 var jumpKey = configuration.jKey;
 var startKey = configuration.startKey;
+var attackKey = 83; // S
+var powerKey = 68; // D
 
 // initialize the motion blur toggle configuration
 var motionBlurToggle = configuration.mBlurDefault;
 var pMotionBlurToggle = configuration.mBlurDefault;
 
 
 // instantiate the main background music element
 var backgroundMusic = document.createElement("audio");
 backgroundMusic.muted = true;
 
 // when the background music loads, remove it from the loading list
 backgroundMusic.onload = ((event) => {
 	if (loadingList.includes(event.target)) {
 		loadingList.splice(loadingList.indexOf(event.target));
 	}
 	backgroundMusic.muted = false;
 });
 // when the background music starts loading, push it into the loading list
 backgroundMusic.onloadstart = function (event) { 
 	if (!loadingList.includes(event.target)) { 
 		loadingList.push(event.target) 
 	} 
 };
 
 // this function will configure and start playing the background music
@@ -158,50 +160,54 @@ var char = {
 	x: 100,
 	y: 384,
 	startX: 128,
 	startY: 168,
 	Gv: 0,//ground velocity. The sign is used for direction
 	xv: 0,//x-velocity
 	yv: 0,//y-velocity
 	grounded: false,
 	frameIndex: 0,
 	currentAnim: anim.stand,  //reminder: this is an array of coordinates, not actual images.  These coordinates will be used for other calculations later
 	animSpeed: 1,
 	rolling: false,
 	angle: 0,
 	state: 0, // -1=air state; 0=ground state; 1=right wall state; 2=ceiling state; 3=left wall state;
 	golock: 0, //forces player to go in a certain direction for a certain amount of time
 	goingLeft: false,
 	spindashCharge: 0,
 	jumpState: 0,// 0 = fell/walked off a cliff; 1 = jump; 2 = hurt; 3 = spring;
 	hurt: false,
 	rings: 0,
 	homing: true,
 	pHoming: false,
 	jumpReleased: false, //makes sure that you don't homing attack by just holding down jump
 	layer: 0,
 	pAngle: 0,
+	attackTimer: 0,
+	attackCooldown: 0,
+	secondaryAttackTimer: 0,
+	secondaryAttackCooldown: 0,
 	deathTimer:0,
 	deathFade:0,
 	//constants (only change if you know what you are doing)
 	ACC: 0.046875,	// acceleration
 	DEC: 0.5,		// deceleration
 	FRC: 0.046875,	// friction
 	TOP: 6,			// top speed (pixels/frame)
 	JMP: 6.5,		// jump speed
 	GRV: 0.21875,	// gravity
 };
 
 // relevant character data for Sonic the Hedgehog
 var sonic = {
 	// sonic's sprite sheet
 	spriteSheet: newImage("SonicSheet2.png"),
 	// sonic's animation data
 	anim: {
 		stand: grabAnim(0, 0, 40, 40, 1),
 		jog: grabAnim(0, 40, 40, 40, 8),
 		run: grabAnim(0, 80, 40, 40, 4),
 		jump: grabAnim(0, 316, 31, 31, 8),
 		dropDash: grabAnim(31, 316, 31, 31, 1),
 		skid: grabAnim(40, 203, 40, 40, 1),
 		death: grabAnim(80, 203, 40, 40, 1),
 		crouch: grabAnim(40, 243, 40, 40, 1),
@@ -301,80 +307,87 @@ var shadow = {
 		ACC: 0.046875,	// acceleration
 		DEC: 0.5,		// deceleration
 		FRC: 0.046875,	// friction
 		TOP: 5.5,		// top speed (pixels/frame)
 		JMP: 6.5,		// jump speed
 		GRV: 0.21875,	// gravity
 	}
 };
 
 var silver = {
 	// Silver's sprite sheet
 	spriteSheet: newImage("silversheet2.png"),
 	// Silver's animation data
 	anim: {
 		stand: grabAnim(0, 0, 30, 48, 1),
 		jog: grabAnim(0, 48, 40, 41, 6),
 		run: grabAnim(0, 89, 44, 44, 4),
 		jump: grabAnim(0, 328, 32, 32, 8),
 		skid: grabAnim(40, 221, 41, 41, 1),
 		death: grabAnim(80, 221, 41, 41, 1),
 		crouch: grabAnim(0, 261, 35, 35, 1),
 		spindash: grabAnim(0, 296, 30, 27, 5),
 		push: grabAnim(0, 179, 35, 41, 4),
 		hurt: grabAnim(0, 223, 40, 35, 1),
 		sprung: grabAnim(0, 133, 45, 45, 1),
-		levi: grabAnim(115, 221, 29, 48, 1)
+		levi: grabAnim(115, 221, 29, 48, 1),
+		attack: grabAnim(18, 225, 80, 96, 4),
+		dashAttack: grabAnim(334, 225, 80, 96, 4),
+		power: grabAnim(339, 765, 120, 90, 3)
 	},
 	// Silver's default character data
 	char: {
 		x: 100,
 		y: 384,
 		startX: 128,
 		startY: 168,
 		Gv: 0.001,//ground velocity. The sign is used for direction
 		xv: 0,//x-velocity
 		yv: 0,//y-velocity
 		grounded: false,
 		frameIndex: 0,
 		currentAnim: anim.jump,
 		animSpeed: 1,
 		rolling: false,
 		angle: 0,
 		state: -1, // -1=air state; 0=ground state; 1=right wall state; 2=ceiling state; 3=left wall state;
 		golock: 0, //forces player to go in a certain direction for a certain amount of time
 		goingLeft: false,
 		spindashCharge: 0,
 		jumpState: 0,// 0 = fell/walked off a cliff; 1 = jump; 2 = hurt; 3 = spring;
 		hurt: false,
 		rings: 0,
 		homing: false,
 		pHoming: false,
 		levitate: true,
 		levTimer: 0,
 		layer: 0,
 		pAngle: 0,
+		attackTimer: 0,
+		attackCooldown: 0,
+		secondaryAttackTimer: 0,
+		secondaryAttackCooldown: 0,
 		invincible: 0,
 		deathTimer:0,
 		deathFade:0,
 		//constants (only change if you know what you are doing)
 		ACC: 0.039875,	// acceleration
 		DEC: 0.5,		// deceleration
 		FRC: 0.046875,	// friction
 		TOP: 5.5,		// top speed (pixels/frame)
 		JMP: 6.5,		// jump speed
 		GRV: 0.21875,	// gravity
 	}
 };
 
 // set the default animation for all characters (we can't access the anim 
 // properties until the objects are actually defined)
 sonic.char.currentAnim = sonic.anim.jump;
 shadow.char.currentAnim = shadow.anim.jump;
 silver.char.currentAnim = silver.anim.jump;
 
 // a quick function to set the current character, given a character object
 function setChar(newChar) {
 	char = newChar.char;
 	anim = newChar.anim;
 	sonicImage = newChar.spriteSheet;
 }
@@ -432,50 +445,76 @@ debugInterface.style.bottom = "0";
 debugInterface.style.left = "0";
 debugInterface.style.width = "25vw";
 debugInterface.style.fontFamily = "monospace";
 document.body.appendChild(debugInterface)
 
 function loader() {
 	var img = chunkBacklog.shift();
 	chunks[chunks.length] = autoChunk(img);
 	// if(chunkBacklog.length > 0){
 	// 	window.requestAnimationFrame(loader());
 	// }
 }
 
 //window.requestAnimationFrame(loop);
 var gameStarted = false;
 var startGame = function () {
 	//window.setInterval(loop,17);
 	window.setTimeout(loop, 17);
 	clickToStart.remove();
 	size(0);
 	// fullscreen();
 	gameStarted = true;
 }
 
 function controls() {
+	if (char.attackTimer > 0) {
+		char.attackTimer -= fpsFactor;
+	}
+	if (char.attackCooldown > 0) {
+		char.attackCooldown -= fpsFactor;
+	}
+	if (char.secondaryAttackTimer > 0) {
+		char.secondaryAttackTimer -= fpsFactor;
+	}
+	if (char.secondaryAttackCooldown > 0) {
+		char.secondaryAttackCooldown -= fpsFactor;
+	}
+
+	if (char.attackTimer <= 0 && char.secondaryAttackTimer <= 0) {
+		if (char.attackTimer < 0) {
+			char.attackTimer = 0;
+		}
+		if (char.secondaryAttackTimer < 0) {
+			char.secondaryAttackTimer = 0;
+		}
+	}
+
+	if (char.attackTimer > 0 || char.secondaryAttackTimer > 0) {
+		char.rolling = false;
+	}
+
 	//debugging camera. First so it can suppress movement keys
 	if (keysDown[86] && devMode) {
 		if (keysDown[leftKey]) {
 			debug.camX += 8;
 			if (keysDown[16]) {
 				debug.camX += 8;
 			}
 		}
 		if (keysDown[upKey]) {
 			debug.camY += 8;
 			if (keysDown[16]) {
 				debug.camY += 8;
 			}
 		}
 		if (keysDown[rightKey]) {
 			debug.camX -= 8;
 			if (keysDown[16]) {
 				debug.camX -= 8;
 			}
 		}
 		if (keysDown[downKey]) {
 			debug.camY -= 8;
 			if (keysDown[16]) {
 				debug.camY -= 8;
 			}
@@ -657,50 +696,59 @@ function controls() {
 		// 	char.golock = 0;
 		// }
 	}
 
 	if (char.state == -1 && char.jumpState != 2) { // air movement
 		if (!(keysDown[86] && devMode) && keysDown[rightKey]) {
 			char.goingLeft = false;
 			if (char.Gv < char.TOP) {
 				char.Gv += char.ACC * 2;
 				if (char.Gv > char.TOP) { char.Gv = char.TOP; }
 			}
 		}
 		if (!(keysDown[86] && devMode) && keysDown[leftKey]) {
 			char.goingLeft = true;
 			if (char.Gv > -char.TOP) {
 				char.Gv -= char.ACC * 2;
 				if (char.Gv < -char.TOP) { char.Gv = -char.TOP; }
 			}
 		}
 	}
 
 	if (keysDown[jumpKey] == true && char.pDropDash == true && char.state == -1) { // charge the drop dash
 		char.dropCharge += 1;
 	}
 
+	if (char.attackTimer > 0) {
+		char.currentAnim = anim.attack || char.currentAnim;
+		char.animSpeed = 0.7;
+	}
+	if (char.secondaryAttackTimer > 0) {
+		char.currentAnim = anim.power || char.currentAnim;
+		char.animSpeed = 0.45;
+	}
+
 	if (keysDown[76] && devMode) {
 		if (!pDevLevelChange) {
 			pDevLevelChange = true;
 			loadNextLevel();
 			resetLevel();
 		}
 	}
 	else {
 		pDevLevelChange = false;
 	}
 
 	if (keysDown[77] && devMode) {
 		if (!pMotionBlurToggle) {
 			pMotionBlurToggle = true;
 			motionBlurToggle = !motionBlurToggle;
 		}
 	}
 	else {
 		pMotionBlurToggle = false;
 	}
 
 	if(keysDown[84]&&devMode){
 		backgroundMusic.load();
 		titleTimer = -70;
 		titleActive = true;
@@ -1812,50 +1860,75 @@ function loop() { // the main game loop
 			{
 				document.body.appendChild(pauseIndicator);
 			}
 		}
 		pausePressed = true;
 	}
 	else {
 		pausePressed = false;
 	}
 	window.setTimeout(loop, 16 - (performance.now() - frameStartTime));
 }
 
 function drawMBlur() {
 	if (motionBlurToggle) { // motion blur (optional)
 		c.globalCompositeOperation = "lighter";
 		c.globalAlpha = "0.9";
 		mBlurCtx.fillStyle = "rgba(2,2,2,0.2)"//"+Math.max(0,Math.min(1,1-(Math.sqrt(char.xv^2+char.yv^2)*2-char.TOP+1))).toString()+")";
 		mBlurCtx.fillRect(0, 0, vScreenW, vScreenH);      // clear motion blur if you aren't moving fast enough
 		c.drawImage(mBlurCanvi, 0, 0);//0.5+Math.floor((char.x+Math.sin(char.angle)*h1/2)-vScreenW/2-(char.xv*2))+cam.x,0.5+(char.y-Math.cos(char.angle)*h1/2)-vScreenH/2-(char.yv*2)+cam.y);
 		c.globalAlpha = "1";
 		c.globalCompositeOperation = "source-over";
 	}
 }
 
 function controlPressed(e) {
+	if (char.attackTimer == undefined) {
+		return;
+	}
+
+	if (e.keyCode == attackKey && char.attackCooldown <= 0) {
+		char.attackTimer = 16;
+		char.attackCooldown = 20;
+		char.currentAnim = char.state == -1 ? (anim.dashAttack || anim.attack || char.currentAnim) : (anim.attack || char.currentAnim);
+		char.animSpeed = 0.6;
+		char.Gv += char.goingLeft ? -2 : 2;
+		if (char.state == -1) {
+			char.yv = Math.min(char.yv, -0.8);
+		}
+		spawn(level, new effect(char.x - 18, char.y - 40, 25, 25, "res/items/speedDash.png", 5));
+	}
+
+	if (e.keyCode == powerKey && char.secondaryAttackCooldown <= 0) {
+		char.secondaryAttackTimer = 22;
+		char.secondaryAttackCooldown = 34;
+		char.currentAnim = anim.power || anim.attack || char.currentAnim;
+		char.animSpeed = 0.35;
+		char.Gv += char.goingLeft ? -1.25 : 1.25;
+		spawn(level, new effect(char.x - 20, char.y - 44, 25, 25, "res/items/speedDash.png", 5));
+	}
+
 	if (char.homing == true && char.state == -1) {
 		if (e.keyCode == 65 && char.pHoming == false && keysDown[jumpKey] == false) { //possible bug, checks keycode against efault jump keyt instead of whatever is saved in config
 			char.pHoming = true;
 			char.currentAnim = anim.jump;
 			char.jumpState = 1;
 			var result = [0, 0, 200];
 			for (var i = 0; i < level[0].length; i++) {
 				if (level[0][i].targetable == true && (level[0][i].x + level[0][i].w / 2 > char.x) == char.goingLeft) {
 					var dist = Math.sqrt(Math.pow((level[0][i].x + level[0][i].w / 2) - char.x, 2) + Math.pow((level[0][i].y + level[0][i].h / 2) - char.y, 2));
 					//console.log("dist:"+dist+" for: "+level[0][i].hrid);
 					if (dist < result[2]) {
 						result = [(level[0][i].x + level[0][i].w / 2), (level[0][i].y + level[0][i].h / 2), dist];
 					}
 				}
 			}
 			if (result[0] != 0) {
 				var speed = Math.sqrt(char.yv ** 2 + char.Gv ** 2);
 				var angle = Math.atan2(result[1] - char.y, result[0] - char.x);
 				char.Gv = Math.max(char.TOP * 2, speed) * Math.cos(angle);
 				char.yv = Math.max(char.TOP * 2, speed) * Math.sin(angle);
 			}
 			else {
 				if (Math.abs(char.Gv) < char.TOP) {
 					// char.Gv += char.goingLeft?char.TOP/2:-char.TOP/2;
 					// if(char.Gv > char.TOP){char.Gv = char.TOP;}
