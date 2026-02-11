function moveSpine(head, spineArr) {
  let acc = .4;
  let friction = 0.9;

  // Use persistent velocity per frame
  if (!head.vel) head.vel = createVector(0, 0);

  let moveDir = createVector(0, 0);

  if (keyIsPressed) {
    // Use head direction vector (from next joint or dirX/dirY default)
    let i = spineArr.indexOf(head);
    let refVec;

    if (spineArr[i - 1]) {
      // Face toward the next joint
      refVec = createVector(spineArr[i - 1].x - head.x, spineArr[i - 1].y - head.y).normalize();
    } else {
      // Default facing right
      refVec = createVector(head.dirX, head.dirY).normalize();
    }

    let leftVec = createVector(-refVec.y, refVec.x);  // perpendicular left
    let rightVec = createVector(refVec.y, -refVec.x); // perpendicular right

    //if (keyIsDown(DOWN_ARROW))   moveDir.add(refVec);      // bw
    if (keyIsDown(UP_ARROW))    moveDir.sub(refVec);      // forward
    if (keyIsDown(LEFT_ARROW))  moveDir.add(leftVec);     // strafe left
    if (keyIsDown(RIGHT_ARROW)) moveDir.add(rightVec);    // strafe right
  }

  // Apply acceleration
  moveDir.setMag(acc);
  head.vel.add(moveDir);
  head.vel.mult(friction);

  // Update position
  head.setPos(head.x + head.vel.x, head.y + head.vel.y);
    //keep in bounds
    let pad = head.r / 2;
    head.x = constrain(head.x, pad, width - pad);
    head.y = constrain(head.y, pad, height - pad);

}
