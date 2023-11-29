"use strict";
var __classPrivateFieldSet =
  (this && this.__classPrivateFieldSet) ||
  function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f)
      throw new TypeError("Private accessor was defined without a setter");
    if (
      typeof state === "function"
        ? receiver !== state || !f
        : !state.has(receiver)
    )
      throw new TypeError(
        "Cannot write private member to an object whose class did not declare it"
      );
    return (
      kind === "a"
        ? f.call(receiver, value)
        : f
        ? (f.value = value)
        : state.set(receiver, value),
      value
    );
  };
var __classPrivateFieldGet =
  (this && this.__classPrivateFieldGet) ||
  function (receiver, state, kind, f) {
    if (kind === "a" && !f)
      throw new TypeError("Private accessor was defined without a getter");
    if (
      typeof state === "function"
        ? receiver !== state || !f
        : !state.has(receiver)
    )
      throw new TypeError(
        "Cannot read private member from an object whose class did not declare it"
      );
    return kind === "m"
      ? f
      : kind === "a"
      ? f.call(receiver)
      : f
      ? f.value
      : state.get(receiver);
  };
var _a, _b, _c, _d, _e, _f, _g, _h;
var _Spawn_bulletOptions, _Danmaku_onUpdate;
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth / 2;
canvas.height = window.innerHeight;
canvas.oncontextmenu = () => {
  return false;
};
ctx.fillStyle = "white";
ctx.strokeStyle = "white";
ctx.shadowColor = "white";
ctx.lineWidth = 5;
(_a = document.getElementById("container")) === null || _a === void 0
  ? void 0
  : _a.append(canvas);
