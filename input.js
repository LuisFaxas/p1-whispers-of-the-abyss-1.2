// Input handling module
const keys = {};

function setupInputListeners() {
  window.addEventListener('keydown', (event) => {
    keys[event.key] = true;
    console.log(keys)
  });

  window.addEventListener('keyup', (event) => {
    keys[event.key] = false;
    console.log(keys)
  });
}

function isKeyPressed(key) {
  return keys[key]
}

function isAttackKeyPressed() {
  return keys[' '] 
}

export { setupInputListeners, isKeyPressed, isAttackKeyPressed }