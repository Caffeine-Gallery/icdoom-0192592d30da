import { backend } from 'declarations/backend';

const CELL_SIZE = 64;
const PLAYER_SIZE = 10;
const FOV = Math.PI / 3;
const HALF_FOV = FOV / 2;
const NUM_RAYS = 320;
const MAX_DEPTH = 800;
const STRIP_WIDTH = 2;

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const map = [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1]
];

let player = {
    x: CELL_SIZE * 1.5,
    y: CELL_SIZE * 1.5,
    angle: 0,
    speed: 0
};

function clearScreen() {
    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function movePlayer() {
    let newX = player.x + Math.cos(player.angle) * player.speed;
    let newY = player.y + Math.sin(player.angle) * player.speed;

    if (!isWall(newX, newY)) {
        player.x = newX;
        player.y = newY;
    }
}

function isWall(x, y) {
    let cellX = Math.floor(x / CELL_SIZE);
    let cellY = Math.floor(y / CELL_SIZE);
    return map[cellY][cellX] === 1;
}

function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function castRay(angle) {
    let rayX = player.x;
    let rayY = player.y;
    let rayAngle = angle;

    let xOffset = Math.cos(rayAngle);
    let yOffset = Math.sin(rayAngle);

    while (true) {
        let cellX = Math.floor(rayX / CELL_SIZE);
        let cellY = Math.floor(rayY / CELL_SIZE);

        if (map[cellY][cellX] === 1) {
            let dist = distance(player.x, player.y, rayX, rayY);
            return dist;
        }

        rayX += xOffset;
        rayY += yOffset;

        if (distance(player.x, player.y, rayX, rayY) > MAX_DEPTH) {
            return MAX_DEPTH;
        }
    }
}

function renderScene() {
    clearScreen();

    for (let i = 0; i < NUM_RAYS; i++) {
        let rayAngle = player.angle - HALF_FOV + (i / NUM_RAYS) * FOV;
        let dist = castRay(rayAngle);
        let adjustedDist = dist * Math.cos(rayAngle - player.angle);

        let wallHeight = (CELL_SIZE * canvas.height) / adjustedDist;
        let wallTop = (canvas.height - wallHeight) / 2;

        ctx.fillStyle = `rgb(${255 - dist * 0.25}, 0, 0)`;
        ctx.fillRect(i * STRIP_WIDTH, wallTop, STRIP_WIDTH, wallHeight);
    }
}

function gameLoop() {
    movePlayer();
    renderScene();
    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') player.speed = 2;
    if (e.key === 'ArrowDown') player.speed = -2;
    if (e.key === 'ArrowLeft') player.angle -= 0.1;
    if (e.key === 'ArrowRight') player.angle += 0.1;
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') player.speed = 0;
});

gameLoop();

// High score functionality
let score = 0;

function updateScore() {
    score += 1;
    document.getElementById('scoreValue').textContent = score;
}

setInterval(updateScore, 1000);

async function submitHighScore() {
    const name = prompt("Enter your name for the high score:");
    if (name) {
        await backend.addHighScore(name, score);
        alert("High score submitted!");
    }
}

async function displayHighScores() {
    const highScores = await backend.getHighScores();
    let highScoreText = "High Scores:\n\n";
    highScores.forEach((score, index) => {
        highScoreText += `${index + 1}. ${score[0]}: ${score[1]}\n`;
    });
    alert(highScoreText);
}

// You can call submitHighScore() when the game ends
// and displayHighScores() when you want to show the high scores
