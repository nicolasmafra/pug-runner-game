function start() {
	role.start();
}

// Objects

var gfx = {
	backgroundColor: "#7b057e",
	height: null,
	width: null,
	frames: 0,
	imgs: {},
    objects: [],
	start: function () {
		this.canvas = document.getElementById("game");
		this.context = gfx.canvas.getContext("2d");
		this.context.font = "30px ArialBlack";
		this.width = 900;
		this.height = 500;
		gfx.canvas.width = gfx.width;
		gfx.canvas.height = gfx.height;
		gfx.resize();
		window.addEventListener('resize', gfx.resize, false);
		gfx.loadImgs();
	},
	
	
	resize: function() {
		var containerStyle = window.getComputedStyle(document.getElementById("container"));
		var otherContentStyle = window.getComputedStyle(document.getElementById("other-content"));
		var containerWidth = containerStyle.width.replace("px", "");
		var containerHeight = containerStyle.height.replace("px", "");
		var otherContentHeight = otherContentStyle.height.replace("px", "");
		console.log("screen resized: container=" + containerWidth + " x " + containerHeight + ", other-content-height=" + otherContentHeight);
		
		var availableWidth = containerWidth;
		var availableHeight = containerHeight - otherContentHeight;
		var canvasRatio = gfx.width / gfx.height;
		var screenRatio = availableWidth / availableHeight;
		
		var tagWidth;
		var tagHeight;
		if (screenRatio > canvasRatio) {
			// fit by height
			tagHeight = availableHeight;
			tagWidth = Math.floor(tagHeight * canvasRatio);
		} else {
			// fit by width
			tagWidth = availableWidth;
			tagHeight = Math.floor(tagWidth / canvasRatio);
		}
		document.getElementById("game-content").setAttribute("style", "width:" + tagWidth + "px;height:" + tagHeight + "px");
	},
	
	
	loaded: function() {
		for (var img in gfx.imgs) {
			if (!gfx.imgs[img].complete)
				return false;
		}
		return true;
	},
	draw: function () {
        var o = gfx.objects;
		for (var i = o.length - 1; i >= 0; i--) {
            if (o[i].text != null && o[i].text != undefined) {
                gfx.context.font = "30px ArialBlack";
				gfx.context.fillStyle = o[i].color;
                gfx.context.fillText(o[i].text, o[i].x, o[i].y);
            }
			else if (o[i].img != null && o[i].img != undefined)
				gfx.context.drawImage(gfx.imgs[gfx.animate(o[i].img)],o[i].x+o[i].img.offsetX,o[i].y+o[i].img.offsetY,o[i].width,o[i].height);
            else if (o[i].color != null && o[i].color != undefined) {
				gfx.context.fillStyle = o[i].color;
				gfx.context.fillRect(o[i].x, o[i].y, o[i].width, o[i].height);
			}
		};
	},
	clear : function () {
        gfx.context.clearRect(0, 0, gfx.canvas.width, gfx.canvas.height);
    },
	update: function () {
		gfx.clear();
		gfx.objects.push({color: gfx.backgroundColor, x: 0, y: 0, width: gfx.width, height: gfx.height});
		gfx.draw();
		gfx.frames++;
	},
	animate: function (img) {
		if (img.order == null)
			return img.src;
		var f = Math.floor(gfx.frames/img.time)%img.order.length;
		return img.src + "/" + img.order[f];
	},
	loadImgs: function () {
        gfx.draw([{color: "black",text:"Carregando imagens...",x:gfx.width/2,y:gfx.height/2}]);
		gfx.update();
		gfx.imgs = {
            "Start":{},
			"GameOver":{},
            "Ground":{},
			"Running/0":{},
			"Running/1":{},
			"Running/2":{},
			"Running/3":{},
			"Running/4":{},
			"Running/5":{},
			"Jumping/0":{},
			"Jumping/1":{},
			"Jumping/2":{},
			"Falling/0":{},
			"Falling/1":{},
			"Falling/2":{},
			"Obstacles/0":{},
			"Obstacles/1":{},
			"Obstacles/2":{},
			"Obstacles/3":{},
			"BackGround":{},
			"Bone":{},
		};
		for (var img in gfx.imgs) {
			gfx.imgs[img] = new Image();
			gfx.imgs[img].onload = function(){};
			gfx.imgs[img].src = "img/" + img + ".png";
		}
	}
};

