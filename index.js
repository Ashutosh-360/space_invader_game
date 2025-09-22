const canvas = document.querySelector("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const c = canvas.getContext("2d");

class Player {
  constructor() {
    this.velocity = {
      x: 0,
      y: 0,
    };
    const image = new Image();
    image.src = "./img/spaceship.png";
    image.onload = () => {
      this.image = image;
      this.width = image.width * 0.25;
      this.height = image.height * 0.25;
      this.position = {
        x: canvas.width / 2 - this.width / 2,
        y: canvas.height - this.height - 50,
      };
    };
  }

  draw() {
    c.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  }
  update() {
    if (this.image) {
      this.draw();
      this.position.x += this.velocity.x;
    }
  }
}

class Invader {
  constructor({ position }) {
    const image = new Image();
    image.src = "./img/invaders.png";
    image.onload = () => {
      this.image = image;
      this.width = image.width * 0.12;
      this.height = image.height * 0.12;
      this.position = {
        x: position.x,
        y: position.y,
      };
    };
  }

  draw() {
    c.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  }
  update({ velocity }) {
    if (this.image) {
      this.draw();
      this.position.x += velocity.x;
      this.position.y += velocity.y;
    }
  }
}
class Grid {
  constructor() {
    this.position = {
      x: 0,
      y: 0,
    };
    this.velocity = {
      x: 4,
      y: 0,
    };
    this.invaders = [];
    const columns = Math.ceil(Math.random() * 10 + 6);
    const rows = Math.ceil(Math.random() * 5 + 2);
    this.width = columns * 60;

    for (let i = 0; i < columns; i++) {
      for (let j = 0; j < rows; j++) {
        this.invaders.push(new Invader({ position: { x: 60 * i, y: 40 * j } }));
      }
    }
  }
  update() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.velocity.y = 0;
    if (this.position.x + this.width >= canvas.width || this.position.x < 0) {
      this.velocity.x = -this.velocity.x;
      this.velocity.y = 5;
    }
  }
}
class Projectile {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = 5;
  }
  draw() {
    c.beginPath();
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    c.fillStyle = "red";
    c.fill();
    c.closePath();
  }
  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}
class Projectile {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = 5;
  }
  draw() {
    c.beginPath();
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    c.fillStyle = "red";
    c.fill();
    c.closePath();
  }
  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

const player = new Player();

const projectiles = [];
const grid = [];
let frames = 0;
let randomInterval = Math.floor(Math.random() * 500 + 500);
const keys = {
  a: {
    pressed: false,
  },
  d: { pressed: false },
};
function animate() {
  requestAnimationFrame(animate);
  c.fillStyle = "black";
  c.fillRect(0, 0, canvas.width, canvas.height);

  player.update();

  projectiles.forEach((projectile, index) => {
    if (projectile.position.y + projectile.radius <= 0) {
      projectiles.splice(index, 1);
    } else {
      projectile.update();
    }
    projectile.update();
  });

  grid.forEach((grid,gridIndex) => {
    grid.update();
    grid.invaders.forEach((invader, i) => {
      invader.update({ velocity: grid.velocity });
      projectiles.forEach((projectile, j) => {
        if (
          projectile.position.y - projectile.radius <=
            invader.position.y + invader.height &&
          projectile.position.x + projectile.radius >= invader.position.x &&
          projectile.position.x - projectile.radius <= invader.position.x+invader.width &&
          projectile.position.y + projectile.radius >= invader.position.y
        ) {
          setTimeout(() => {
            const invaderFound = grid.invaders.find((invader2) => {
              return invader2 === invader;
            });
            const projectileFound = projectiles.find(
              (projectile2) => projectile2 === projectile
            );
            if (invaderFound && projectileFound) {
              grid.invaders.splice(i, 1);
              projectiles.splice(j, 1);

              if(grid.invaders.length>0){
                const firstInvader=grid.invaders[0];
                const lastInvader=grid.invaders[grid.invaders.length-1];
                grid.width=lastInvader.position.x-firstInvader.position.x+lastInvader.width;
                grid.position.x=firstInvader.position.x;
              }
              else{
                grid.splice(gridIndex,1);
              }
            }
          }, 0);
        }
      });
    });
  });

  if (keys.a.pressed && !keys.d.pressed && player.position.x >= 0) {
    player.velocity.x = -5;
  } else if (
    keys.d.pressed &&
    !keys.a.pressed &&
    player.position.x + player.width <= canvas.width
  ) {
    player.velocity.x = 5;
  } else {
    player.velocity.x = 0;
  }

  if (frames % randomInterval === 0) {
    grid.push(new Grid());
    randomInterval = Math.floor(Math.random * 500 + 500);
    frames = 0;
  }
  frames++;
}
animate();
window.addEventListener("keydown", ({ key }) => {
  switch (key) {
    case "a":
      keys.a.pressed = true;
      break;
    case "d":
      keys.d.pressed = true;
      break;
    case " ":
      if (player.image) {
        projectiles.push(
          new Projectile({
            position: {
              x: player.position.x + player.width / 2,
              y: player.position.y,
            },
            velocity: {
              x: 0,
              y: -5,
            },
          })
        );
      }
      break;
  }
});

window.addEventListener("keyup", ({ key }) => {
  switch (key) {
    case "a":
      keys.a.pressed = false;
      break;
    case "d":
      keys.d.pressed = false;
      break;
  }
});
