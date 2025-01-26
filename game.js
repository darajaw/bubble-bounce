

const RAD = Math.PI / 180;
const scrn = document.getElementById("canvas");
const sctx = scrn.getContext("2d");
//var scFont = new FontFace("8bit", "url(8bit.ttf)");
scrn.tabIndex = 1;
scrn.addEventListener("click", () => {
  switch (state.curr) {
    case state.getReady:
      state.curr = state.Play;
      SFX.start.play();
      break;
    case state.Play:
      bird.flap();
      break;
    case state.gameOver:
      state.curr = state.getReady;
      bird.speed = 0;
      bird.y = 125;
      pipe.pipes = [];
      UI.score.curr = 0;
      SFX.played = false;
      break;
  }
});

scrn.onkeydown = function keyDown(e) {
  if (e.keyCode == 32 || e.keyCode == 87 || e.keyCode == 38) {
    // Space Key or W key or arrow up
    switch (state.curr) {
      case state.getReady:
        state.curr = state.Play;
        SFX.start.play();
        break;
      case state.Play:
        bird.flap();
        break;
      case state.gameOver:
        state.curr = state.getReady;
        bird.speed = 0;
        bird.y = 125;
        pipe.pipes = [];
        UI.score.curr = 0;
        SFX.played = false;
        break;
    }
  }
};

let frames = 0;
let dx = 2;
const state = {
  curr: 0,
  getReady: 0,
  Play: 1,
  gameOver: 2,
};
const SFX = {
  start: new Audio(),
  flap: new Audio(),
  score: new Audio(),
  hit: new Audio(),
  pop: new Audio(),
  played: false,
};
const gnd = {
  sprite: new Image(),
  x: 0,
  y: 0,
  draw: function () {
    this.y = 308;
    sctx.drawImage(this.sprite, this.x, 305);
  },
  update: function () {
    if (state.curr != state.Play) return;
    this.x -= dx;
    this.x = this.x % (this.sprite.width / 2);
  },
};
const bg = {
  sprite: new Image(),
  x: 0,
  y: 0,
  draw: function () {
    y = parseFloat(scrn.height - this.sprite.height);
    sctx.drawImage(this.sprite, this.x, 149);
  },
};

const topPics = ["img/wood-1.png","img/wood-2.png", "img/wood-3.png", "img/wood-4.png", "img/wood-5.png", "img/wood-6.png"];
const botPics = ["img/wood-1.png","img/wood-2.png", "img/wood-3.png", "img/wood-4.png", "img/wood-5.png", "img/wood-6.png"];

const pipe = {
  top: { sprite: new Image() },
  bot: { sprite: new Image() },
  gap: 170,  // Increase the gap to give the bird more room to pass through
  moved: true,
  pipes: [],  
  draw: function () {
    for (let i = 0; i < this.pipes.length; i++) {
      let p = this.pipes[i];

      let topImage = new Image();
      topImage.src = p.topSprite;      
      sctx.drawImage(topImage, p.x, p.y);
      
      let botImage = new Image();
      botImage.src = p.botSprite;      
      sctx.drawImage(botImage, p.x, p.y + parseFloat(this.top.sprite.height) + this.gap);
    }
  },
  update: function () {
    if (state.curr != state.Play) return;
  
    // Generate a new pipe every 100 frames
    if (frames % 100 == 0) {
      let ranTop = Math.floor(Math.random() * topPics.length); // Randomize the image
      let ranBot = Math.floor(Math.random() * botPics.length); // Randomize the image

      this.pipes.push({
        x: parseFloat(scrn.width),
        y: -200 * Math.min(Math.random() + 1, 1.8) - 10,
        botSprite: botPics[ranBot], // Assign a specific bottom sprite
        topSprite: topPics[ranTop], // Assign a specific top sprite

      });
    }
  
    // Update the position of each pipe
    this.pipes.forEach((pipe) => {
      pipe.x -= 2; // Slightly faster pipes for a bit more challenge
    });
  
    // Remove pipes that move off-screen
    if (this.pipes.length && this.pipes[0].x < -this.top.sprite.width) {
      this.pipes.shift();
      this.moved = true;
    }
  },
};

