export const characters = [
  {
    chName: "Bloody Barbarian",
    description: "High damage warrior. Slow.",
    damage: 100,
    health: 100,
    speed: 2,
    selected: false,
    imagePath: "../../Resources/Sprites/Custom/barbarian/barbarianSprite.png",
    characterImage:
      "../../Resources/CharSelector/bloodyBarbarian1.png",
  },
  {
    chName: "Cursed Knght",
    description: "A valiant knight with balanced stats.",
    damage: 75,
    health: 150,
    speed: 5,
    selected: false,
    imagePath: "../../Resources/Sprites/Custom/IronKnight/iron1.png",
    characterImage:
      "../../Resources/CharSelector/ironKnight1.png",
  },
  {
    chName: "Cursed Soldier",
    description: "Darkness-imbued, high health. Fast.",
    damage: 35,
    health: 200,
    speed: 7,
    selected: false,
    imagePath: "../../Resources/Sprites/Custom/Soldier/cursedSoldierSprite.png",
    characterImage:
      "../../Resources/CharSelector/cursedSoldier1.png",
  },
];

export const characterImage0 = new Image();
export const characterImage1 = new Image();
export const characterImage2 = new Image();

characterImage0.src = characters[0].characterImage;
characterImage1.src = characters[1].characterImage;
characterImage2.src = characters[2].characterImage;

export function renderCharacterSelector(
  ctx,
  characters,
  gameWidth,
  gameHeight
) {
  // console.log("called renderCharacterSelector");
  ctx.clearRect(0, 0, gameWidth, gameHeight);

  const sectionWidth = gameWidth / characters.length;

  /* const title = "Select your Hero";
  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.textAlign = "center";
  ctx.fillText(title, gameWidth / 2, 50); */ 

  ctx.drawImage(characterImage0, sectionWidth * 0, 0, sectionWidth, gameHeight);
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.textAlign = "center"; // Align text to center
  ctx.fillText(characters[0].chName, sectionWidth * 0 + 132, gameHeight - 40); // Position text in the center of the section
  ctx.font = "16px Arial";
  ctx.fillText(characters[0].description, sectionWidth * 0 + 132, gameHeight - 20); // Position text in the center of the section
  // };
  ctx.drawImage(characterImage1, sectionWidth * 1, 0, sectionWidth, gameHeight);
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.textAlign = "center"; // Align text to center
  ctx.fillText(characters[1].chName, sectionWidth * 1 + 132, gameHeight - 40); //
  ctx.font = "16px Arial";
  ctx.fillText(characters[1].description, sectionWidth * 1 + 132, gameHeight - 20); // Position text in the center of the section
  // }

  ctx.drawImage(characterImage2, sectionWidth * 2, 0, sectionWidth, gameHeight);
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.textAlign = "center"; // Align text to center
  ctx.fillText(characters[2].chName, sectionWidth * 2 + 132, gameHeight - 40); //
  ctx.font = "16px Arial";
  ctx.fillText(characters[2].description, sectionWidth * 2 + 132, gameHeight - 20); // Position text in the center of the section
  // };

}

export function handleCharacterSelection(
  canvas,
  gameWidth,
  gameHeight,
  characters,
  startGameCallback
) {
  canvas.addEventListener("click", function (event) {
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    characters.forEach((character, index) => {
      const x = (gameWidth / characters.length) * index;
      const y = gameHeight;

      if (
        clickX > x &&
        clickX < x + gameWidth / characters.length &&
        clickY > y - gameHeight &&
        clickY < y
      ) {
        console.log("Click", character)
        character.selected = true;
        startGameCallback(characters[index]);
      } 
    });
  });
}
