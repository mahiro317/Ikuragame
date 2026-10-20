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

// 画面上の座標を安全な範囲に収める
function clamp(value, min, max) {
    return Math.max(min, Math.min(value, max));
}

// ゲームエリア内にボールを生成する
function createBall() {
    const ball = document.createElement("div");
    ball.classList.add("ball");

    // ボールのサイズと色を統一
    const size = 36;
    ball.style.width = `${size}px`;
    ball.style.height = `${size}px`;
    ball.style.backgroundColor = "#ff7043";

    // 出現位置をランダムにする
    const maxX = gameArea.clientWidth - size;
    const maxY = gameArea.clientHeight - size;

    ball.style.left = `${Math.random() * maxX}px`;
    ball.style.top = `${Math.random() * maxY}px`;

    // 移動方向と速度はランダム
    ball.dx = (Math.random() - 0.5) * 200;
    ball.dy = (Math.random() - 0.5) * 200;
    ball.alive = true;

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
    });

    gameArea.appendChild(ball);
    balls.push(ball);
}

// ボールを初期配置する
function createBalls() {
    // 前回のゲームのボールを削除
    balls.forEach((ball) => ball.element.remove());
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

        ball.element.style.left = `${ball.x}px`;
        ball.element.style.top = `${ball.y}px`;
    }
}

// 毎フレーム呼ばれるアニメーション処理
function animate(timestamp) {
    if (!isPlaying) {
        return;
    }

    // フレーム間の経過時間を秒に変換
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

    // 前回のアニメーションとタイマーを停止
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

    // ゲーム開始時にまとめてボールを出現させる
    createBalls();

    // 現在時刻を基準に終了時刻を決める
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

    if (animationId !== null) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }

    if (timerId !== null) {
        clearInterval(timerId);
        timerId = null;
    }

    timeLeft = 0;
    timerDisplay.textContent = "0.0";
    timeProgress.style.width = "0%";

    message.innerHTML = `
        <h1>TIME UP!</h1>
        <p>あなたのスコアは <strong>${score}</strong> 点！</p>
        <p>もう一度チャレンジしてみよう！</p>
        <button id="start-button">もう一度プレイ</button>
    `;

    message.style.display = "flex";

    // innerHTMLで作り直したボタンにイベントを設定
    document.getElementById("start-button")
        .addEventListener("click", startGame);
}

// ゲーム開始ボタンにイベントを設定
startButton.addEventListener("click", startGame);