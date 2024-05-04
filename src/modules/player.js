import { checkPlayerAttackCollision, handleEnemyDamage } from "./combat.js";
import { isKeyPressed, isAttackKeyPressed } from "./input.js";


class Player {
  constructor(x, y, speed, size, health, damage, attackRange, imgSrc) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.size = size;
    this.damage = damage;
    this.attackRange = attackRange;
    //this.imgSrc = imgSrc
    this.isAttacking = false;
    this.attackDuration = 500;
    this.lastAttackTime = Date.now();
    this.moveX = 0;
    this.moveY = -1;

    this.health = health;
    this.isHit = false;
    this.isDead = false;

    this.isInvincible = false;
    this.invincibleTimer = 0;
    this.invincibleDuration = 1000;

    //animations 64by64px generated here: https://sanderfrenken.github.io/Universal-LPC-Spritesheet-Character-Generator/#?body=Body_color_light&head=Human_male_light&ears=Big_ears_light&shoulders=Legion_steel&arms=Armour_steel&bauldron=none&bracers=Bracers_steel&gloves=Gloves_steel&chainmail=Chainmail_gray&armour=Plate_steel&cape=Solid_black&belt=Double_Belt_slate&legs=Armour_steel&shoes=Boots_charcoal&weapon=Longsword_longsword&bandana=Mail_steel&hat=Pigface_bascinet_steel

    this.spritesheet = new Image();

    this.spritesheet.onload = () => {
      this.spriteSheetLoaded = true;
    };
    this.spritesheet.src = imgSrc;

    this.normalSpriteSize = 64;
    this.attackSpriteSize = 192;

    this.numberOfFrames = 24;

    this.animations = {
      idleUp: { row: 8, frames: 1 },
      idleLeft: { row: 9, frames: 1 },
      idleDown: { row: 10, frames: 1 },
      idleRight: { row: 11, frames: 1 },

      walkUp: { row: 8, frames: 8 },
      walkLeft: { row: 9, frames: 8 },
      walkDown: { row: 10, frames: 8 },
      walkRight: { row: 11, frames: 8 },

      attackUp: { row: 7, frames: 6 },
      attackLeft: { row: 8, frames: 6 },
      attackDown: { row: 9, frames: 6 },
      attackRight: { row: 10, frames: 6 },
    };

