let bgImage;
let player1;
let player2;
let questionActive = false;
let currentQuestion = 0;

function preload() {
  bgImage = loadImage('bg/bg1.png');
  player1 = new Character('1');
  player2 = new Character('2');
}

function setup() {
  // 1. 改成全螢幕滿版畫布
  createCanvas(windowWidth, windowHeight);
  
  // 設定角色 1 (站在 1/3 位置，放大 2.5 倍)
  player1.setup(width / 3, height * 0.85, 2.5);
  // 設定角色 2 (站在 2/3 位置，放大 2.5 倍，確保整隻都在畫面內)
  player2.setup(width * 2 / 3, height * 0.85, 2.5);
}

// 當瀏覽器視窗縮放時，畫布也跟著滿版調整
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(220);
  
  // 繪製滿版背景
  image(bgImage, 0, 0, width, height);

  // 更新與繪製角色 1
  player1.update();
  player1.display();

  // 繪製角色 2
  player2.display();

  // 檢查兩者距離與互動
  checkInteraction();

  // 如果問題啟動，顯示題目
  if (questionActive) {
    displayQuestion();
  }
}

function checkInteraction() {
  // 計算兩個角色的水平距離
  let d = abs(player1.x - player2.x);
  
  // 靠近時觸發問題
  if (d < 200 && !questionActive) {
    questionActive = true;
    generateQuestion();
  } else if (d >= 200) {
    questionActive = false;
    player2.setState('stop');
  }
}

function generateQuestion() {
  let questions = [
    { q: "10 + 8 = ?", options: ["17", "18", "19", "20"], answer: 1 },
    { q: "5 * 6 = ?", options: ["25", "30", "35", "40"], answer: 1 },
    { q: "12 - 4 = ?", options: ["6", "7", "8", "9"], answer: 2 }
  ];
  currentQuestion = random(questions);
}

function displayQuestion() {
  // 顯示黃色半透明背景的對話框在畫面正上方
  fill(255, 255, 0, 220); 
  stroke(0);
  strokeWeight(2);
  rect(width / 2 - 120, 50, 240, 170, 10);
  
  noStroke();
  fill(0);
  textAlign(CENTER);
  textSize(22);
  text(currentQuestion.q, width / 2, 85);
  
  // 顯示選項
  textSize(18);
  for (let i = 0; i < currentQuestion.options.length; i++) {
    text(currentQuestion.options[i], width / 2, 120 + i * 25);
  }
}

function mousePressed() {
  if (questionActive) {
    // 簡易點擊互動：點擊視窗範圍內讓角色 2 動起來
    if (mouseX > width / 2 - 120 && mouseX < width / 2 + 120 && mouseY > 50 && mouseY < 220) {
      player2.setState('run');
    }
  }
}

class Character {
  constructor(folderName) {
    this.folderName = folderName;
    this.state = 'stop';
    this.x = 0;
    this.y = 0;
    this.scale = 1;
    this.speed = 6;
    this.direction = 1; // 1 面向右，-1 面向左
    this.animations = {};
    
    this.animations.stop = loadImage(this.folderName + '/stop/stop.png');
    this.animations.run = loadImage(this.folderName + '/run/run.png');
  }

  setup(startX, startY, s) {
    this.x = startX;
    this.y = startY;
    this.scale = s;
  }

  update() {
    if (this.folderName === '1') {
      if (keyIsDown(RIGHT_ARROW)) {
        this.x += this.speed;
        this.state = 'run';
        this.direction = 1;
      } else if (keyIsDown(LEFT_ARROW)) {
        this.x -= this.speed;
        this.state = 'run';
        this.direction = -1;
      } else {
        this.state = 'stop';
      }
    }
  }

  display() {
    let img = this.animations[this.state];
    if (img && img.width > 0) {
      let totalFrames = 8; // 總共 8 格動作
      let frameWidth = img.width / totalFrames; 
      let frameHeight = img.height;
      
      // 關鍵修正：如果是 stop 狀態，固定只顯示第 0 格（立正站好），不亂跳！
      let currentFrame = 0;
      if (this.state === 'run') {
        currentFrame = floor(frameCount / 6) % totalFrames;
      }
      
      let drawW = frameWidth * this.scale;
      let drawH = frameHeight * this.scale;

      push();
      // 將定位點設在角色腳底中心，這樣兩隻角色都會穩穩踩在地面上
      translate(this.x, this.y);
      scale(this.direction, 1); // 支援左右轉向
      image(img, -drawW / 2, -drawH, drawW, drawH, 
            currentFrame * frameWidth, 0, frameWidth, frameHeight);
      pop();
    }
  }
  
  setState(newState) {
    this.state = newState;
  }
}