const bird = {
  spriteSheet: new Image(),  // Load the sprite sheet
  spriteWidth: 34,           // New width of the sprite (adjusted)
  spriteHeight: 34,          // New height of the sprite (adjusted)
  rotatation: 0,
  x: 50,
  y: 125,
  speed: 0,
  gravity: 0.1,             // Gravity to simulate bubble floating upwards
  thrust: 6.0,              // Thrust to simulate bubble rising
  drag: 0.98,               // Smooth upward float
  frame: 0,                 // Frame (only one frame here, but needed for consistency)
  groundAnim: {
    frames: [],
    frameCount: 7,
    currentFrame: 0,
    playing: false
  },
  draw: function () {
    // If the game is over and the animation is playing...
    if (state.curr === state.gameOver && this.groundAnim.playing) {
      // Use the current frame from groundAnim.frames
      const frameIdx = this.groundAnim.currentFrame;
      const imgFrame = this.groundAnim.frames[frameIdx];

      sctx.save();
      sctx.translate(this.x, this.y);
      // If you want rotation, keep this line:
      sctx.rotate(this.rotatation * RAD);

      // Draw the chosen PNG, centered on the bird’s position
      sctx.drawImage(
        imgFrame, 
        -imgFrame.width / 2, 
        -imgFrame.height / 2
      );
      sctx.restore();

    } else {
      // Otherwise, draw the normal bird sprite
      let h = this.spriteHeight;
      let w = this.spriteWidth;
      sctx.save();
      sctx.translate(this.x, this.y);
      sctx.rotate(this.rotatation * RAD);
      sctx.drawImage(
        this.spriteSheet,
        0, 0,
        w, h,
        -w / 2, -h / 2,
        w, h
      );
      sctx.restore();
    }
  },
  update: function () {
    let r = parseFloat(this.spriteWidth) / 2;  // Calculate radius for collision detection
    switch (state.curr) {
      case state.getReady:
          bird.spriteSheet.src = "img/bubble/bubble_pop_frame_01.png"; // Path to the bubble PNGbird.animations[2].sprite.src = "img/bird/b2.png";

        this.rotatation = 0;
        this.y += frames % 10 == 0 ? Math.sin(frames * RAD) : 0;
        break;
      case state.Play:
        this.y += this.speed;        // Update y position based on speed
        this.setRotation();          // Set rotation based on speed
        this.speed -= this.gravity;  // Apply gravity to slow the upward motion
        this.speed *= this.drag;     // Apply drag for smooth movement
        if (this.y + r >= gnd.y || this.collisioned()) {
          if (this.y + r >= gnd.y) {
            if (!SFX.played) {
              SFX.pop.play();
              SFX.played = true;
            }

            if(!this.groundAnim.playing){
              this.groundAnim.playing = true;
              this.groundAnim.currentFrame = 0;
            }
          } 

          state.curr = state.gameOver;
        }
        break;
      case state.gameOver:
        this.frame = 1;
        if (this.y + r < gnd.y) {
          this.y += this.speed;
          this.setRotation();
          this.speed -= this.gravity * 2; // Fall faster after game over
        } else {
          this.speed = 0;
          this.y = gnd.y - r;

          if(this.groundAnim.playing){
            if(frames % 4 === 0){
              this.groundAnim.currentFrame++;

              if(this.groundAnim.currentFrame >= this.groundAnim.frameCount){
                bird.spriteSheet.src = ""; // Path to the bubble PNGbird.animations[2].sprite.src = "img/bird/b2.png";

                this.groundAnim.playing = false
              }
            }
          }
        }
        break;

    }
  },
  flap: function () {
    if (this.y > 0) {
      SFX.flap.play();
      this.speed = this.thrust; // Apply upward thrust for the bubble
    }
  },
  setRotation: function () {
    // Adjust rotation based on speed to simulate tilting
    if (this.speed <= 0) {
      this.rotatation = Math.max(-15, (-25 * this.speed) / (-1 * this.thrust));
    } else if (this.speed > 0) {
      this.rotatation = Math.min(15, (15 * this.speed) / (this.thrust * 2)); // Limit upwards rotation
    }
  },
  collisioned: function () {
    if (!pipe.pipes.length) return;
    gnd.y = 500
    let r = this.spriteHeight / 4 + this.spriteWidth / 4; // Radius of the bird (adjusted)
    let x = pipe.pipes[0].x;
    let y = pipe.pipes[0].y;
    let roof = y + parseFloat(pipe.top.sprite.height);
    let floor = roof + pipe.gap;
    let w = parseFloat(pipe.top.sprite.width);
    if (this.x + r >= x) {
      if (this.x + r < x + w) {
        if (this.y - r <= roof || this.y + r >= floor) {
          SFX.hit.play();
          return true;
        }
      } else if (pipe.moved) {
        UI.score.curr++;
        SFX.score.play();
        pipe.moved = false;
      }
    }
  },
};
const UI = {
  getReady: { sprite: new Image() },
  gameOver: { sprite: new Image() },
  tap: [{ sprite: new Image() }, { sprite: new Image() }],
  score: {
    curr: 0,
    best: 0,
  },
  x: 0,
  y: 0,
  tx: 0,
  ty: 0,
  frame: 0,
  draw: function () {
    switch (state.curr) {
      //Draw the get ready screen
      case state.getReady:
        this.y = parseFloat(scrn.height - this.getReady.sprite.height) / 2;
        this.x = parseFloat(scrn.width - this.getReady.sprite.width) / 2;
        this.tx = parseFloat(scrn.width - this.tap[0].sprite.width) / 2;
        this.ty =
          this.y + this.getReady.sprite.height - this.tap[0].sprite.height;
        sctx.drawImage(this.getReady.sprite, this.x, this.y);
        sctx.drawImage(this.tap[this.frame].sprite, this.tx, this.ty);
        break;
      
      //Draw the game over screen
      case state.gameOver:
        this.y = parseFloat(scrn.height - this.gameOver.sprite.height) / 2;
        this.x = parseFloat(scrn.width - this.gameOver.sprite.width) / 2;
        this.tx = parseFloat(scrn.width - this.tap[0].sprite.width) / 2;
        this.ty =
          this.y + this.gameOver.sprite.height - this.tap[0].sprite.height;
        sctx.drawImage(this.gameOver.sprite, this.x, this.y - 10);
        sctx.drawImage(this.tap[this.frame].sprite, this.tx + 3, this.ty + 15);
        break;
    }
    this.drawScore();
  },
  drawScore: function () {
    sctx.fillStyle = "#FFFFFF";
    sctx.strokeStyle = "#000000";
    switch (state.curr) {

      //Draw the current score when playing
      case state.Play:
        sctx.lineWidth = "2";
        sctx.font = "35px scFont";
        sctx.fillText(this.score.curr, scrn.width / 2 - 5, 50);
        sctx.strokeText(this.score.curr, scrn.width / 2 - 5, 50);
        break;

      //Draw the final score and best score when game over
      case state.gameOver:
        sctx.font = "40px goFont";

        sctx.fillStyle = "#445ae8"; 
        sctx.strokeStyle = "black";      
        sctx.fillText("GAME OVER", scrn.width/2 - 110, scrn.height / 2 - 60);
        sctx.strokeText("GAME OVER", scrn.width/2 - 110, scrn.height / 2 - 60);
        sctx.font = "26px scFont";

        sctx.fillStyle = "#445AE8";
        sctx.strokeStyle = "black";        
        let finalScore = `SCORE - ${this.score.curr}`;
        let bestScore = `BEST - ${this.score.best}`;

        try {
          this.score.best = Math.max(
            this.score.curr,
            localStorage.getItem("best")
          );
          localStorage.setItem("best", this.score.best);
          let bestScore = `BEST - ${this.score.best}`;
          sctx.fillText(finalScore, scrn.width/2 - 60, scrn.height / 2 - 10);
          sctx.strokeText(finalScore, scrn.width/2 - 60, scrn.height / 2 - 10);          
          sctx.fillText(bestScore, scrn.width/2 - 60, scrn.height / 2 + 30);
          sctx.strokeText(bestScore, scrn.width/2 - 60, scrn.height / 2 + 30);          
        } catch (e) {
         //sctx.strokeText(finalScore, scrn.width/2 - 70, scrn.height / 2 + 6);
          sctx.fillText(finalScore, scrn.width/2 - 70, scrn.height / 2 + 6);
        } 

        break;
    }
  },
  update: function () {
    if (state.curr == state.Play) return;
    this.frame += frames % 10 == 0 ? 1 : 0;
    this.frame = this.frame % this.tap.length;
  },
};