var motor = {
	gravity: 1.0,
	bounce: 0,
    objects: [],
	createPlayer: function () {
		return {
			width: 79,
			height: 62,
			x: 79,
			y: gfx.height - 53 - 62,
			speedX: 0,
			speedY: 0,
			colision: true,
			gravity: true,
			fixed: false,
			jumpSpeed: 15,
			jumps: 0,
			jump: function () {
				if (this.jumps < role.maxJumps) {
					this.speedY = - this.jumpSpeed;
					this.jumps++;
				}
			},
            img: {src:"Running/0", offsetX: 0, offsetY: 0},
            animate: function () {
                if (role.player.jumps == 0)
                    role.player.img = {src:"Running", offsetX: 0, offsetY: 0, time: 2, order:[0,1,2,3,4,5,4,3,2,1]};
                else if (role.player.speedY < 0)
                    role.player.img = {src:"Jumping", offsetX: 0, offsetY: 0, time: 2, order:[0,1,2,1]};
                else if (role.player.speedY > 0)
                    role.player.img = {src:"Falling", offsetX: 0, offsetY: 0, time: 2, order:[0,1,2,1]};
            },
            onGround: function () {
				if (role.player.y >= role.grounds[0].y - role.player.height && role.player.speedY > 0) {
					role.player.y = role.grounds[0].y - role.player.height;
					role.player.speedY = 0;
					return true;
				}
				return false;
            },
		};
	},
    createBone: function () {
        return {
            img: {src:"Bone", offsetX: 0, offsetY: 0},
            width: 50,
            height: 22,
            x: gfx.width,
            y: Math.floor(gfx.height*(Math.random()*0.5+0.25)),
            speedX: 0,
            speedY: 0,
            colision: true,
            gravity: false,
            fixed: false,
        }
    },
    createGround: function () {
        return {
            img: {src:"Ground", offsetX: 0, offsetY: -13},
            width: 900,
            height: 56,
            x: gfx.width,
            y: gfx.height-56+13,
            speedX: 0,
            speedY: 0,
            colision: false,
            gravity: false,
            fixed: true,
        }
    },
    createBackGround: function () {
        return {
            img: {src:"BackGround", offsetX: 0, offsetY: 0},
            width: 1772,
            height: 500,
            x: gfx.width,
            y: 0,
            speedX: 0,
            speedY: 0,
            colision: false,
            gravity: false,
            fixed: true,
        }
    },
	createObstacle: function (v) {
        var r = Math.floor(4 * Math.random());
		var Height = gfx.imgs["Obstacles/" + r].height;
		var Y = role.grounds[0].y-Height;
		return {
            img: {src:"Obstacles/" + r, offsetX: 0, offsetY: 0},
			width: gfx.imgs["Obstacles/" + r].width,
			height: Height,
			x: gfx.width,
			y: Y,
			speedX: -v,
			speedY: 0,
			colision:true,
			gravity:false,
			fixed: true,
		};
	},
	update: function () {
        var o = motor.objects;
		for (var i = o.length - 1; i >= 0; i--) {
			if (o[i].gravity) {
				o[i].speedY += motor.gravity;
                for (var j = 0; j < role.grounds.length; j++) {
				    motor.colision(o[i], role.grounds[j]);
                }
			}
			o[i].x += role.speed() + o[i].speedX;
			o[i].y += o[i].speedY;
            if (o[i].animate != null && o[i].animate != undefined)
                o[i].animate();
		};
	},
	colision: function (a, b) {
		if (!a.colision || !b.colision)
			return false;
		var A = {x: a.x + a.width/2, y: a.y + a.height/2};
		var B = {x: b.x + b.width/2, y: b.y + b.height/2};
		var deltaX = A.x - B.x;
		var deltaY = A.y - B.y;
		var minX = (a.width + b.width)/2;
		var minY = (a.height + b.height)/2;
		if (!(deltaX*deltaX <= minX*minX) || !(deltaY*deltaY <= minY*minY))
			return false;
		if (a.fixed)
			return true;
		if (b.fixed) {
			if (deltaX >= minX - a.width) {
				a.x = b.x + b.width;
				if (a.speedX < b.speedX)
					a.speedX = b.speedX + (b.speedX - a.speedX)*motor.bounce;
			}
			if (deltaX <= - minX + a.width) {
				a.x = b.x - a.width;
				if (a.speedX > b.speedX)
					a.speedX = b.speedX - (a.speedX - b.speedX)*motor.bounce;
			}
			if (deltaY >= minY - a.height) {
				//a.y = b.y + b.height;
				if (a.speedY < b.speedY)
					;//a.speedY = b.speedY + (b.speedY - a.speedY)*motor.bounce;
			}
			if (deltaY <= - minY + a.height) {
				//a.y = b.y - a.height;
				if (a.speedY > b.speedY)
					;//a.speedY = b.speedY - (a.speedY - b.speedY)*motor.bounce;
			}
			if ((a.speedX-b.speedX)*(a.speedX-b.speedX) < 10)
				a.speedX = b.speedX;
			if ((a.speedY-b.speedY)*(a.speedY-b.speedY) < 10)
				a.speedY = b.speedY;
		}
		return true;
	},
};

