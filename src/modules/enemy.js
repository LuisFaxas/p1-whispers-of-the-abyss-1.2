import {
  checkEnemyAttackCollision,
  handlePlayerDamage,
} from "./combat.js";
import { Player } from "../modules/player.js";

export class Enemy {
  constructor(x, y, width, height, speed, size, damage, attackRange, imgSrc) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.health = 100;
    this.isHit = false;
    this.isDead = false;
    this.deathAnimationFinished = false;
    this.size = size;

    this.speed = speed;
    this.isAttacking = false;
    this.attackRange = attackRange;
    this.damage = damage;
    this.attackCooldown = 3000;
    this.lastAttackTime = Date.now()

    this.spritesheet = new Image();
    this.spriteSheetLoaded = false;
    this.spritesheet.onload = () => {
      this.spriteSheetLoaded = true;
    };
    this.spritesheet.src = imgSrc;

    this.normalSpriteSize = 64;
    this.attackSpriteSize = 192;

    this.animations = {
      idleUp: { row: 8, frames: 1 },
      idleLeft: { row: 9, frames: 1 },
      idleDown: { row: 10, frames: 4 },
      idleRight: { row: 11, frames: 1 },

      walkUp: { row: 8, frames: 8 },
      walkLeft: { row: 9, frames: 8 },
      walkDown: { row: 10, frames: 8 },
      walkRight: { row: 11, frames: 8 },

      attackUp: { row: 7, frames: 6 },
      attackLeft: { row: 8, frames: 6 },
      attackDown: { row: 9, frames: 6 },
      attackRight: { row: 10, frames: 6 },
      death: { row: 20, frames: 6 },
    };

