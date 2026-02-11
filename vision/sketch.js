let obs = [];
let enemies = [];
let canvasSizeX;
let canvasSizeY;


function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
class Enemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.r = 30;
  }
  draw() {
    fill(255, 0,0);
    circle(this.x, this.y, this.r)
  }
}
class Obstacle {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }
  draw() {
    stroke(1);
    fill(150);
    rect(this.x, this.y, this.w, this.h);
  }
}
class Player {
  constructor(x, y){
    this.x = x;
    this.y = y;
    this.r = 30;
    this.velX = 0;
    this.velY = 0;
    this.forwardD = 0;
  }
drawVision() {
  let coneLength = 250;
  let coneWidth = 125;
  fill(0, 200, 100, 100);
  noStroke();
  push();

  translate(this.x, this.y);

  let angle = atan2(this.velY, this.velX);

  let rays = [];

  // 1. Regular evenly spaced rays in cone
  for (let a = -coneWidth/2; a <= coneWidth/2; a += 1) {
    let rad = radians(a);
    let dx = coneLength * cos(rad);
    let dy = coneLength * sin(rad);

    // rotate to world
    let wx = dx * cos(angle) - dy * sin(angle);
    let wy = dx * sin(angle) + dy * cos(angle);

    rays.push({dx: wx, dy: wy});
  }

  // 2. Also cast rays directly to each obstacle corner
  for (let ob of obs) {
    let corners = [
      [ob.x, ob.y],
      [ob.x + ob.w, ob.y],
      [ob.x + ob.w, ob.y + ob.h],
      [ob.x, ob.y + ob.h]
    ];
    for (let c of corners) {
      let dx = c[0] - this.x;
      let dy = c[1] - this.y;

      let distToCorner = sqrt(dx*dx + dy*dy);
      if (distToCorner < coneLength) {
        let angleToCorner = atan2(dy, dx) - angle;

        // normalize to [-PI, PI]
        angleToCorner = atan2(sin(angleToCorner), cos(angleToCorner));

        if (angleToCorner > radians(-coneWidth/2) && angleToCorner < radians(coneWidth/2)) {
          rays.push({dx, dy});
        }
      }
    }
  }

// 3. Sort by angle relative to player direction
let raysWithAngles = rays.map(r => {
  let ang = atan2(r.dy, r.dx) - angle;
  ang = atan2(sin(ang), cos(ang));  // keeps in [-PI, PI]
  return {...r, ang};
});

raysWithAngles.sort((a, b) => a.ang - b.ang);

// 4. Draw shape
beginShape();
vertex(0, 0);
for (let r of raysWithAngles) {
  let pt = rayCast(this.x, this.y, r.dx, r.dy, obs);
  vertex(pt.x - this.x, pt.y - this.y);
}
endShape(CLOSE);

  pop();
  fill(255);
  stroke(1);
}
  draw() {
    this.drawVision();
    circle(this.x, this.y, this.r);
  }
}
function setup() {
  canvasSizeX = windowWidth;
  canvasSizeY = windowHeight;
  createCanvas(canvasSizeX, canvasSizeY);

  ball = new Player(30, 30);
  for(let i = 0; i < 10; i++) {
    obs.push(new Obstacle(random(0, canvasSizeX), random(0, canvasSizeY), random(25, 100), random(25, 100)));
  }
  for(let i = 0; i < 5; i++){
    enemies.push(new Enemy(random(0,canvasSizeX), random(0,canvasSizeY)));
  }
}

function draw() {
  background(220);
  ball.draw();
  move(ball);
  for (let ob of obs) {
    ob.draw();
  }

  // only draw enemies inside vision cone & line of sight
  let angle = atan2(ball.velY, ball.velX);
let coneLength = 250;  // SAME length as in drawVision()

for (let en of enemies) {
  let dx = en.x - ball.x;
  let dy = en.y - ball.y;
  let angleToEnemy = atan2(dy, dx) - angle;
  angleToEnemy = atan2(sin(angleToEnemy), cos(angleToEnemy));

  let distance = dist(ball.x, ball.y, en.x, en.y);
  if (
    angleToEnemy >= radians(-125/2) &&
    angleToEnemy <= radians(125/2) &&
    distance < coneLength
  ) {
    let sightPt = rayCast(ball.x, ball.y, dx, dy, obs);
    let blocked = dist(ball.x, ball.y, sightPt.x, sightPt.y) < distance;
    if (!blocked) {
      en.draw();
    }
  }
}
}
function rayCast(x, y, dx, dy, obstacles) {
  let closest = null;
  let record = Infinity;
  // Check each obstacle
  for (let ob of obstacles) {
    // Check each side of the rectangle
    let sides = [
      [ob.x, ob.y, ob.x + ob.w, ob.y], // top
      [ob.x + ob.w, ob.y, ob.x + ob.w, ob.y + ob.h], // right
      [ob.x + ob.w, ob.y + ob.h, ob.x, ob.y + ob.h], // bottom
      [ob.x, ob.y + ob.h, ob.x, ob.y]  // left
    ];
    for (let s of sides) {
      let pt = getLineIntersection(x, y, x + dx, y + dy, s[0], s[1], s[2], s[3]);
      if (pt) {
        let d = dist(x, y, pt.x, pt.y);
        if (d < record) {
          record = d;
          closest = pt;
        }
      }
    }
  }
  if (!closest) return {x: x + dx, y: y + dy}; // no hit, full length
  return closest;
}
function getLineIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
  let den = (x1 - x2)*(y3 - y4) - (y1 - y2)*(x3 - x4);
  if (den === 0) return null;

  let t = ((x1 - x3)*(y3 - y4) - (y1 - y3)*(x3 - x4)) / den;
  let u = -((x1 - x2)*(y1 - y3) - (y1 - y2)*(x1 - x3)) / den;

  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    return {
      x: x1 + t * (x2 - x1),
      y: y1 + t * (y2 - y1)
    };
  }
  return null;
}