var ctrl = {
    keysMap: {jump:[32, 'tap'], start:[32, 'tap']},
	keys: [],
	start: function () {
		window.addEventListener("keydown", this.keydown, false);
		window.addEventListener("keyup", this.keyup, false);
		window.addEventListener("touchstart", this.touchstart, false);
		window.addEventListener("touchstop", this.touchstop, false);
	},
	keydown: function (e) {
		if (e.keyCode == 32) {
			e.preventDefault();
		}
		ctrl.keys[e.keyCode] = true;
	},
	keyup: function (e) {
		ctrl.keys[e.keyCode] = false;
	},
	touchstart: function (e) {
        e.preventDefault();
		ctrl.keys['tap'] = true;
	},
	touchstop: function (e) {
		ctrl.keys['tap'] = false;
	},
	check: function(key) {
		for (var i = 0; i < ctrl.keysMap[key].length; i++) {
			if (ctrl.keys[ctrl.keysMap[key][i]]) {
				ctrl.keys[ctrl.keysMap[key][i]] = false;
				return true;
			}
		}
		return false;
	},
};

var role = {
	maxJumps: 4,
	states: {loading: -1, stop: 0, run: 1, lost: 2, losting: 3},
	counter: 0,
    paralaxe: 0.9,
    timeBone: 100,
    timeObstacle: 100,
    score: 0,
    highScore: 0,
	bones: [],
	obstacles: [],
	grounds: [],
	backGrounds: [],
	initSpeed: 6,
	speed: function () {
        return (role.counter>=0)?-role.initSpeed-role.counter/600:-role.initSpeed-role.counter;
    },
	start: function() {
		gfx.start();
		ctrl.start();
		this.state = role.states.loading;
		role.update();
	},
	update: function () {
		switch (role.state) {
			case role.states.loading:
				role.loading();
				break;
			case role.states.stop:
				role.stop();
				break;
			case role.states.run:
				role.run();
				break;
			case role.states.losting:
				role.losting();
				break;
			case role.states.lost:
				role.lost();
				break;
			default:
				console.info("Erro! state = " + role.state);
				role.state = role.states.stop;
				break;
		}
        motor.update();
		gfx.update();
		window.requestAnimationFrame(role.update);
	},
	loading: function() {
		gfx.objects = [{x:350,y:400,text:("Carregando imagens..."),color:"white"}];
        gfx.update();
		if (gfx.loaded())
			this.state = role.states.stop;
	},
	stop: function () {
        gfx.objects = [{x:0,y:0,width:900,height:464,img:{src:"Start", offsetX:0,offsetY:18,order:null}}];
		if (ctrl.check("start")) {
			ctrl.keys[ctrl.keysMap["start"]] = false;
            motor.objects = [];
            gfx.objects = [];
			role.obstacles = [];
            role.grounds = [];
            role.backGrounds = [];
            role.counter = 0;
            role.score = 0;
            gfx.frames = 0;
            
            role.grounds = [motor.createGround()];
            role.grounds[0].x = 0;
            role.backGrounds = [motor.createBackGround()];
            role.backGrounds[0].x = 0;
            role.backGrounds[0].speedX = -role.speed()*role.paralaxe;
			role.player = motor.createPlayer();
            role.player.speedX = -role.speed();
			role.state = role.states.run;
		}
	},
	run: function () {
        role.updateObjects();
		role.counter++;
		if (ctrl.check("jump")) {
			ctrl.keys[ctrl.keysMap["jump"]] = false;
			role.player.jump();
		}
		role.player.speedX = -role.speed() + 0.001*(gfx.width/2 - role.player.x);
        if (role.player.onGround())
        	role.player.jumps = 0;
		for (var i = role.bones.length - 1; i >= 0; i--)
			if (motor.colision(role.player, role.bones[i])) {
                role.score++;
                role.bones.splice(i, 1);
                i = 0;
            }
		for (var i = role.obstacles.length - 1; i >= 0; i--)
			motor.colision(role.player, role.obstacles[i])
		if (role.player.x < -role.player.width || role.player.y > gfx.height) {
			role.state = role.states.losting;
                        if (role.score > role.highScore)
                                role.highScore = role.score;
                }
		role.updateScore();
	},
	losting: function () {
        role.updateObjects();
		role.updateScore();
		role.player.y = 2*gfx.height;
		role.counter = (role.counter > 0)?0:role.counter-0.1;
		if (role.speed() >= 0) {
			role.state = role.states.lost;
		}
	},
	lost: function () {
        gfx.objects = [
                {x:350,y:400,text:("Sua pontuação: " + role.score),color:"white"},
                {x:300,y:30,text:("Pontuação Máxima: " + role.highScore),color:"white"},
                {x:0,y:0,width:900,height:464,img:{src:"GameOver", offsetX:0,offsetY:18,order:null}}]
        gfx.update();
		if (ctrl.check("start")) {
			ctrl.keys[ctrl.keysMap["start"]] = false;
			role.state = role.states.stop;
		}
	},
    updateObjects: function () {
		gfx.objects = [role.player];
		motor.objects = [role.player];
        // update bones
        if (role.counter >= 0 && (role.counter+role.timeBone/2)%role.timeBone == 0)
			role.bones.push(motor.createBone(0));
		if (role.bones.length > 0 && role.bones[0].x < -3*role.bones[0].width)
			role.bones.shift();
        for (var i = role.bones.length - 1; i >= 0; i--) {
			gfx.objects.push(role.bones[i]);
			motor.objects.push(role.bones[i]);
        }
        // update obstacles
		if (role.counter >= 0 && role.counter%role.timeObstacle == 0)
			role.obstacles.push(motor.createObstacle(0));
		if (role.obstacles.length > 0 && role.obstacles[0].x < -3*role.obstacles[0].width)
			role.obstacles.shift();
        for (var i = role.obstacles.length - 1; i >= 0; i--) {
			gfx.objects.push(role.obstacles[i]);
			motor.objects.push(role.obstacles[i]);
        }
        // update grounds
        if (role.grounds[role.grounds.length - 1].x <= gfx.width - role.grounds[0].width + 10)
            role.grounds.push(motor.createGround());
        if (role.grounds[0].x < -role.grounds[0].width)
            role.grounds.shift();
		for (var i = 0; i < role.grounds.length; i++) {
			gfx.objects.push(role.grounds[i]);
			motor.objects.push(role.grounds[i]);
		}
        // update backGrounds
        if (role.backGrounds[role.backGrounds.length - 1].x <= gfx.width - role.backGrounds[0].width + 10) {
            role.backGrounds.push(motor.createBackGround());
            role.backGrounds[role.backGrounds.length - 1].speedX = -role.speed()*role.paralaxe;
        }
        if (role.backGrounds[0].x < -role.backGrounds[0].width)
            role.backGrounds.shift();
		for (var i = 0; i < role.backGrounds.length; i++) {
			gfx.objects.push(role.backGrounds[i]);
			motor.objects.push(role.backGrounds[i]);
            role.backGrounds[i].speedX = -role.speed()*role.paralaxe;
		}
	},
	updateScore: function() {
        gfx.objects.unshift({x:50,y:50,text:("Pontuação: " + role.score),color:"black"});
	}
};

var db = {

};