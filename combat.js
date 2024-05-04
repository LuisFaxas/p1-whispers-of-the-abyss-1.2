
function checkPlayerAttackCollision(player, enemy) {
  return (
    player.x < enemy.x + enemy.size &&
    player.x + player.size > enemy.x &&
    player.y < enemy.y + enemy.size &&
    player.y + player.size > enemy.y
  );
}

function checkEnemyAttackCollision(player, enemy) {
  // Define a larger hitbox for the enemy attack if desired
  const hitboxExpansion = 50; // or any value that suits your game design
  return (
    player.x < enemy.x + enemy.size + hitboxExpansion &&
    player.x + player.size > enemy.x - hitboxExpansion &&
    player.y < enemy.y + enemy.size + hitboxExpansion &&
    player.y + player.size > enemy.y - hitboxExpansion
  );
}



function handleEnemyDamage(enemy, damage) {
  
  enemy.health -= damage
  console.log(`Enemy took ${damage} damage! Current health: ${enemy.health}`)

  enemy.isHit = true;

  if (enemy.health <= 0) {
    enemy.isDead = true
    console.log('Enemy Defeated')
  }}

  function handlePlayerDamage(player, damage) {
    if (player.isInvincible) {
      console.log('Player is invincible and cannot be hit!');
      return; // Exit the function early if the player is invincible
    }
    
    player.health -= damage
    console.log(`Hero took ${damage} damage! Current health: ${player.health}`)
  
    player.isHit = true;
    player.isInvincible = true;
    player.invincibleTimer = Date.now();
  
    if (player.health <= 0) {
      player.isDead = true
      console.log('You are Dead')
      
    }
}

export {checkPlayerAttackCollision, checkEnemyAttackCollision, handleEnemyDamage, handlePlayerDamage};