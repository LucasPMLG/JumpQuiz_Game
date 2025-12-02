// Minimal Phaser 3 game implementing JumpQuiz mechanics (question block, pipes yes/no)
//Version 0.4.1
const API_BASE = 'http://127.0.0.1:8000/api';  // assumes backend served on same host & port

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 460,
  parent: 'game-container',
   transparent: true,
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 1000 }, debug: false, }

  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

function updateHud() {
  hud.innerText = 'Score: ' + score + ' | Vidas: ' + lives;
}


function preload() {
  this.load.image('bg', 'https://t4.ftcdn.net/jpg/09/11/68/91/360_F_911689184_UJ79OnnEaIz75Eo9bOXR6FuwwVL818gi.jpg');
  this.load.image('ground', 'assets/sprites/ground.png');
  this.load.image('block', 'assets/sprites/block.png');
  this.load.image('star', 'assets/sprites/star.png');
  this.load.image('player', 'assets/sprites/player.png');
  this.load.image('pipe_yes', 'assets/sprites/ghost_yes.png');
  this.load.image('pipe_no', 'assets/sprites/ghost_no.png');
  this.load.image('player_supreme', 'assets/sprites/player_supreme.png');
}

function getDifficulty() {
  if (score < 200) return "easy";
  if (score < 400) return "medium";
  return "hard";
}

showAnimatedAlert("Bem vindo ao JUMP QUIZ!", 3400);



let game = new Phaser.Game(config);
let player, cursors, platforms, questionBlock, hud;
let score = 0;
let lastMilestone = 0;
let asking = false;
let currentQuestion = null;
let yesPipe, noPipe;
let lives = 3;

function Tutorial20pontos() {
  showAnimatedAlert("Parabéns, você acertou sua primeira questão, cada vez que acertar uma questão você ganhará pontos.", 3000);
}

function Tutorial60pontos() {
  showAnimatedAlert("Sempre que conseguir 100 pontos, a dificuldade das perguntas aumentará!.", 3000);
}



function create() {
  // world
  platforms = this.physics.add.staticGroup();
  platforms.create(400, 434, 'ground').refreshBody();

  // block with question
  questionBlock = this.physics.add.staticSprite(400, 200, 'block');
  questionBlock.setData('isQuestion', true);

  // pipes (hidden initially)
  yesPipe = this.physics.add.staticSprite(200, 310, 'pipe_yes')
  noPipe = this.physics.add.staticSprite(620, 310, 'pipe_no')
  yesPipe.setAlpha(0);
  noPipe.setAlpha(0);
  yesPipe.setVisible(false);
  noPipe.setVisible(false);

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
  const difficulty = getDifficulty();
  fetch(API_BASE + `/random-question/?difficulty=${difficulty}`).then(r => r.json()).then(data => {
    if (data.error) {
      alert('No questions available in backend.');
      return;
    }
    currentQuestion = data;
    asking = true;

    fadeInPipes(this);
    showQuestionOverlay(currentQuestion.text);

    // show pipes and question overlay
    
  }).catch(err => {
    console.error(err);
    alert('Failed to fetch question from backend. Make sure backend is running and /api/random-question/ is available.');
  });
}

function showAnimatedAlert(text, duration = 2500) {
  const msg = document.createElement('div');
  msg.style.position = 'fixed';
  msg.style.left = '50%';
  msg.style.top = '40%';
  msg.style.transform = 'translate(-50%, -50%) scale(0.7)';
  msg.style.opacity = '0';
  msg.style.background = 'rgba(0, 0, 0, 0.9)';
  msg.style.color = '#fff';
  msg.style.padding = '16px 26px';
  msg.style.borderRadius = '14px';
  msg.style.fontSize = '20px';
  msg.style.fontWeight = 'bold';
  msg.style.zIndex = 99999;
  msg.style.transition = 'all 0.35s ease';

  msg.innerText = text;
  document.body.appendChild(msg);

  // anima entrada
  setTimeout(() => {
    msg.style.transform = 'translate(-50%, -50%) scale(1)';
    msg.style.opacity = '1';
  }, 50);

  // anima saída
  setTimeout(() => {
    msg.style.transform = 'translate(-50%, -50%) scale(0.7)';
    msg.style.opacity = '0';
  }, duration);

  // remove da tela
  setTimeout(() => {
    msg.remove();
  }, duration + 400);
}


