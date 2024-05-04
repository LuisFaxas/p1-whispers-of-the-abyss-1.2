import { setupInputListeners, isKeyPressed } from "./modules/input.js";
import { Player } from "./modules/player.js";
import { Enemy } from "./modules/enemy.js";
import {
  characters,
  renderCharacterSelector,
  handleCharacterSelection,
} from "./modules/characterSelector.js";

let canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const gameWidth = canvas.width;
const gameHeight = canvas.height;

//LEVELS

let player;
let gameState = "title";

//PRELOADING IMAGES
function preloadImages(imagePaths) {
  let loadPromises = imagePaths.map((src) => {
    return new Promise((resolve, reject) => {
      let img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  });
  return Promise.all(loadPromises);
}

let titleImage = new Image();
titleImage.src = "./Resources/Images/GameStates/titleScreen.png";

//RENDER TITLE SCREEN FUNCTION
function renderTitleScreen(ctx, gameWidth, gameHeight, titleImg) {
  ctx.drawImage(titleImg, 0, 0, gameWidth, gameHeight);
}

//RENDER CHARACTER SELECTOR RENDER
function renderCharacterSelectorScreen(ctx) {
  gameState = "selectingCharacter";
  renderCharacterSelector(ctx, characters, gameWidth, gameHeight);
  handleCharacterSelection(canvas, gameWidth, gameHeight, characters, startGame);
}

//RENDER WIN SCREEN FUNCTION
function renderWinScreen(ctx, gameWidth, gameHeight) {
  const winImage = new Image()
  winImage.src = "./Resources/Images/GameStates/youEscaped.jpg"

  ctx.drawImage(winImage, 0, 0, gameWidth, gameHeight); 

  ctx.fillStyle = "white";
  ctx.font = "100px Arial";
  ctx.textAlign = "center";
  ctx.fillText("You Escaped", gameWidth / 2, gameHeight / 2);
}

//RENDER LOSE SCREEN FUNCTION
function renderLoseScreen(ctx, gameWidth, gameHeight) {

  const loseImage = new Image()
  loseImage.src = './Resources/Images/GameStates/YOUDIED.gif'

  ctx.drawImage(loseImage, 0, 0, gameWidth, gameHeight); 

  ctx.fillStyle = "white";
  ctx.font = "48px Arial";
  ctx.textAlign = "center";
  ctx.fillText("You are dead!", gameWidth / 2, gameHeight / 2);
}

//START GAME FUNCTION
function startGame(character) {
  gameState = "playing";
  
  const backgroundImage = new Image();
  backgroundImage.onload = () => {
    canvas.style.backgroundImage = `url(${backgroundImage.src})`
  };
  backgroundImage.src = './Resources/Images/Terrain/1000_F_489114227_4piH63TD1SsMlOgwH8kr88LirtrueZsc.jpg'

  player = new Player(
    gameWidth / 2,
    gameHeight / 2,
    character.speed,
    64,
    character.health,
    character.damage,
    100,
    character.imagePath
  );
}

//EVENT LISTENER FUNCTION
function setupEnterKeyListener() {
  document.addEventListener("keydown", (event) => {
    if (gameState === "title" && event.key === "Enter") {
      gameState = "selectingCharacter";
      renderCharacterSelectorScreen(ctx);
    }
  });
}

//HANDLING CHARACTER SELECTOR

/////////////////////////////////////////////////////////////
window.onload = () => {
  setupInputListeners();
  setupEnterKeyListener();

  const playerImagePath = "./Resources/Sprites/Custom/IronKnight/ironKnight.png";
  const enemyImage = "./Resources/Sprites/Enemies/Skelleton.png";

  preloadImages([enemyImage, titleImage.src])
    .then(() => {
      let enemies = [];

      let enemySpawnInterval = 3; 
      let maxEnemies = 5; 
      let enemySpawnTimer = 0; 

      function update(deltaTime) {
        if (gameState === "playing") {
          player.update(enemies);
          player.move(isKeyPressed);
          player.preventOutOfBounds(gameWidth, gameHeight);
      
          enemySpawnTimer += deltaTime;
      
          if (enemySpawnTimer >= enemySpawnInterval) {
            enemySpawnTimer = 0;
            const randomX = Math.random() * gameWidth;
            const randomY = -64; // Off-screen position
            const newEnemy = new Enemy(
              randomX,
              randomY,
              64,
              64,
              1,
              64,
              20,
              100,
              enemyImage
            );
            enemies.push(newEnemy);
          }
      
          enemies.forEach((enemy, index) => {
            if (!enemy.isDead) {
              const otherEnemies = enemies.filter(
                (_, otherIndex) => otherIndex !== index
              );
              enemy.update(player, otherEnemies, gameWidth, gameHeight);
            } else if (!enemy.deathAnimationFinished) {
              enemy.update(player, [], gameWidth, gameHeight);
            }
          });
      
          // Check win condition
          if (
            enemies.filter((enemy) => enemy.deathAnimationFinished).length ===
            maxEnemies
          ) {
            gameState = "win";
          }
      
          // Check lose condition
          if (player.isDead) {
            gameState = "lose";
          }
        }
      }

      function render() {
        ctx.clearRect(0, 0, gameWidth, gameHeight);

        if (gameState === "playing") {
          enemies.forEach((enemy) => {
            enemy.draw(ctx);
          });
          player.draw(ctx);
        } 
      }

      function gameLoop(currentTime) {
        const deltaTime = (currentTime - lastFrameTime) / 1000; // Convert to seconds
        lastFrameTime = currentTime;
      
        switch (gameState) {
          
          case "playing":
            update(deltaTime);
            render();
            break;
          case "win":
            if (
              enemies.filter((enemy) => enemy.deathAnimationFinished).length ===
              maxEnemies
            ) {
              window.cancelAnimationFrame(gameLoop)
              renderWinScreen(ctx, gameWidth, gameHeight);
              setTimeout(() => {
                window.location.reload()
              }, 2000)
            }
            break;
          case "lose":
            if (player.isDead) {
              renderLoseScreen(ctx, gameWidth, gameHeight);
              setTimeout(() => {
                window.cancelAnimationFrame(gameLoop)
                window.location.reload()
              }, 2000)
            }
            break;
          case "title":
            renderTitleScreen(ctx, gameWidth, gameHeight, titleImage);
            break;
          case "selectingCharacter":
            renderCharacterSelectorScreen(ctx,);
            break;
          
        }
      
        window.requestAnimationFrame(gameLoop);
      }

      let lastFrameTime = 0;
      gameLoop();
    })
    .catch((error) => {
      console.error("Error while preloading images:", error);
    });
};