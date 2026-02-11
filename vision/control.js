function move(object) {
  let acc = 1;
  let friction = 0.8;

  if (keyIsPressed) {
    if (keyIsDown(UP_ARROW)) object.velY -= acc;
    if (keyIsDown(LEFT_ARROW)) object.velX -= acc;
    if (keyIsDown(RIGHT_ARROW)) object.velX += acc;
    if (keyIsDown(DOWN_ARROW)) object.velY += acc;
  }

  object.velX *= friction;
  object.velY *= friction;
  object.x += object.velX;
  object.y += object.velY;

  let radius = object.r / 2;
  object.x = min(max(object.x, radius), width - radius - 0.01);
  object.y = min(max(object.y, radius), height - radius - 0.01);
}