    this.currentAnimation = "";
    this.frameIndex = 0;
    this.tickCount = 0;
    this.ticksPerFrame = 8;
  }


  /*updateAnimation() {
    if (
      this.isAttacking &&
      this.frameIndex >= this.animations[this.currentAnimation].frames - 1
    ) {
      this.isAttacking = false; // Reset attacking state after animation finishes
      this.frameIndex = 0; // Reset the frame index to the start of the idle animation
    }

    this.tickCount += 1;
    if (this.tickCount > this.ticksPerFrame) {
      this.tickCount = 0;
      const animation = this.animations[this.currentAnimation];
      this.frameIndex = (this.frameIndex + 1) % animation.frames;
    }

    if (
      this.currentAnimation === "death" &&
      this.frameIndex === this.animations[this.currentAnimation].frames - 1 && this.tickCount === this.ticksPerFrame) {
      this.deathAnimationFinished = true;
    }
  }*/
  updateAnimation() {
    if (
      this.isAttacking &&
      this.frameIndex >= this.animations[this.currentAnimation].frames - 1
    ) {
      this.isAttacking = false; // Reset attacking state after animation finishes
      this.frameIndex = 0; // Reset the frame index to the start of the idle animation
    }
  
    this.tickCount += 1;
    if (this.tickCount > this.ticksPerFrame) {
      this.tickCount = 0;
      const animation = this.animations[this.currentAnimation];
      
      // Check if the enemy is dead and the current animation is death
      if (this.isDead && this.currentAnimation === 'death') {
        if (this.frameIndex < this.animations.death.frames - 1) {
          // Only advance the death animation if we're not on the last frame
          this.frameIndex += 1;
        } else {
          // Set this to true when the last frame of death animation is reached
          this.deathAnimationFinished = true;
        }
      } else {
        // Loop other animations
        this.frameIndex = (this.frameIndex + 1) % animation.frames;
      }
    }
  }

  draw(ctx) {
    if (!this.spriteSheetLoaded) return;
  
    const animation = this.animations[this.currentAnimation];
    
    // Calculate offsets for drawing attack frames
    const offsetX = this.isAttacking
      ? (this.attackSpriteSize - this.normalSpriteSize) / 1.3
      : 0;
    const offsetY = this.isAttacking
      ? (this.attackSpriteSize - this.normalSpriteSize) / 1.3
      : 0;
    
    // Determine sprite size based on attack state
    this.spriteSize = this.isAttacking
      ? this.attackSpriteSize
      : this.normalSpriteSize;
    
    // If the enemy is dead, draw the last frame of the death animation
    if (this.isDead && this.deathAnimationFinished ) {
      const deathAnimation = this.animations['death'];
      const lastFrameIndex = deathAnimation.frames - 1;
      
      ctx.drawImage(
        this.spritesheet,
        lastFrameIndex * this.spriteSize,
        deathAnimation.row * this.spriteSize,
        this.spriteSize,
        this.spriteSize,
        this.x - offsetX,
        this.y - offsetY,
        this.spriteSize * 1.25,
        this.spriteSize * 1.5
      );
    } else {
      // For alive enemies, or those in the middle of death animation, use the current animation frame
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
  }

  attack(player) {
    if (this.isAttacking || this.isDead) return;

    this.isAttacking = true;

    this.frameIndex = 0;

    if (checkEnemyAttackCollision(player, this)) {
      console.log("Enemy Attacked Player");
      handlePlayerDamage(player, this.damage); //assuming damage 10
    /*if (this.health <= 0 && !this.isDead) {
        this.isDead = true;
        this.currentAnimation = 'death';
        this.frameIndex = 0;}*/
    }
  }

  // Enemy methods such as update position, render, take damage, etc.
  update(player, enemies, gameWidth, gameHeight) {
    const now = Date.now();
    // Update position or other properties
    //euclidean method
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    //pithagoream theorem, then sqrt to find the distance
    const distanceToPlayer = Math.sqrt(dx * dx + dy * dy);

    if (distanceToPlayer < this.attackRange) {
      if (
        !this.lastAttackTime ||
        now - this.lastAttackTime > this.attackCooldown
      ) {
        this.attack(player);
        this.lastAttackTime = now;
      }
      //determine attack animation based on players position
      this.getAttackAnimation(dx, dy);
    } else {
      this.isAttacking = false;
      // Simple AI: Move towards the player
      this.x += dx === 0 ? 0 : (dx > 0 ? 1 : -1) * this.speed;
      this.y += dy === 0 ? 0 : (dy > 0 ? 1 : -1) * this.speed;

      // Set the walking animation based on movement direction
      this.currentAnimation = this.getWalkingAnimation(dx, dy);
    }

    if (this.isDead) {
      if(!this.deathAnimationFinished){
      this.currentAnimation = 'death'
      }
      this.updateAnimation()
      return;
    }

    this.preventOutOfBounds(gameWidth, gameHeight);
    this.preventingCollisionBetweenEnemies(enemies);
    this.preventPlayerEnemyOverlap(player, enemies)

    this.updateAnimation();
  }

  getAttackAnimation(dx, dy) {
    if (Math.abs(dx) > Math.abs(dy)) {
      this.currentAnimation = dx > 0 ? "attackRight" : "attackLeft";
    } else {
      this.currentAnimation = dy > 0 ? "attackDown" : "attackUp";
    }
  }

  getWalkingAnimation(dx, dy) {
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? "walkRight" : "walkLeft";
    } else {
      return dy > 0 ? "walkDown" : "walkUp";
    }
  }

  preventingCollisionBetweenEnemies(enemies) {
    for (let i = 0; i < enemies.length; i++) {
      let otherEnemy = enemies[i];
      if (otherEnemy !== this && !otherEnemy.isDead) {
        let dx = this.x - otherEnemy.x;
        let dy = this.y - otherEnemy.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let minimumDistance = this.size + otherEnemy.size;

        if (distance < minimumDistance) {
          let angle = Math.atan2(dy, dx);
          let overlap = minimumDistance - distance;
          this.x += (Math.cos(angle) * overlap) / 2;
          this.y += (Math.sin(angle) * overlap) / 2;
          otherEnemy.x -= (Math.cos(angle) * overlap) / 2;
          otherEnemy.y -= (Math.sin(angle) * overlap) / 2;
        }
      }
    }
  }

  preventPlayerEnemyOverlap(player, enemies) {
    for (let i = 0; i < enemies.length; i++) {
      const enemy = enemies[i];
      if (!enemy.isDead) {
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minimumDistance = player.size / 2 + enemy.size / 2; // Assuming player also has a size property
  
        if (distance < minimumDistance) {
          const angle = Math.atan2(dy, dx);
          const overlap = minimumDistance - distance;
          player.x += Math.cos(angle) * overlap;
          player.y += Math.sin(angle) * overlap;
        }
      }
    }
  }

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
