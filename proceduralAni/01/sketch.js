const canvasSize = 500;
const spineSize = 10;
let spine = [];
let clickedPoint = null;
let dragDistance;
let jointLeng = 30;

function random(min, max) {
  return Math.random() * (max - min) + min;
}
class Vpoint {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.vec = createVector(x, y);
    this.radius = random(25,45);
  }
  draw() {
    stroke(0);
    strokeWeight(2);
    fill(0, 0);
    circle(this.x, this.y, this.radius);
  }
  isMouseHovering(mX, mY){
    return dist(mX, mY, this.vec.x, this.vec.y) < this.radius;
  }
  setPos(x, y) {
    this.vec.set(x, y);
    this.x = x;
    this.y = y;
  }
}

function setup() {
  createCanvas(canvasSize, canvasSize);
  for(let i = 0; i < spineSize; i++){
  spine.push(new Vpoint(jointLeng+i*jointLeng, 100));
  //p1 = new Vpoint((i*10), (i*10));
  }
}
function draw() {
  background(220);
  spine.forEach(vert => vert.draw());
}
function mousePressed() {
  for(let vert of spine) {
    if(vert.isMouseHovering(mouseX, mouseY)){
      clickedPoint = vert;
      dragDistance = createVector(mouseX - vert.vec.x, mouseY - vert.vec.y);
    }
  }
}
function mouseDragged() {
  if (clickedPoint) {
    clickedPoint.setPos(mouseX - dragDistance.x, mouseY - dragDistance.y);
    let clickedIndex = spine.indexOf(clickedPoint);
    let maxAngle = radians(45);

    // Forward direction
    for (let i = clickedIndex + 1; i < spine.length; i++) {
      let a = spine[i - 1];
      let b = spine[i];

      let prevDir;
      if (i === 1) {
        // straight line from a to b
        prevDir = p5.Vector.sub(b.vec, a.vec);
      } else {
        prevDir = p5.Vector.sub(a.vec, spine[i - 2].vec);
      }

      let newDir = p5.Vector.sub(b.vec, a.vec);
      let angleBetween = prevDir.angleBetween(newDir);

      if (abs(angleBetween) > maxAngle) {
        newDir = prevDir.copy().normalize().rotate(constrain(angleBetween, -maxAngle, maxAngle));
      } else {
        newDir = newDir.normalize();
      }
      newDir.setMag(jointLeng);
      b.setPos(a.x + newDir.x, a.y + newDir.y);
    }

    // Backward direction (optional clamping — can skip or mirror logic)
    for (let i = clickedIndex - 1; i >= 0; i--) {
      let b = spine[i + 1];
      let a = spine[i];

      let dir = p5.Vector.sub(a.vec, b.vec).normalize().mult(jointLeng);
      a.setPos(b.x + dir.x, b.y + dir.y);
    }
  }
  for( let i = clickedIndex + 1; i < spine.length; i++) {
    let a = spine[i-1];
    let b = spine[i];

    let prevDir = p5.Vector.sub(b.vec, a.vec);
    prevDir.normalize().mult(jointLeng);
    b.setPos(a.x + prevDir.x, a.y + prevDir.y);

    //collision check
    let d = dist(a.x, a.y, b.x, b.y);
    let minDist = a.radius / 2 + b.radius / 2;
    if(d < minDist) {
      let push = p5.Vector.sub(b.vec, a.vec).setMag(minDist);
      b.setPos(a.x + push.x, a.y + push.y);
    }
  }
  // Backward direction
  for (let i = clickedIndex - 1; i >= 0; i--) {
    let b = spine[i + 1];
    let a = spine[i];

    let dir = p5.Vector.sub(a.vec, b.vec).normalize().mult(jointLeng);
    a.setPos(b.x + dir.x, b.y + dir.y);

    // Collision check
    let d = dist(a.x, a.y, b.x, b.y);
    let minDist = a.radius / 2 + b.radius / 2;
    if (d < minDist) {
      let push = p5.Vector.sub(a.vec, b.vec).setMag(minDist);
      a.setPos(b.x + push.x, b.y + push.y);
   }
  }
  let loopIndex = 0;
  spine.forEach(vert => {
    spine.forEach(vertB => {
      let dist = dist(vertB.x, vertB.y, vert.x, vert.y);
      let coll = vert.radius+vertB.radius
      if (dist > coll) {
        
      }
    })
  });
}
function mouseReleased() {
  clickedPoint = null;
}