function showLevelMessage() {
  const msg = document.createElement('div');
  msg.id = 'level-msg';
  msg.style.position = 'absolute';
  msg.style.left = '50%';
  msg.style.top = '50%';
  msg.style.transform = 'translate(-50%, -50%)';
  msg.style.background = 'rgba(0,0,0,0.75)';
  msg.style.color = 'white';
  msg.style.padding = '20px 28px';
  msg.style.borderRadius = '12px';
  msg.style.fontSize = '22px';
  msg.style.fontWeight = 'bold';
  msg.style.zIndex = 9999;
  msg.style.textAlign = 'center';
  msg.innerText = "Parabéns, você alcançou uma nova fase!";

  document.body.appendChild(msg);

  // Remove após 3 segundos
  setTimeout(() => {
    msg.remove();
  }, 3000);
}



function showQuestionOverlay(text) {

  const old = document.getElementById('question-overlay');
  if (old) old.remove();
  
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
  overlay.innerText = text + `\n Selecione o fantasma de \n Verdadeiro ou Falso para responder`;
  document.body.appendChild(overlay);
}

function showSpaceMessage(text) {
  const msg = document.createElement('div');
  msg.id = 'space-msg';
  msg.style.position = 'absolute';
  msg.style.left = '50%';
  msg.style.top = '50%';
  msg.style.transform = 'translate(-50%, -50%)';
  msg.style.background = 'rgba(0,0,0,0.85)';
  msg.style.color = 'white';
  msg.style.padding = '20px 28px';
  msg.style.borderRadius = '12px';
  msg.style.fontSize = '22px';
  msg.style.fontWeight = 'bold';
  msg.style.zIndex = 9999;
  msg.style.textAlign = 'center';
  msg.innerText = text;

  document.body.appendChild(msg);

  // remove após 3,5 segundos
  setTimeout(() => {
    msg.remove();
  }, 3500);
}

function showScoreMilestoneMessage() {
  const msg = document.createElement('div');
  msg.id = 'score-milestone-msg';
  msg.style.position = 'absolute';
  msg.style.left = '50%';
  msg.style.top = '50%';
  msg.style.transform = 'translate(-50%, -50%)';
  msg.style.background = 'rgba(0,0,0,0.75)';
  msg.style.color = 'white';
  msg.style.padding = '20px 28px';
  msg.style.borderRadius = '12px';
  msg.style.fontSize = '22px';
  msg.style.fontWeight = 'bold';
  msg.style.zIndex = 9999;
  msg.style.textAlign = 'center';
  msg.innerText = "Parabéns, você atingiu 500 pontos!";

  document.body.appendChild(msg);

  // Remove após 3 segundos
  setTimeout(() => {
    msg.remove();
  }, 2000);
}

function showTripCompletedMessage() {
  const msg = document.createElement('div');
  msg.id = 'trip-completed-msg';
  msg.style.position = 'absolute';
  msg.style.left = '50%';
  msg.style.top = '50%';
  msg.style.transform = 'translate(-50%, -50%)';
  msg.style.background = 'rgba(0,0,0,0.85)';
  msg.style.color = 'white';
  msg.style.padding = '20px 28px';
  msg.style.borderRadius = '12px';
  msg.style.fontSize = '26px';
  msg.style.fontWeight = 'bold';
  msg.style.zIndex = 9999;
  msg.style.textAlign = 'center';
  msg.innerText = "🚀 Viagem concluída!";

  document.body.appendChild(msg);

  setTimeout(() => {
    msg.remove();
  }, 3500);
}



function hideQuestionOverlay() {
  const el = document.getElementById('question-overlay');
  if (el) el.remove();
}

