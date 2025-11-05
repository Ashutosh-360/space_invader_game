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
  shoot(invaderProjectiles){
    invaderProjectiles.push(new InvaderProjectile( new InvaderProjectile({
      position: {
        x: this.position.x + this.width / 2,
        y: this.position.y + this.height,
      },
      velocity: {
        x: 0,
        y: 5,
      },
    })))
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
class Particle {
  constructor({ position, velocity,radius ,color}) {
    this.position = position;
    this.velocity = velocity;
    this.radius = radius;
    this.color=color;
    this.opacity=1;
  }
  draw() {
    c.save()
    c.globalAlpha=this.opacity
    c.beginPath();
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    c.fillStyle = this.color;
    c.fill();
    c.closePath();
    c.restore()
  }
  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.opacity-=0.02;
  }
}
class InvaderProjectile {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;
    this.width = 3;
    this.height = 10;
  }
  draw() {
    c.fillStyle="white"
    c.fillRect(this.position.x,this.position.y,this.width,this.height)
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
const invaderProjectiles=[];
const particles=[];
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
  particles.forEach((particle,i)=>{
    if(particle.opacity<=0){
      particles.splice(i,1);
    }
    else{

      particle.update();
    }
  })

 invaderProjectiles.forEach((invaderProjectile, index) => {
  if (invaderProjectile.position.y > canvas.height) {
    invaderProjectiles.splice(index, 1); // remove off-screen bullets
  } else {
    invaderProjectile.update();
  }
  if(invaderProjectile.position.y+invaderProjectile.height>=player.position.y && invaderProjectile.position.x+invaderProjectile.width>=player.position.x && invaderProjectile.position.x<=player.position.x+player.width){
    console.log("Lose")
  }
});
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
     if(frames%100===0 && grid.invaders.length>0){
      grid.invaders[Math.floor(Math.random()*grid.invaders.length)].shoot(invaderProjectiles)
     }
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
              for(let i=0;i<15;i++){
            particles.push(new Particle({
              position:{
                x:invader.position.x+invader.width/2,
                y:invader.position.y+invader.height/2,
                
              },
              velocity:{
                x:(Math.random()-0.5)*2,
                y:(Math.random()-0.5)*2,
              },
              radius:Math.random()*2,
              color:'yellow'
            }))
          }
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
