const canvas: HTMLCanvasElement = document.createElement("canvas");
const ctx: CanvasRenderingContext2D = canvas.getContext("2d")!;
canvas.width = window.innerHeight / 1.3;
canvas.height = window.innerHeight;
canvas.oncontextmenu = () => {
  return false;
};
ctx.fillStyle = "white";
ctx.strokeStyle = "white";
ctx.lineWidth = 5;
document.body.append(canvas);

class Vector {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  setPosition(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

const drawCircle = (pos: Vector | { x: number; y: number }, r: number) => {
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
  ctx.fill();
};

const TWO_PI = Math.PI * 2;

const polygon = (pos: Vector, r: number, n: number) => {
  let angle = TWO_PI / n;
  const res: Vector[] = [];
  for (let i = 0; i < TWO_PI; i += angle) {
    res.push(new Vector(pos.x + Math.cos(i) * r, pos.y + Math.sin(i) * r));
  }
  return res;
};

const drawShape = (points: Vector[]) => {
  ctx.beginPath();
  for (let i = 0; i < points.length; i++) {
    const v = points[i];
    ctx.lineTo(v.x, v.y);
  }
  ctx.fill();
};

const rotatePoints = (points: Vector[], deg: number, ogPoint: Vector) => {
  const val = deg / 100;
  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    point.setPosition(
      Math.cos(val) * (point.x - ogPoint.x) -
        Math.sin(val) * (point.y - ogPoint.y) +
        ogPoint.x,
      Math.sin(val) * (point.x - ogPoint.x) +
        Math.cos(val) * (point.y - ogPoint.y) +
        ogPoint.y
    );
  }
};

const rand = (limit: number, rounded?: boolean) => {
  var val = Math.random() * limit;
  if (rounded) return Math.round(val);
  return val;
};

/*
 *WORKING SPACE BELOW
 */

class Spawn extends Vector {
  direction: number;
  interval: number;

  constructor(x: number, y: number, direction: number) {
    super(x, y);
    this.direction = direction;
    this.interval = 0;
  }

  setDirection(newVal: number) {
    this.direction = newVal;
  }

  fire(bulletSpeed: number, bulletSize: number) {
    bullets.push(
      new Bullet(this.x, this.y, this.direction, {
        r: bulletSize,
        speed: bulletSpeed,
      })
    );
  }

  startFire(bulletSpeed: number, bulletPerSec: number, bulletSize: number) {
    this.interval = setInterval(() => {
      this.fire(bulletSpeed, bulletSize);
    }, 1000 / bulletPerSec);
  }

  stopBullet() {
    clearInterval(this.interval);
  }
}

class Bullet extends Vector {
  direction: number;
  speed: number;
  r: number;

  constructor(
    x: number,
    y: number,
    direction: number,
    options: {
      r?: number;
      speed?: number;
    }
  ) {
    super(x, y);
    this.direction = direction;
    this.speed = options.speed ? options.speed : 3;
    this.r = options.r ? options.r : 3;
  }

  update() {
    this.x = this.x + this.speed * Math.cos(this.direction);
    this.y = this.y + this.speed * Math.sin(this.direction);
  }

  inBorder() {
    if (
      this.x + this.r < 0 ||
      this.x - this.r > canvas.width ||
      this.y + this.r < 0 ||
      this.y - this.r > canvas.height
    ) {
      return false;
    }
    return true;
  }
}

class Danmaku extends Vector {
  r: number;
  spawns: Spawn[];
  rotation: number;

  constructor(
    x: number,
    y: number,
    options: {
      r?: number;
      spawner?: number;
      rotationSpeed?: number;
      bulletSpeed?: number;
      bulletPerSec?: number;
      bulletSize?: number;
    }
  ) {
    super(x, y);
    this.r = options.r ? options.r : 30;
    this.rotation = options.rotationSpeed ? options.rotationSpeed : 10;
    this.spawns = polygon(
      this,
      this.r,
      options.spawner ? options.spawner : 6
    ).map((point) => {
      const angle = Math.atan2(point.y - this.y, point.x - this.x);
      const spawn = new Spawn(point.x, point.y, angle);
      setTimeout(
        () =>
          spawn.startFire(
            options.bulletSpeed ? options.bulletSpeed : 2,
            options.bulletPerSec ? options.bulletPerSec : 5,
            options.bulletSize ? options.bulletSize : 3
          ),
        0.3
      );
      return spawn;
    });
  }

  update() {
    rotatePoints(this.spawns, this.rotation, this);
    this.spawns.forEach((spawn) => {
      spawn.setDirection(Math.atan2(spawn.y - this.y, spawn.x - this.x));
      drawCircle(spawn, 2);
    });
  }

  setPosition(x: number, y: number): void {
    this.spawns.forEach((spawn) => {
      spawn.setPosition(spawn.x - this.x - x, spawn.y - this.y - y);
    });
    this.x = x;
    this.y = y;
  }
}

const mouse = new Vector(0, 0);
canvas.addEventListener("mousemove", (e) => {
  mouse.setPosition(e.x, e.y);
});

const bullets: Bullet[] = [];
const options = {
  r: 1,
  rotationSpeed: 7,
  spawner: 2,
  bulletPerSec: 60,
  bulletSpeed: 4,
  bulletSize: 5,
  bulletAge: 2,
};

const danmaku = new Danmaku(canvas.width / 2, canvas.height / 2, options);
const danmaku1 = new Danmaku(canvas.width / 2, canvas.height / 2, {
  ...options,
  rotationSpeed: options.rotationSpeed * -1,
});

const draw = () => {
  drawCircle(mouse, 5);
  danmaku.update();
  danmaku1.update();
  for (let i = 0; i < bullets.length; i++) {
    const bullet = bullets[i];
    bullet.update();
    if (bullet.inBorder()) {
      drawCircle(bullet, bullet.r);
    } else {
      delete bullets[i];
      bullets.splice(i, 1);
    }
  }
};

const startAnimation = () => {
  const framerate: number = 1000 / 60;

  const animate = () => {
    // requestAnimationFrame(animate);
    setTimeout(animate, framerate);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    draw();
  };
  animate();
};
startAnimation();
