const snowflakes = [];

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createSnowflake() {
  const snowflake = document.createElement("i");
  snowflake.classList.add("far", "fa-snowflake", "snowflake");
  snowflake.style.left = `${random(0, window.innerWidth)}px`;
  snowflake.style.animationDuration = `${random(3, 7)}s`;
  snowflake.style.opacity = `${random(0.3, 1)}`;
  snowflake.style.fontSize = `${random(10, 20)}px`;
  document.body.appendChild(snowflake);
  snowflakes.push(snowflake);
  setTimeout(() => {
    snowflake.remove();
    snowflakes.splice(snowflakes.indexOf(snowflake), 1);
  }, 7000);
}

setInterval(createSnowflake, 50);
