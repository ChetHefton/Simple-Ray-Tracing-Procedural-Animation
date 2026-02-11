let organism;
const canvasSize = 500;
//let spineSize = 20;
//let spine = [];
//let jointLeng = 16;
//let clickedPoint = null;
//let clickedIndex;
//let maxAngle = Radians(35);

let rads = [3,7,10,12,15,17,20,22,25,27,30,27,25,20,17,15,25,19,22,34];

function Radians(degrees) {
  return degrees * (Math.PI / 180);
}
class Spine{
  constructor(size, jointLeng, radArr, maxAngle) {
    this.body = [];
    this.size = size;
    this.jointLeng = jointLeng;
    this.maxAngle = radians(maxAngle);

    for (let i = 0; i < size; i++) {
      let x = (i + 1) * this.jointLeng;
      let y = 100;
      let r = radArr[i];
      this.body.push(new Vert(x, y, r));
    }
  }
}
class Vert {
  constructor(x, y, r){
    this.x = x;
    this.y = y;
    this.r = r;
    this.circ = circle(this.x, this.y, this.r);
    this.dirX = 1;
    this.dirY = 0;
    this.leftVec;
    this.rightVec;
    this.frontPoint = null;
    this.backPoint = null;
  }
  drawSpine(spineArr) {
    this.parametricCalc(spineArr);
    stroke(1);
    strokeWeight(.8);
    fill(255,100);
    circle(this.x, this.y, this.r);
  }
  isMouseOver(x, y){
    return (dist(x, y, this.x, this.y) < this.r)
  }
  setPos(x, y){
    this.x = x;
    this.y = y;
  }
  parametricCalc(spineArr) {
    let i = spineArr.indexOf(this);

    let refVec;

    // Get reference direction vector
    if (i === 0 && spineArr.length > 1) {
      // First point, use forward direction
      let next = spineArr[i + 1];
      refVec = createVector(next.x - this.x, next.y - this.y);
    } else if (i > 0) {
      // Any other point, use backward direction
      let prev = spineArr[i - 1];
      refVec = createVector(this.x - prev.x, this.y - prev.y);
    } else {
      return; // not enough data to calculate
    }

    let frontVec = refVec.copy().normalize();

    // Get a perpendicular vector to the direction vector
    let normal = createVector(-frontVec.y, frontVec.x); // 90° CCW from direction

    // Left and right are just ± this perpendicular
    this.leftVec = createVector(this.x, this.y).add(normal.copy().mult(this.r / 2));
    this.rightVec = createVector(this.x, this.y).add(normal.copy().mult(-this.r / 2));


    // Cap point for head and tail
    if (i === 0) {
      // Head cap goes FORWARD (away from next joint)
      this.capPoint = createVector(this.x, this.y).sub(frontVec.copy().mult(this.r/2));
    } else if (i === organism.body.length - 1) {
      // Tail cap goes BACKWARD (away from previous joint)
      this.capPoint = createVector(this.x, this.y).add(frontVec.copy().mult(this.r/2));
    } else {
      this.capPoint = null;
    }
  }
}

function setup() {
  createCanvas(canvasSize, canvasSize);
  organism = new Spine(20, 15, rads, 35);
  // for(let i = 1; i < organism.bodySize+1; i++){
  //   organism.body.push(new Vert(i*organism.jointLeng, 100, rads[i-1]));
  // }
}
function draw() {
  background(220);
  moveSpine(organism.body[organism.body.length-1], organism.body); //move the head
  // Make the LAST vertebra follow the mouse
  // organism.body[organism.body.length - 1].setPos(mouseX, mouseY);

 // BACKWARD update: joints before the tail move toward it
  for (let i = organism.body.length - 2; i >= 0; i--) {
     let b = organism.body[i + 1]; // next (closer to tail)
     let a = organism.body[i];     // current
     let dir = createVector(a.x - b.x, a.y - b.y);
     dir.setMag(organism.jointLeng);
    a.setPos(b.x + dir.x, b.y + dir.y);
  }

   // FORWARD tighten (optional refinement pass)
  for (let i = 1; i < organism.body.length; i++) {
     let a = organism.body[i - 1];
     let b = organism.body[i];
     let dir = createVector(b.x - a.x, b.y - a.y);
     dir.setMag(organism.jointLeng);
     b.setPos(a.x + dir.x, a.y + dir.y);
  }

  limitAngles();
  collisionResolve();

  organism.body.forEach(vert => {
    noFill();
    vert.drawSpine(organism.body);
  });

  fill(255, 100);
  drawBody(organism.body);
}
// function mousePressed() {
//   for (let i = organism.body.length-1; i >= 0; i--) {
//     if (organism.body[i].isMouseOver(mouseX, mouseY)) {
//       clickedPoint = organism.body[i];
//       clickedIndex = i;
//       break;
//     }
//   }
// }
//function mouseDragged() {
  // clickedIndex = 0;
  // if (clickedPoint) {
  //   clickedPoint.setPos(mouseX, mouseY);

  //   // Forward direction: adjust all joints AFTER the dragged one
  //   for (let i = clickedIndex + 1; i < organism.body.length; i++) {
  //     let a = organism.body[i - 1]; // previous
  //     let b = organism.body[i];     // current

  //     let dir = createVector(b.x - a.x, b.y - a.y);
  //     dir.setMag(jointLeng);
  //     b.setPos(a.x + dir.x, a.y + dir.y); //start at a go dir in x and y place b there
  //   }
  //   // Backward direction: adjust all joints BEFORE the dragged one
  //   for (let i = clickedIndex - 1; i >= 0; i--) {
  //     let b = organism.body[i + 1]; // next
  //     let a = organism.body[i];     // current

  //     let dir = createVector(a.x - b.x, a.y - b.y);
  //     dir.setMag(jointLeng);
  //     a.setPos(b.x + dir.x, b.y + dir.y);
  //   }
  // }
  // limitAngles();
  // collisionResolve();

