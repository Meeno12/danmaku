var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = window.innerHeight / 1.3;
canvas.height = window.innerHeight;
canvas.oncontextmenu = function () {
    return false;
};
ctx.fillStyle = "white";
ctx.strokeStyle = "white";
ctx.lineWidth = 5;
document.body.append(canvas);
var Vector = /** @class */ (function () {
    function Vector(x, y) {
        this.x = x;
        this.y = y;
    }
    Vector.prototype.setPosition = function (x, y) {
        this.x = x;
        this.y = y;
    };
    return Vector;
}());
var drawCircle = function (pos, r) {
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
    ctx.fill();
};
var TWO_PI = Math.PI * 2;
var polygon = function (pos, r, n) {
    var angle = TWO_PI / n;
    var res = [];
    for (var i = 0; i < TWO_PI; i += angle) {
        res.push(new Vector(pos.x + Math.cos(i) * r, pos.y + Math.sin(i) * r));
    }
    return res;
};
var drawShape = function (points) {
    ctx.beginPath();
    for (var i = 0; i < points.length; i++) {
        var v = points[i];
        ctx.lineTo(v.x, v.y);
    }
    ctx.fill();
};
var rotatePoints = function (points, deg, ogPoint) {
    var val = deg / 100;
    for (var i = 0; i < points.length; i++) {
        var point = points[i];
        point.setPosition(Math.cos(val) * (point.x - ogPoint.x) -
            Math.sin(val) * (point.y - ogPoint.y) +
            ogPoint.x, Math.sin(val) * (point.x - ogPoint.x) +
            Math.cos(val) * (point.y - ogPoint.y) +
            ogPoint.y);
    }
};
var rand = function (limit, rounded) {
    var val = Math.random() * limit;
    if (rounded)
        return Math.round(val);
    return val;
};
/*
 *WORKING SPACE BELOW
 */
var Spawn = /** @class */ (function (_super) {
    __extends(Spawn, _super);
    function Spawn(x, y, direction) {
        var _this = _super.call(this, x, y) || this;
        _this.direction = direction;
        _this.interval = 0;
        return _this;
    }
    Spawn.prototype.setDirection = function (newVal) {
        this.direction = newVal;
    };
    Spawn.prototype.fire = function (bulletSpeed, bulletSize) {
        bullets.push(new Bullet(this.x, this.y, this.direction, {
            r: bulletSize,
            speed: bulletSpeed,
        }));
    };
    Spawn.prototype.startFire = function (bulletSpeed, bulletPerSec, bulletSize) {
        var _this = this;
        this.interval = setInterval(function () {
            _this.fire(bulletSpeed, bulletSize);
        }, 1000 / bulletPerSec);
    };
    Spawn.prototype.stopBullet = function () {
        clearInterval(this.interval);
    };
    return Spawn;
}(Vector));
var Bullet = /** @class */ (function (_super) {
    __extends(Bullet, _super);
    function Bullet(x, y, direction, options) {
        var _this = _super.call(this, x, y) || this;
        _this.direction = direction;
        _this.speed = options.speed ? options.speed : 3;
        _this.r = options.r ? options.r : 3;
        return _this;
    }
    Bullet.prototype.update = function () {
        this.x = this.x + this.speed * Math.cos(this.direction);
        this.y = this.y + this.speed * Math.sin(this.direction);
    };
    Bullet.prototype.inBorder = function () {
        if (this.x + this.r < 0 ||
            this.x - this.r > canvas.width ||
            this.y + this.r < 0 ||
            this.y - this.r > canvas.height) {
            return false;
        }
        return true;
    };
    return Bullet;
}(Vector));
var Danmaku = /** @class */ (function (_super) {
    __extends(Danmaku, _super);
    function Danmaku(x, y, options) {
        var _this = _super.call(this, x, y) || this;
        _this.r = options.r ? options.r : 30;
        _this.rotation = options.rotationSpeed ? options.rotationSpeed : 10;
        _this.spawns = polygon(_this, _this.r, options.spawner ? options.spawner : 6).map(function (point) {
            var angle = Math.atan2(point.y - _this.y, point.x - _this.x);
            var spawn = new Spawn(point.x, point.y, angle);
            setTimeout(function () {
                return spawn.startFire(options.bulletSpeed ? options.bulletSpeed : 2, options.bulletPerSec ? options.bulletPerSec : 5, options.bulletSize ? options.bulletSize : 3);
            }, 0.3);
            return spawn;
        });
        return _this;
    }
    Danmaku.prototype.update = function () {
        var _this = this;
        rotatePoints(this.spawns, this.rotation, this);
        this.spawns.forEach(function (spawn) {
            spawn.setDirection(Math.atan2(spawn.y - _this.y, spawn.x - _this.x));
            drawCircle(spawn, 2);
        });
    };
    Danmaku.prototype.setPosition = function (x, y) {
        var _this = this;
        this.spawns.forEach(function (spawn) {
            spawn.setPosition(spawn.x - _this.x - x, spawn.y - _this.y - y);
        });
        this.x = x;
        this.y = y;
    };
    return Danmaku;
}(Vector));
var mouse = new Vector(0, 0);
canvas.addEventListener("mousemove", function (e) {
    mouse.setPosition(e.x, e.y);
});
var bullets = [];
var options = {
    r: 1,
    rotationSpeed: 7,
    spawner: 2,
    bulletPerSec: 60,
    bulletSpeed: 4,
    bulletSize: 5,
    bulletAge: 2,
};
var danmaku = new Danmaku(canvas.width / 2, canvas.height / 2, options);
var danmaku1 = new Danmaku(canvas.width / 2, canvas.height / 2, __assign(__assign({}, options), { rotationSpeed: options.rotationSpeed * -1 }));
var draw = function () {
    drawCircle(mouse, 5);
    danmaku.update();
    danmaku1.update();
    for (var i = 0; i < bullets.length; i++) {
        var bullet = bullets[i];
        bullet.update();
        if (bullet.inBorder()) {
            drawCircle(bullet, bullet.r);
        }
        else {
            delete bullets[i];
            bullets.splice(i, 1);
        }
    }
};
var startAnimation = function () {
    var framerate = 1000 / 60;
    var animate = function () {
        // requestAnimationFrame(animate);
        setTimeout(animate, framerate);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        draw();
    };
    animate();
};
startAnimation();
