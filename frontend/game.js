// Minimal Phaser 3 game implementing JumpQuiz mechanics (question block, pipes yes/no)
const API_BASE = 'http://127.0.0.1:8000/api';  // assumes backend served on same host & port

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 460,
  parent: 'game-container',
   transparent: true,
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 1000 }, debug: true, }

  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

function preload() {
  this.load.image('bg', 'https://t4.ftcdn.net/jpg/09/11/68/91/360_F_911689184_UJ79OnnEaIz75Eo9bOXR6FuwwVL818gi.jpg');
  this.load.image('ground', 'assets/sprites/ground.png');
  this.load.image('block', 'assets/sprites/block.png');
  this.load.image('star', 'assets/sprites/star.png');
  this.load.image('player', 'assets/sprites/player.png');
  this.load.image('pipe_yes', 'assets/sprites/pipe_green.png');
  this.load.image('pipe_no', 'assets/sprites/pipe_red.png');
}



let game = new Phaser.Game(config);
let player, cursors, platforms, questionBlock, hud;
let score = 0;
let asking = false;
let currentQuestion = null;
let yesPipe, noPipe;



function create() {
  // world
  platforms = this.physics.add.staticGroup();
  platforms.create(400, 434, 'ground').refreshBody();

  // block with question
  questionBlock = this.physics.add.staticSprite(400, 200, 'block');
  questionBlock.setData('isQuestion', true);

  // pipes (hidden initially)
  yesPipe = this.physics.add.staticSprite(300, 370, 'pipe_yes').setVisible(false);
  noPipe = this.physics.add.staticSprite(500, 370, 'pipe_no').setVisible(false);

  // player
  player = this.physics.add.sprite(100, 500, 'player');
  player.setAngularVelocity(0);
  player.setAngularAcceleration(0);
  player.setMaxVelocity(500, 1000);
  player.setOrigin(2.0, 4.8);
  player.setBounce(0.1);
  player.setCollideWorldBounds(true);
  



  this.physics.add.collider(player, platforms);
  this.physics.add.collider(player, questionBlock, onHitBlock, null, this);

  cursors = this.input.keyboard.createCursorKeys();


  
  this.input.on('pointerdown', () => {
    if (player.body.touching.down) player.setVelocityY(-450);
  });

  // HUD reference
  hud = document.getElementById('hud');
  updateHud();

}

function update(time, delta) {
  if (cursors.left.isDown) {
  player.setVelocityX(-160);
   player.flipX = true;
} else if (cursors.right.isDown) {
  player.setVelocityX(160);
   player.flipX = false;
} else {
  player.setVelocityX(0);
}
if ((cursors.up.isDown || cursors.space.isDown) && player.body.blocked.down) {
  player.setVelocityY(-470);
}
player.setRotation(0);
player.angle = 0;
  

  // simple collision with pipes selects answer
  if (asking && Phaser.Geom.Intersects.RectangleToRectangle(player.getBounds(), yesPipe.getBounds())) {
    submitAnswer(true);
  } else if (asking && Phaser.Geom.Intersects.RectangleToRectangle(player.getBounds(), noPipe.getBounds())) {
    submitAnswer(false);
  }

  
}

function onHitBlock(playerObj, block) {
  if (asking) return;
  // fetch question via API
  fetch(API_BASE + '/random-question/').then(r => r.json()).then(data => {
    if (data.error) {
      alert('No questions available in backend.');
      return;
    }
    currentQuestion = data;
    asking = true;
    // show pipes and question overlay
    yesPipe.setVisible(true);
    noPipe.setVisible(true);
    showQuestionOverlay(currentQuestion.text);
  }).catch(err => {
    console.error(err);
    alert('Failed to fetch question from backend. Make sure backend is running and /api/random-question/ is available.');
  });
}

function showQuestionOverlay(text) {
  const overlay = document.createElement('div');
  overlay.id = 'question-overlay';
  overlay.style.position = 'absolute';
  overlay.style.left = '50%';
  overlay.style.top = '10%';
  overlay.style.transform = 'translateX(-50%)';
  overlay.style.background = 'rgba(0,0,0,0.75)';
  overlay.style.color = 'white';
  overlay.style.padding = '12px 18px';
  overlay.style.borderRadius = '8px';
  overlay.style.maxWidth = '700px';
  overlay.style.textAlign = 'center';
  overlay.style.fontWeight = 'bold';
  overlay.style.zIndex = 999;
  overlay.innerText = text + '\n\nJump into the GREEN pipe for YES, RED pipe for NO';
  document.body.appendChild(overlay);
}

function hideQuestionOverlay() {
  const el = document.getElementById('question-overlay');
  if (el) el.remove();
}

function submitAnswer(answer) {
  hideQuestionOverlay();
  asking = false;
  yesPipe.setVisible(false);
  noPipe.setVisible(false);

  if (!currentQuestion) return;
  const correct = (answer === Boolean(currentQuestion.answer));
  if (correct) {
    // award points and small animation (star)
    score += 10;
    spawnStar();
  } else {
    // death screen (simple alert and reset score)
    alert('Wrong answer! Game over.');
    score = 0;
  }
  updateHud();
  currentQuestion = null;
}

function spawnStar() {
  const scene = game.scene.scenes[0];
  const star = scene.physics.add.image(player.x, player.y - 40, 'star');
  star.setVelocityY(-300);
  star.setGravityY(400);
  setTimeout(() => star.destroy(), 1200);
}

function updateHud() {
  hud.innerText = 'Score: ' + score;
}