//}
// function mouseReleased() {
//   clickedPoint = null;
// }
function collisionResolve() {
  for (let i = 0; i < organism.body.length; i++) {
    let a = organism.body[i];
    for (let j = 0; j < organism.body.length; j++) {
      if (i === j || Math.abs(i - j) === 1) continue; // skip self and direct neighbors

      let b = organism.body[j];
      let d = dist(a.x, a.y, b.x, b.y);
      let minDist = (a.r/2) + (b.r/2);

      if (d < minDist) {
        let overlap = (minDist - d) / 2;
        let pushDir = createVector(b.x - a.x, b.y - a.y)
        pushDir.normalize();
        pushDir.mult(overlap);

        // push both away from each other
        a.setPos(a.x - pushDir.x, a.y - pushDir.y);
        b.setPos(b.x + pushDir.x, b.y + pushDir.y);
      }
    }
  }
}
function limitAngles() {
  for (let i = 1; i < organism.body.length - 1; i++) {
    let prev = organism.body[i - 1];
    let curr = organism.body[i];
    let next = organism.body[i + 1];

    // Vector from prev → curr (defines base direction)
    let baseVec = createVector(curr.x - prev.x, curr.y - prev.y).normalize();

    // Vector from curr → next (the one we'll clamp)
    let toNext = createVector(next.x - curr.x, next.y - curr.y);
    //let nextLen = toNext.mag(); // keep current length for realism

    // Angle between the two vectors
    let angleBetween = baseVec.angleBetween(toNext);

    // Clamp angle if it's outside the limits
    if (abs(angleBetween) > organism.maxAngle) {
      let clampedAngle = constrain(angleBetween, -organism.maxAngle, organism.maxAngle);
      let newDir = baseVec.copy().rotate(clampedAngle).setMag(organism.jointLeng);
      next.setPos(curr.x + newDir.x, curr.y + newDir.y);
    }
  }
}
function drawBody(body) {
  //noFill();
  beginShape();

  const head = body[0];
  const tail = body[body.length - 1];

  // ── HEAD CAP: left → cap → right
  curveVertex(head.leftVec.x, head.leftVec.y);
  if (head.capPoint) {
    curveVertex(head.capPoint.x, head.capPoint.y);
    }
  curveVertex(head.rightVec.x, head.rightVec.y);

  // ── RIGHT SIDE (head to tail)
  for (let i = 1; i < body.length - 1; i++) {
    let p = body[i].rightVec;
    if (p) curveVertex(p.x, p.y);
  }

  // ── TAIL CAP: right → cap → left
  curveVertex(tail.rightVec.x, tail.rightVec.y);
  if (tail.capPoint) {
    curveVertex(tail.capPoint.x, tail.capPoint.y);
    }
  curveVertex(tail.leftVec.x, tail.leftVec.y);

  // ── LEFT SIDE (tail to head)
  for (let i = body.length - 2; i > 0; i--) {
    let p = body[i].leftVec;
    if (p) curveVertex(p.x, p.y);
  }

  // ── Finish loop
  curveVertex(head.leftVec.x, head.leftVec.y);

  endShape(CLOSE);
}

