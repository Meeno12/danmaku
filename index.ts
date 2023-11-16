const canvas: HTMLCanvasElement = document.createElement("canvas");
const ctx: CanvasRenderingContext2D = canvas.getContext("2d")!;
canvas.width = window.innerWidth / 2;
canvas.height = window.innerHeight;
canvas.oncontextmenu = () => {
  return false;
};
ctx.fillStyle = "white";
ctx.strokeStyle = "white";
ctx.shadowColor = "white";
ctx.lineWidth = 5;

document.getElementById("container")?.append(canvas);

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
  #bulletOptions: {
    onCreate?: ((bullet: Bullet) => void) | undefined;
  };

  constructor(
    x: number,
    y: number,
    direction: number,
    bulletOptions: {
      onCreate?: (bullet: Bullet) => void;
    }
  ) {
    super(x, y);
    this.direction = direction;
    this.interval = 0;
    this.#bulletOptions = bulletOptions;
  }

  setDirection(newVal: number) {
    this.direction = newVal;
  }

  movePosition(distance: number, direction: number): void {
    this.x = this.x + distance * Math.cos(direction);
    this.y = this.y + distance * Math.sin(direction);
  }

  fire(bulletSpeed: number, bulletSize: number) {
    bullets.push(
      new Bullet(this.x, this.y, this.direction, {
        r: bulletSize,
        speed: bulletSpeed,
        onCreate: this.#bulletOptions.onCreate,
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
  removed: boolean = false;

  constructor(
    x: number,
    y: number,
    direction: number,
    options: {
      r?: number;
      speed?: number;
      onCreate?: (bullet: Bullet) => void;
    }
  ) {
    super(x, y);
    this.direction = direction;
    this.speed = options.speed ? options.speed : 3;
    this.r = options.r ? options.r : 3;
    if (options.onCreate) options.onCreate(this);
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
  rotationChange:
    | {
        speedLimit?: number;
        speedChange: number;
      }
    | undefined;
  bulletOptions: {
    speed: number;
    size: number;
    bulletPerSec: number;
    createDelay: number;
  };
  hidden: boolean = false;

  #onUpdate: () => void;

  constructor(
    x: number,
    y: number,
    options: {
      r?: number;
      spawner?: number;
      rotationSpeed?: number;
      rotationChange?: {
        speedLimit?: number;
        speedChange: number;
      };
      bulletOptions?: {
        speed?: number;
        size?: number;
        bulletPerSec?: number;
        onCreate?: (bullet: Bullet) => void;
      };
      createOptions?: {
        bulletDelayInMs: number;
      };
      onCreate?: () => void;
      onUpdate?: () => void;
    }
  ) {
    super(x, y);
    this.r = options.r != null ? options.r : 30;
    this.rotation = options.rotationSpeed != null ? options.rotationSpeed : 10;
    this.rotationChange = options.rotationChange
      ? {
          ...options.rotationChange,
          speedChange: options.rotationChange.speedChange / 10,
        }
      : undefined;
    const bulletOptions = options.bulletOptions
      ? {
          speed: options.bulletOptions.speed ? options.bulletOptions.speed : 4,
          size: options.bulletOptions.size ? options.bulletOptions.size : 5,
          bulletPerSec: options.bulletOptions.bulletPerSec
            ? options.bulletOptions.bulletPerSec
            : 20,
          onCreate: options.bulletOptions.onCreate,
          createDelay: options.createOptions
            ? options.createOptions.bulletDelayInMs
            : 10,
        }
      : {
          speed: 4,
          size: 5,
          bulletPerSec: 20,
          onCreate: undefined,
          createDelay: options.createOptions
            ? options.createOptions.bulletDelayInMs
            : 10,
        };
    this.bulletOptions = bulletOptions;
    this.spawns = polygon(
      this,
      this.r,
      options.spawner ? options.spawner : 6
    ).map((point) => {
      const angle = Math.atan2(point.y - this.y, point.x - this.x);
      const spawn = new Spawn(point.x, point.y, angle, {
        onCreate: bulletOptions.onCreate,
      });
      setTimeout(
        () =>
          spawn.startFire(
            bulletOptions.speed,
            bulletOptions.bulletPerSec,
            bulletOptions.size
          ),
        bulletOptions.createDelay
      );
      return spawn;
    });
    this.#onUpdate = options.onUpdate ? options.onUpdate : function () {};
    if (options.onCreate) options.onCreate();
  }

  update() {
    if (this.rotationChange) {
      if (
        this.rotationChange.speedLimit &&
        (this.rotation > this.rotationChange.speedLimit ||
          this.rotation < this.rotationChange.speedLimit * -1)
      ) {
        this.rotationChange.speedChange = this.rotationChange.speedChange * -1;
      }
      this.rotation += this.rotationChange?.speedChange;
    }
    rotatePoints(this.spawns, this.rotation, this);
    this.spawns.forEach((spawn) => {
      spawn.setDirection(Math.atan2(spawn.y - this.y, spawn.x - this.x));
      if (!this.hidden) {
        drawCircle(spawn, 2);
      }
    });
    this.#onUpdate();
  }

  setPosition(x: number, y: number): void {
    this.spawns.forEach((spawn) => {
      spawn.setPosition(spawn.x - this.x - x, spawn.y - this.y - y);
    });
    this.x = x;
    this.y = y;
  }

  setRadius(newVal: number): void {
    this.spawns.forEach((spawner) => {
      spawner.movePosition(newVal - this.r, spawner.direction);
    });
    this.r = newVal;
  }

  toggleHide(): void {
    this.hidden = !this.hidden;
    if (this.hidden) {
      this.spawns.forEach((spawner) => {
        spawner.stopBullet();
      });
    } else {
      this.spawns.forEach((spawner) => {
        spawner.startFire(
          this.bulletOptions.speed,
          this.bulletOptions.bulletPerSec,
          this.bulletOptions.size
        );
      });
    }
  }

  setSpawner(amount: number): void {
    this.spawns.forEach((spawner) => spawner.stopBullet());
    this.spawns = polygon(this, this.r, amount).map((point) => {
      const angle = Math.atan2(point.y - this.y, point.x - this.x);
      const spawn = new Spawn(point.x, point.y, angle, {
        onCreate: () => {},
      });
      setTimeout(
        () =>
          spawn.startFire(
            this.bulletOptions.speed,
            this.bulletOptions.bulletPerSec,
            this.bulletOptions.size
          ),
        this.bulletOptions.createDelay
      );
      return spawn;
    });
  }

  setBulletSpeed(amount: number): void {
    this.bulletOptions.speed = amount;
    this.spawns.forEach((spawner) => {
      spawner.stopBullet();
      spawner.startFire(
        this.bulletOptions.speed,
        this.bulletOptions.bulletPerSec,
        this.bulletOptions.size
      );
    });
  }

  setBulletSize(amount: number): void {
    this.bulletOptions.size = amount;
    this.spawns.forEach((spawner) => {
      spawner.stopBullet();
      spawner.startFire(
        this.bulletOptions.speed,
        this.bulletOptions.bulletPerSec,
        this.bulletOptions.size
      );
    });
  }

  setBulletSpawnRate(amount: number): void {
    this.bulletOptions.bulletPerSec = amount;
    this.spawns.forEach((spawner) => {
      spawner.stopBullet();
      spawner.startFire(
        this.bulletOptions.speed,
        this.bulletOptions.bulletPerSec,
        this.bulletOptions.size
      );
    });
  }

  setRotationSpeed(value: number): void {
    this.rotation = value;
  }

  setSpeedChange(value: number): void {
    this.rotationChange = {
      speedLimit: 15,
      speedChange: value / 10,
    };
  }

  toggleRotationChange(value: number): void {
    if (this.rotationChange) {
      delete this.rotationChange;
      this.rotation = value;
    } else {
      this.rotationChange = {
        speedLimit: 15,
        speedChange: value / 10,
      };
    }
  }
}

const mouse = new Vector(0, 0);
canvas.addEventListener("mousemove", (e) => {
  mouse.setPosition(e.x, e.y);
});

let bullets: Bullet[] = [];
const options = {
  r: 1,
  rotationSpeed: 8,
  rotationChange: {
    speedChange: 2,
    speedLimit: 15,
  },
  spawner: 3,
  bulletOptions: {
    bulletPerSec: 30,
    speed: 2,
    size: 3,
  },
  createOptions: {
    bulletDelayInMs: 300,
  },
};

/*
 *Controls
 */

function getE(id: string) {
  return document.getElementById(id);
}

getE("mirror")?.addEventListener("change", (e) => {
  danmaku1?.toggleHide();
});

getE("radius")?.addEventListener("change", (e) => {
  const { target } = e;
  if (target) {
    const newVal = (target as HTMLInputElement).value;
    danmaku.setRadius(Number(newVal));
    danmaku1.setRadius(Number(newVal));
  }
});

getE("spawner")?.addEventListener("change", (e) => {
  const { target } = e;
  if (target) {
    const newVal = (target as HTMLInputElement).value;
    danmaku.setSpawner(Number(newVal));
    danmaku1.setSpawner(Number(newVal));
  }
});

getE("bullet-speed")?.addEventListener("change", (e) => {
  const { target } = e;
  if (target) {
    const newVal = (target as HTMLInputElement).value;
    danmaku.setBulletSpeed(Number(newVal));
    danmaku1.setBulletSpeed(Number(newVal));
  }
});
getE("bullet-size")?.addEventListener("change", (e) => {
  const { target } = e;
  if (target) {
    const newVal = (target as HTMLInputElement).value;
    danmaku.setBulletSize(Number(newVal));
    danmaku1.setBulletSize(Number(newVal));
  }
});
getE("spawn-rate")?.addEventListener("change", (e) => {
  const { target } = e;
  if (target) {
    const newVal = (target as HTMLInputElement).value;
    danmaku.setBulletSpawnRate(Number(newVal));
    danmaku1.setBulletSpawnRate(Number(newVal));
  }
});
const speedChange = getE("speed-change") as HTMLInputElement;
const rotationSpeed = getE("rotation-speed") as HTMLInputElement;
getE("rotation-change")?.addEventListener("change", (e) => {
  const { target } = e;
  if (target) {
    const newVal = (target as HTMLInputElement).checked;
    if (newVal) {
      speedChange.disabled = false;
      rotationSpeed.disabled = true;
      speedChange.parentElement?.setAttribute("class", "");
      rotationSpeed.parentElement?.setAttribute("class", "disabled");
      danmaku.toggleRotationChange(Number(speedChange.value));
      danmaku1.toggleRotationChange(Number(speedChange.value) * -1);
    } else {
      speedChange.disabled = true;
      rotationSpeed.disabled = false;
      speedChange.parentElement?.setAttribute("class", "disabled");
      rotationSpeed.parentElement?.setAttribute("class", "");
      danmaku.toggleRotationChange(Number(rotationSpeed.value));
      danmaku1.toggleRotationChange(Number(rotationSpeed.value) * -1);
    }
  }
});
speedChange.addEventListener("change", (e) => {
  const { target } = e;
  if (target) {
    danmaku.setSpeedChange(Number((target as HTMLInputElement).value));
    danmaku1.setSpeedChange(Number((target as HTMLInputElement).value) * -1);
  }
});
rotationSpeed.addEventListener("change", (e) => {
  const { target } = e;
  if (target) {
    danmaku.setRotationSpeed(Number((target as HTMLInputElement).value));
    danmaku1.setRotationSpeed(Number((target as HTMLInputElement).value) * -1);
  }
});

const danmaku = new Danmaku(canvas.width / 2, canvas.height / 2, options);
let danmaku1 = new Danmaku(canvas.width / 2, canvas.height / 2, {
  ...options,
  rotationSpeed: options.rotationSpeed * -1,
  rotationChange: {
    ...options.rotationChange,
    speedChange: options.rotationChange.speedChange * -1,
  },
});

const draw = () => {
  danmaku.update();
  danmaku1.update();
  for (let i = 0; i < bullets.length; i++) {
    const bullet = bullets[i];
    bullet.update();
    if (bullet.inBorder()) {
      drawCircle(bullet, bullet.r);
    } else {
      delete bullets[i];
    }
  }
  bullets = bullets.filter((bullet) => bullet);
};

const startAnimation = () => {
  const framerate: number = 1000 / 60;

  const animate = () => {
    setTimeout(animate, framerate);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    draw();
  };
  animate();
};

startAnimation();