class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }
}
const drawCircle = (pos, r) => {
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
  ctx.fill();
};
const TWO_PI = Math.PI * 2;
const polygon = (pos, r, n) => {
  let angle = TWO_PI / n;
  const res = [];
  for (let i = 0; i < TWO_PI; i += angle) {
    res.push(new Vector(pos.x + Math.cos(i) * r, pos.y + Math.sin(i) * r));
  }
  return res;
};
const drawShape = (points) => {
  ctx.beginPath();
  for (let i = 0; i < points.length; i++) {
    const v = points[i];
    ctx.lineTo(v.x, v.y);
  }
  ctx.fill();
};
const rotatePoints = (points, deg, ogPoint) => {
  const val = deg / 100;
  if (points instanceof Vector) {
    points.setPosition(
      Math.cos(val) * (points.x - ogPoint.x) -
        Math.sin(val) * (points.y - ogPoint.y) +
        ogPoint.x,
      Math.sin(val) * (points.x - ogPoint.x) +
        Math.cos(val) * (points.y - ogPoint.y) +
        ogPoint.y
    );
    return;
  }
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
const rand = (limit, rounded) => {
  var val = Math.random() * limit;
  if (rounded) return Math.round(val);
  return val;
};
/*
 *WORKING SPACE BELOW
 */
class Bullet extends Vector {
  constructor(x, y, direction, options) {
    super(x, y);
    this.removed = false;
    this.direction = direction;
    this.speed = (options.speed || 180) / 60;
    this.r = options.r ? options.r : 3;
    if (options.onCreate) options.onCreate(this);
  }
  update(frameDiff) {
    this.x = this.x + this.speed * Math.cos(this.direction) * frameDiff;
    this.y = this.y + this.speed * Math.sin(this.direction) * frameDiff;
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
class Spawn extends Vector {
  constructor(x, y, direction, bulletOptions, danmaku) {
    super(x, y);
    _Spawn_bulletOptions.set(this, void 0);
    this.direction = direction;
    this.interval = 0;
    __classPrivateFieldSet(this, _Spawn_bulletOptions, bulletOptions, "f");
    this.parent = danmaku;
  }
  movePosition(distance, direction) {
    this.x = this.x + distance * Math.cos(direction);
    this.y = this.y + distance * Math.sin(direction);
  }
  fire(bulletSpeed, bulletSize, position) {
    bullets.push(
      new Bullet(position.x, position.y, this.direction, {
        r: bulletSize,
        speed: bulletSpeed,
        onCreate: __classPrivateFieldGet(this, _Spawn_bulletOptions, "f")
          .onCreate,
      })
    );
  }
  startFire(bulletSpeed, bulletPerSec, bulletSize) {
    this.interval = setInterval(() => {
      const now = Date.now(),
        timeDiff = (now - lastFrame) / framerate,
        predictedPos = new Vector(this.x, this.y);
      rotatePoints(predictedPos, this.parent.rotation * timeDiff, this.parent);
      this.direction = Math.atan2(
        predictedPos.y - this.parent.y,
        predictedPos.x - this.parent.x
      );
      const trueSpeed = bulletSpeed / 60;
      predictedPos.setPosition(
        predictedPos.x + trueSpeed * Math.cos(this.direction) * (1 - timeDiff),
        predictedPos.y + trueSpeed * Math.sin(this.direction) * (1 - timeDiff)
      );
      this.fire(bulletSpeed, bulletSize, predictedPos);
    }, 1000 / bulletPerSec);
  }
  stopBullet() {
    clearInterval(this.interval);
  }
}
_Spawn_bulletOptions = new WeakMap();
class Danmaku extends Vector {
  constructor(x, y, options) {
    super(x, y);
    this.hidden = false;
    _Danmaku_onUpdate.set(this, void 0);
    this.r = options.r != null ? options.r : 30;
    this.rotation = options.rotationSpeed != null ? options.rotationSpeed : 10;
    this.rotationChange = options.rotationChange
      ? Object.assign(Object.assign({}, options.rotationChange), {
          speedChange: options.rotationChange.speedChange / 10,
        })
      : undefined;
    const bulletOptions = options.bulletOptions
      ? {
          speed: options.bulletOptions.speed || 4,
          size: options.bulletOptions.size || 5,
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
      const spawn = new Spawn(
        point.x,
        point.y,
        angle,
        {
          onCreate: bulletOptions.onCreate,
        },
        this
      );
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
    __classPrivateFieldSet(
      this,
      _Danmaku_onUpdate,
      options.onUpdate ? options.onUpdate : function () {},
      "f"
    );
    if (options.onCreate) options.onCreate();
  }
  update() {
    var _a;
    if (this.rotationChange) {
      if (
        this.rotationChange.speedLimit &&
        (this.rotation > this.rotationChange.speedLimit ||
          this.rotation < this.rotationChange.speedLimit * -1)
      ) {
        this.rotationChange.speedChange = this.rotationChange.speedChange * -1;
      }
      this.rotation +=
        (_a = this.rotationChange) === null || _a === void 0
          ? void 0
          : _a.speedChange;
    }
    rotatePoints(this.spawns, this.rotation, this);
    this.spawns.forEach((spawn) => {
      if (!this.hidden) {
        drawCircle(spawn, 2);
      }
    });
    __classPrivateFieldGet(this, _Danmaku_onUpdate, "f").call(this);
  }
  setPosition(x, y) {
    this.spawns.forEach((spawn) => {
      spawn.setPosition(spawn.x - this.x - x, spawn.y - this.y - y);
    });
    this.x = x;
    this.y = y;
  }
  setRadius(newVal) {
    this.spawns.forEach((spawner) => {
      spawner.movePosition(newVal - this.r, spawner.direction);
    });
    this.r = newVal;
  }
  toggleHide() {
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
  setSpawner(amount) {
    if (!this.hidden) {
      this.spawns.forEach((spawner) => spawner.stopBullet());
    }
    this.spawns = polygon(this, this.r, amount).map((point) => {
      const angle = Math.atan2(point.y - this.y, point.x - this.x);
      const spawn = new Spawn(
        point.x,
        point.y,
        angle,
        {
          onCreate: () => {},
        },
        this
      );
      if (!this.hidden) {
        spawn.startFire(
          this.bulletOptions.speed,
          this.bulletOptions.bulletPerSec,
          this.bulletOptions.size
        );
      }
      return spawn;
    });
  }
  setBulletSpeed(amount) {
    this.bulletOptions.speed = amount;
    if (this.hidden) return;
    this.spawns.forEach((spawner) => {
      spawner.stopBullet();
      spawner.startFire(
        this.bulletOptions.speed,
        this.bulletOptions.bulletPerSec,
        this.bulletOptions.size
      );
    });
  }
  setBulletSize(amount) {
    this.bulletOptions.size = amount;
    if (this.hidden) return;
    this.spawns.forEach((spawner) => {
      spawner.stopBullet();
      spawner.startFire(
        this.bulletOptions.speed,
        this.bulletOptions.bulletPerSec,
        this.bulletOptions.size
      );
    });
  }
  setBulletSpawnRate(amount) {
    this.bulletOptions.bulletPerSec = amount;
    if (this.hidden) return;
    this.spawns.forEach((spawner) => {
      spawner.stopBullet();
      spawner.startFire(
        this.bulletOptions.speed,
        this.bulletOptions.bulletPerSec,
        this.bulletOptions.size
      );
    });
  }
  setRotationSpeed(value) {
    this.rotation = value;
  }
  setSpeedChange(value) {
    this.rotationChange = {
      speedLimit: 15,
      speedChange: value / 10,
    };
  }
  toggleRotationChange(value) {
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
_Danmaku_onUpdate = new WeakMap();
const mouse = new Vector(0, 0);
canvas.addEventListener("mousemove", (e) => {
  mouse.setPosition(e.x, e.y);
});
let bullets = [];
const framerate = 1000 / 60;
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
    speed: 180,
    size: 3,
  },
  createOptions: {
    bulletDelayInMs: 300,
  },
};
/*
 *Controls
 */
function getE(id) {
  return document.getElementById(id);
}
(_b = getE("mirror")) === null || _b === void 0
  ? void 0
  : _b.addEventListener("change", (e) => {
      danmaku1.toggleHide();
    });
(_c = getE("radius")) === null || _c === void 0
  ? void 0
  : _c.addEventListener("change", (e) => {
      const { target } = e;
      if (target) {
        const newVal = target.value;
        danmaku.setRadius(Number(newVal));
        danmaku1.setRadius(Number(newVal));
      }
    });
(_d = getE("spawner")) === null || _d === void 0
  ? void 0
  : _d.addEventListener("change", (e) => {
      const { target } = e;
      if (target) {
        const newVal = target.value;
        danmaku.setSpawner(Number(newVal));
        danmaku1.setSpawner(Number(newVal));
      }
    });
(_e = getE("bullet-speed")) === null || _e === void 0
  ? void 0
  : _e.addEventListener("change", (e) => {
      const { target } = e;
      if (target) {
        const newVal = target.value;
        danmaku.setBulletSpeed(Number(newVal));
        danmaku1.setBulletSpeed(Number(newVal));
      }
    });
(_f = getE("bullet-size")) === null || _f === void 0
  ? void 0
  : _f.addEventListener("change", (e) => {
      const { target } = e;
      if (target) {
        const newVal = target.value;
        danmaku.setBulletSize(Number(newVal));
        danmaku1.setBulletSize(Number(newVal));
      }
    });
(_g = getE("spawn-rate")) === null || _g === void 0
  ? void 0
  : _g.addEventListener("change", (e) => {
      const { target } = e;
      if (target) {
        const newVal = target.value;
        danmaku.setBulletSpawnRate(Number(newVal));
        danmaku1.setBulletSpawnRate(Number(newVal));
      }
    });
const speedChange = getE("speed-change");
const rotationSpeed = getE("rotation-speed");
(_h = getE("rotation-change")) === null || _h === void 0
  ? void 0
  : _h.addEventListener("change", (e) => {
      var _a, _b, _c, _d;
      const { target } = e;
      if (target) {
        const newVal = target.checked;
        if (newVal) {
          speedChange.disabled = false;
          rotationSpeed.disabled = true;
          (_a = speedChange.parentElement) === null || _a === void 0
            ? void 0
            : _a.setAttribute("class", "");
          (_b = rotationSpeed.parentElement) === null || _b === void 0
            ? void 0
            : _b.setAttribute("class", "disabled");
          danmaku.toggleRotationChange(Number(speedChange.value));
          danmaku1.toggleRotationChange(Number(speedChange.value) * -1);
        } else {
          speedChange.disabled = true;
          rotationSpeed.disabled = false;
          (_c = speedChange.parentElement) === null || _c === void 0
            ? void 0
            : _c.setAttribute("class", "disabled");
          (_d = rotationSpeed.parentElement) === null || _d === void 0
            ? void 0
            : _d.setAttribute("class", "");
          danmaku.toggleRotationChange(Number(rotationSpeed.value));
          danmaku1.toggleRotationChange(Number(rotationSpeed.value) * -1);
        }
      }
    });
speedChange.addEventListener("change", (e) => {
  const { target } = e;
  if (target) {
    danmaku.setSpeedChange(Number(target.value));
    danmaku1.setSpeedChange(Number(target.value) * -1);
  }
});
rotationSpeed.addEventListener("change", (e) => {
  const { target } = e;
  if (target) {
    danmaku.setRotationSpeed(Number(target.value));
    danmaku1.setRotationSpeed(Number(target.value) * -1);
  }
});
const danmaku = new Danmaku(canvas.width / 2, canvas.height / 2, options);
let danmaku1 = new Danmaku(
  canvas.width / 2,
  canvas.height / 2,
  Object.assign(Object.assign({}, options), {
    rotationSpeed: options.rotationSpeed * -1,
    rotationChange: Object.assign(Object.assign({}, options.rotationChange), {
      speedChange: options.rotationChange.speedChange * -1,
    }),
  })
);
const draw = () => {
  const currentFrame = Date.now();
  const frameDiff = (currentFrame - lastFrame) / framerate;
  danmaku.update();
  danmaku1.update();
  lastFrame = currentFrame;
  for (let i = 0; i < bullets.length; i++) {
    const bullet = bullets[i];
    bullet.update(frameDiff);
    if (bullet.inBorder()) {
      drawCircle(bullet, bullet.r);
    } else {
      delete bullets[i];
    }
  }
  bullets = bullets.filter((bullet) => bullet);
};
const startAnimation = () => {
  const animate = () => {
    setTimeout(animate, framerate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    draw();
  };
  animate();
};
let lastFrame = Date.now();
startAnimation();