    this.currentAnimation = "";
    this.frameIndex = 0;
    this.tickCount = 0;
    this.ticksPerFrame = 8;

  }

  draw(ctx) {
    if (!this.spritesheet.complete) {
      console.error("Sprite sheet has not loaded");
      return;
    }

    const offsetX = this.isAttacking
      ? (this.attackSpriteSize - this.normalSpriteSize) / 1.3
      : 0;
    const offsetY = this.isAttacking
      ? (this.attackSpriteSize - this.normalSpriteSize) / 1.3
      : 0;

    this.spriteSize = this.isAttacking
      ? this.attackSpriteSize
      : this.normalSpriteSize;

    const animation = this.animations[this.currentAnimation];
    ctx.drawImage(
      this.spritesheet,
      this.frameIndex * this.spriteSize,
      animation.row * this.spriteSize,
      this.spriteSize,
      this.spriteSize,
      this.x - offsetX,
      this.y - offsetY,
      this.spriteSize * 1.25,
      this.spriteSize * 1.5
    );
  }

  //updating anim
  updateAnimation() {
    /*if (this.isAttacking && this.isAttackAnimationComplete()) {
      this.isAttacking = false;
      this.frameIndex = 0; // Reset frame index when attack animation completes
      this.setCurrentAnimation(); // Update the current animation to idle
    } else {
      
      }*/
      this.tickCount += 1;
      if (this.tickCount > this.ticksPerFrame) {
        this.tickCount = 0;
        const animation = this.animations[this.currentAnimation];
        this.frameIndex = (this.frameIndex + 1) % animation.frames;
    }
  }

  //current anim based on movement
  setCurrentAnimation() {
    const movingUp = isKeyPressed("ArrowUp");
    const movingDown = isKeyPressed("ArrowDown");
    const movingLeft = isKeyPressed("ArrowLeft");
    const movingRight = isKeyPressed("ArrowRight");

    /*const idlingUp = this.moveY + 1 === 0;
    const idlingDown = this.moveY - 1 === 0;
    const idlingLeft = this.moveX + 1 === 0;
    const idlingRight = this.moveX - 1 === 0;*/
    const idlingUp = this.moveY < 0;
    const idlingDown = this.moveY > 0;
    const idlingLeft = this.moveX < 0;
    const idlingRight = this.moveX > 0;

    console.log(
      " IDLING VALUES ======>",
      idlingDown,
      idlingUp,
      idlingLeft,
      idlingRight
    );

    if (this.isAttacking) {
      if (movingUp || this.currentAnimation === "idleUp") {
        this.currentAnimation = "attackUp";
      } else if (movingLeft || this.currentAnimation === "idleLeft") {
        this.currentAnimation = "attackLeft";
      } else if (movingDown || this.currentAnimation === "idleDown") {
        this.currentAnimation = "attackDown";
      } else if (movingRight || this.currentAnimation === "idleRight") {
        this.currentAnimation = "attackRight";
      }

      // Check if the attack animation is complete
     /* if (this.isAttackAnimationComplete()) {
        this.isAttacking = false; // Stop attacking

        
      }*/
    } else {
      if (this.currentAnimation === "attackLeft") {
        this.currentAnimation = "idleLeft";
      } else if (this.currentAnimation === "attackRight") {
        this.currentAnimation = "idleRight";
      } else if (this.currentAnimation === "attackUp") {
        this.currentAnimation = "idleUp";
      } else if (this.currentAnimation === "attackDown") {
        this.currentAnimation = "idleDown";
      }
      if (movingDown) {
        this.currentAnimation = "walkDown";
      } else if (movingLeft) {
        this.currentAnimation = "walkLeft";
      } else if (movingRight) {
        this.currentAnimation = "walkRight";
      } else if (movingUp) {
        this.currentAnimation = "walkUp";
      } else {
        if (idlingLeft) {
          this.currentAnimation = "idleLeft";
        } else if (idlingRight) {
          this.currentAnimation = "idleRight";
        } else if (idlingUp) {
          this.currentAnimation = "idleUp";
        } else if (idlingDown) {
          this.currentAnimation = "idleDown";
        }
      }
    }
  }
  /*isAttackAnimationComplete() {
    // If the current time is greater than the last attack time plus the duration, the attack is complete
    return ( Date.now() - this.lastAttackTime) >= this.attackDuration;
  }*/

  attack(enemies) {
    
    if (this.isAttacking ) return;

    this.isAttacking = true;
    console.log("Player Attack!");
    this.lastAttackTime = Date.now();
    this.frameIndex = 0;

    enemies.forEach((enemy) => {
      if (checkPlayerAttackCollision(this, enemy)) {
        handleEnemyDamage(enemy, this.damage); //assuming damage 10
      }
    });

    setTimeout(() => {
      this.isAttacking = false;

      this.setCurrentAnimation();
    }, this.attackDuration);
  }

  update(enemies) {

    // Check if the invincibility timer has expired
  if (this.isInvincible && Date.now() - this.invincibleTimer > this.invincibleDuration) {
    this.isInvincible = false;
  }

    if (isAttackKeyPressed()) {
      this.attack(enemies);
    }
    this.setCurrentAnimation();
    this.updateAnimation();
  }

  move() {
    this.moveX =
      (isKeyPressed("ArrowLeft") ? -1 : 0) +
      (isKeyPressed("ArrowRight") ? 1 : 0);
    this.moveY =
      (isKeyPressed("ArrowUp") ? -1 : 0) + (isKeyPressed("ArrowDown") ? 1 : 0);
    const diagonalFactor =
      this.moveX !== 0 && this.moveY !== 0 ? Math.sqrt(2) : 1;

    this.x += this.moveX * (this.speed / diagonalFactor);
    this.y += this.moveY * (this.speed / diagonalFactor);
  }

  //preventing out of bounds D:
  preventOutOfBounds(gameWidth, gameHeight) {
    if (this.x < 0) {
      this.x = 0;
    } else if (this.x + this.size > gameWidth) {
      this.x = gameWidth - this.size;
    }
    if (this.y < 0) {
      this.y = 0;
    } else if (this.y + this.size > gameHeight) {
      this.y = gameHeight - this.size;
    }
  }
}
export { Player };