gnd.sprite.src = "img/ground.png";
bg.sprite.src = "img/BG.png";
pipe.top.sprite.src = "img/wood-1.png";
pipe.bot.sprite.src = "img/wood-1.png";
UI.gameOver.sprite.src = "img/game-over.png";
UI.getReady.sprite.src = "";
UI.tap[0].sprite.src = "img/tap/t0.png";
UI.tap[1].sprite.src = "img/tap/t1.png";
SFX.start.src = "sfx/sfx_START.mp3";
SFX.flap.src = "sfx/sfx_BOUNCE.mp3";
SFX.score.src = "sfx/sfx_SCORE.mp3";
SFX.hit.src = "sfx/sfx_HIT.mp3";
SFX.pop.src = "sfx/sfx_POP.mp3";
// Load the single image for the bubble
bird.spriteSheet.src = "img/bubble/bubble_pop_frame_01.png"; // Path to the bubble PNGbird.animations[2].sprite.src = "img/bird/b2.png";

for(let i = 1; i<=7; i++){
  const img = new Image();
  img.src = `img/bubble/bubble_pop_frame_0${i}.png`
  bird.groundAnim.frames.push(img);
}
const img = new Image();
img.src = "";
bird.groundAnim.frames.push(img);
function gameLoop() {
  update();
  draw();  
  frames++;
}

function update() {
  bird.update();
  gnd.update();
  pipe.update();
  UI.update();
}

function draw() {
  sctx.fillStyle = "#1B8C68";
  sctx.fillRect(0, 0, scrn.width, scrn.height);
  bg.draw();  
  pipe.draw();  
  bird.draw();
  gnd.draw();
  UI.draw();
}

setInterval(gameLoop, 20);