function fadeInPipes(scene) {
  yesPipe.setVisible(true);
  noPipe.setVisible(true);

  scene.tweens.add({
    targets: yesPipe,
    alpha: 1,
    duration: 600,
    ease: 'Power2'
  });

  scene.tweens.add({
    targets: noPipe,
    alpha: 1,
    duration: 600,
    ease: 'Power2',
    delay: 200
  });
}




function updateBackground(score) {
  const backgrounds = [
    { score: 100, url: 'https://i.pinimg.com/originals/08/d9/ef/08d9ef7723de602edefa8af825d9a1e2.gif' },
    { score: 200, url: 'https://cdn.mos.cms.futurecdn.net/c7430b83771cb95dd5a6c49d593b4ec5.gif' },
    { score: 300, url: 'https://64.media.tumblr.com/4cdadfc7dc8f0cf746d94d600e38fe90/4d234b7ecee6208d-dd/s1280x1920/debd221987a7eacf4da44ac875765374454d7623.gif' },
    { score: 400, url: 'https://i.pinimg.com/originals/96/3f/49/963f4946cb59a181fc60fdca84ce9027.gif' },
    { score: 500, url: 'https://images3.alphacoders.com/807/807247.jpg' },
    { score: 600, url: 'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExa2wzODFidzBscGF5Y3l0ODlhZjM3cjBwbnluZ2hqdmU0OHYybW8yOSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/JyQNXZ6IovFFhO4biU/giphy.gif' },
    { score: 700, url: 'https://i.pinimg.com/originals/ca/4d/23/ca4d2391455ade48053c0b6861842574.gif' },
    { score: 800, url: 'https://i.pinimg.com/originals/bc/87/e5/bc87e5124f8d2cfe810d403adc96ad01.gif' }
  ];

  for (let bg of backgrounds) {
    if (score >= bg.score) {
      document.body.style.backgroundImage = `url("${bg.url}")`;
    }
  }
}
function resetBackground() {
  document.body.style.backgroundImage = '';  
}
function changePlayerImage() {
  if (score == 500 ) {
      player.setTexture('player_supreme');
      showScoreMilestoneMessage()
  }
}
function SpaceTrip() {
  if (score >= 600 && !window.spaceMsgShown) {
      window.spaceMsgShown = true; // evita repetir várias vezes
      showSpaceMessage("🚀 Viajando para outra Galáxia! Conclusão da viagem em 700 pontos.");
  }
}




function submitAnswer(answer) {
  hideQuestionOverlay();
  asking = false;
  yesPipe.setAlpha(0);
  yesPipe.setVisible(false);

  noPipe.setAlpha(0);
  noPipe.setVisible(false);

  if (!currentQuestion) return;
  const correct = (answer == currentQuestion.answer);
  if (correct) {
    // award points and small animation (star)
    score += 20;

    if (score === 20) {
    Tutorial20pontos();
  }

  if (score === 60) {
    Tutorial60pontos();
  }

    

    if (score >= lastMilestone + 100 && score !== 500 && score !== 600 && score !== 700) {
        lastMilestone = score;
        showLevelMessage();
    }

    updateBackground(score);
    changePlayerImage();
    SpaceTrip();
    spawnStar();

     if (score >= 700 && !window.tripCompleted) {
        window.tripCompleted = true;
        showTripCompletedMessage();
    }
  } else {
    lives--;

    if (lives > 0) {
        showAnimatedAlert(`Resposta errada! Você perdeu uma vida. Vidas restantes: ${lives}`, 3000);
    } else {
        showAnimatedAlert("GAME OVER! Você perdeu todas as vidas.", 3000);
        lives = 3;      // reseta as vidas
        score = 0;      // reseta o jogo
        resetBackground();
        player.setTexture('player'); // caso estivesse com player supremo
    }
  }
  updateHud();
  currentQuestion = null;
}



function spawnStar() {
  const scene = game.scene.scenes[0];
  const star = scene.physics.add.image(player.x, player.y - 280, 'star');
  star.setVelocityY(-300);
  star.setGravityY(400);
  star.setVelocityX(50);
  scene.tweens.add({
    targets: star,
    alpha: 0,  
    duration: 580,  
    onComplete: () => {
      star.destroy();  
    }
  });
}


