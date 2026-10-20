
const gameArea = document.getElementById("game-area");
const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");
const timeProgress = document.getElementById("time-progress");
const message = document.getElementById("message");
const startButton = document.getElementById("start-button");

// ゲーム設定
const GAME_DURATION = 30;
const BALL_COUNT = 25;
const BALL_SIZE = 36;
const BALL_COLOR = "#ff7043";

// ゲームの状態
let score = 0;
let timeLeft = GAME_DURATION;
let isPlaying = false;

let balls = [];
let animationId = null;
let timerId = null;
let endTime = 0;
let lastFrameTime = 0;

// ボールを生成する
function createBall() {
    const ball = document.createElement("div");
    ball.classList.add("ball");

    // サイズと色を統一
    ball.style.width = `${BALL_SIZE}px`;
    ball.style.height = `${BALL_SIZE}px`;
    ball.style.backgroundColor = BALL_COLOR;

    // 初期位置
    ball.x = Math.random() * Math.max(0, gameArea.clientWidth - BALL_SIZE);
    ball.y = Math.random() * Math.max(0, gameArea.clientHeight - BALL_SIZE);

    // 移動速度
    ball.vx = (Math.random() - 0.5) * 200;
    ball.vy = (Math.random() - 0.5) * 200;

    ball.size = BALL_SIZE;
    ball.alive = true;

    ball.style.left = `${ball.x}px`;
    ball.style.top = `${ball.y}px`;

    // クリックしたらイクラをつぶす
    ball.addEventListener("pointerdown", function (event) {
        event.preventDefault();

        if (!isPlaying || !ball.alive) {
            return;
        }

        ball.alive = false;

        score++;
        scoreDisplay.textContent = score;

        ball.classList.add("popping");
        setTimeout(() => ball.remove(), 180);

        // すべてのイクラをつぶしたらゲーム終了
        if (balls.every(b => !b.alive)) {
            endGame();
        }
    });

    gameArea.appendChild(ball);
    balls.push(ball);
}

// ボールを初期配置する
function createBalls() {
    // 前回のボールをすべて削除
    balls.forEach(ball => ball.remove());
    balls = [];

    for (let i = 0; i < BALL_COUNT; i++) {
        createBall();
    }
}

// ボールを動かす
function moveBalls(deltaTime) {
    const areaWidth = gameArea.clientWidth;
    const areaHeight = gameArea.clientHeight;

    for (const ball of balls) {
        if (!ball.alive) {
            continue;
        }

        ball.x += ball.vx * deltaTime;
        ball.y += ball.vy * deltaTime;

        // 左右の壁で跳ね返る
        if (ball.x <= 0) {
            ball.x = 0;
            ball.vx = Math.abs(ball.vx);
        } else if (ball.x + ball.size >= areaWidth) {
            ball.x = Math.max(0, areaWidth - ball.size);
            ball.vx = -Math.abs(ball.vx);
        }

        // 上下の壁で跳ね返る
        if (ball.y <= 0) {
            ball.y = 0;
            ball.vy = Math.abs(ball.vy);
        } else if (ball.y + ball.size >= areaHeight) {
            ball.y = Math.max(0, areaHeight - ball.size);
            ball.vy = -Math.abs(ball.vy);
        }

        ball.style.left = `${ball.x}px`;
        ball.style.top = `${ball.y}px`;
    }
}

// ボールを動かし続ける
function animate(timestamp) {
    if (!isPlaying) {
        return;
    }

    const deltaTime = lastFrameTime === 0
        ? 0
        : Math.min((timestamp - lastFrameTime) / 1000, 0.05);

    lastFrameTime = timestamp;

    moveBalls(deltaTime);

    animationId = requestAnimationFrame(animate);
}

// 残り時間を更新する
function updateTimer() {
    if (!isPlaying) {
        return;
    }

    timeLeft = Math.max(0, (endTime - Date.now()) / 1000);

    timerDisplay.textContent = timeLeft.toFixed(1);
    timeProgress.style.width =
        `${(timeLeft / GAME_DURATION) * 100}%`;

    if (timeLeft <= 0) {
        endGame();
    }
}

// ゲームを開始する
function startGame() {
    if (isPlaying) {
        return;
    }

    // 前回のタイマーとアニメーションを停止
    if (animationId !== null) {
        cancelAnimationFrame(animationId);
    }

    if (timerId !== null) {
        clearInterval(timerId);
    }

    score = 0;
    timeLeft = GAME_DURATION;
    isPlaying = true;

    scoreDisplay.textContent = score;
    timerDisplay.textContent = timeLeft.toFixed(1);
    timeProgress.style.width = "100%";

    message.style.display = "none";

    // イクラを配置する
    createBalls();

    // 終了時刻を設定
    endTime = Date.now() + GAME_DURATION * 1000;
    lastFrameTime = 0;

    animationId = requestAnimationFrame(animate);
    timerId = setInterval(updateTimer, 50);
}

// ゲームを終了する
function endGame() {
    if (!isPlaying) {
        return;
    }

    isPlaying = false;

    clearInterval(timerId);

    if (animationId !== null) {
        cancelAnimationFrame(animationId);
    }

    message.style.display = "flex";
    message.innerHTML = `
        <h2>GAME OVER</h2>
        <p>スコア：${score} 点</p>
        <p>残り時間：${timeLeft.toFixed(1)} 秒</p>
        <button id="restart-button">もう一度プレイ</button>
    `;

    document.getElementById("restart-button")
        .addEventListener("click", startGame);
}

// スタートボタンの設定
startButton.addEventListener("click", startGame);
