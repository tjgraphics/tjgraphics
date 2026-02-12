const canvas = document.getElementById("flowCanvas");
const ctx = canvas.getContext("2d");

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();


const deg = (a) => (Math.PI / 180) * a;
const rand = (a, b) => Math.floor(a + Math.random() * (b - a));


const opt = {
    particles: window.innerWidth > 1000 ? 1000 : 500,
    noiseScale: 0.009,
    angle: deg(-45),
    strokeWeight: 2,
    tail: 90,
};

let Particles = [];
let time = 0;



const noise = (() => {
    const permutation = [];
    for (let i = 0; i < 256; i++) permutation[i] = i;
    permutation.sort(() => Math.random() - 0.5);
    const p = permutation.concat(permutation);

    function fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    function lerp(t, a, b) {
        return a + t * (b - a);
    }

    function grad(hash, x, y, z) {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
        return (h & 1 ? -u : u) + (h & 2 ? -v : v);
    }

    return function (x, y, z) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const Z = Math.floor(z) & 255;

        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);

        const u = fade(x);
        const v = fade(y);
        const w = fade(z);

        const A = p[X] + Y;
        const AA = p[A] + Z;
        const AB = p[A + 1] + Z;
        const B = p[X + 1] + Y;
        const BA = p[B] + Z;
        const BB = p[B + 1] + Z;

        return lerp(
            w,
            lerp(
                v,
                lerp(u, grad(p[AA], x, y, z), grad(p[BA], x - 1, y, z)),
                lerp(u, grad(p[AB], x, y - 1, z), grad(p[BB], x - 1, y - 1, z))
            ),
            lerp(
                v,
                lerp(
                    u,
                    grad(p[AA + 1], x, y, z - 1),
                    grad(p[BA + 1], x - 1, y, z - 1)
                ),
                lerp(
                    u,
                    grad(p[AB + 1], x, y - 1, z - 1),
                    grad(p[BB + 1], x - 1, y - 1, z - 1)
                )
            )
        );
    };
})();

class Particle {
    constructor(x, y) {
        this.x = this.lx = x;
        this.y = this.ly = y;
        this.vx = this.vy = 0;
        this.ax = this.ay = 0;

        this.randomize();
    }

    randomize() {
        this.hue = 0;
        this.sat = 0;
        this.light = rand(60, 100);
        this.maxSpeed = Math.random() > 0.5 ? 1 : 0.5;
    }

    follow() {
        const angle =
            noise(
                this.x * opt.noiseScale,
                this.y * opt.noiseScale,
                time * opt.noiseScale
            ) *
                Math.PI *
                0.5 +
            opt.angle;

        this.ax += Math.cos(angle);
        this.ay += Math.sin(angle);
    }

    update() {
        this.follow();

        this.vx += this.ax;
        this.vy += this.ay;

        const speed = Math.hypot(this.vx, this.vy);
        const angle = Math.atan2(this.vy, this.vx);
        const m = Math.min(this.maxSpeed, speed);

        this.vx = Math.cos(angle) * m;
        this.vy = Math.sin(angle) * m;

        this.x += this.vx;
        this.y += this.vy;

        this.ax = this.ay = 0;

        this.edges();
    }

    edges() {
        if (this.x < 0) this.reset(canvas.width, this.y);
        if (this.x > canvas.width) this.reset(0, this.y);
        if (this.y < 0) this.reset(this.x, canvas.height);
        if (this.y > canvas.height) this.reset(this.x, 0);
    }

    reset(x, y) {
        this.x = this.lx = x;
        this.y = this.ly = y;
    }

    render() {
        ctx.strokeStyle = `hsla(${this.hue}, ${this.sat}%, ${this.light}%, 0.5)`;
        ctx.lineWidth = opt.strokeWeight;

        ctx.beginPath();
        ctx.moveTo(this.lx, this.ly);
        ctx.lineTo(this.x, this.y);
        ctx.stroke();

        this.lx = this.x;
        this.ly = this.y;
    }
}


function init() {
    Particles = [];
    for (let i = 0; i < opt.particles; i++) {
        Particles.push(
            new Particle(
                Math.random() * canvas.width,
                Math.random() * canvas.height
            )
        );
    }
}

init();

function fade() {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 3; i < data.length; i += 4) {
        if(data[i] > 4) {
            data[i] = data[i] * (opt.tail)/100;
        } else {
            data[i] = 0;
        }
        // if(data[i] !== 0 && i%1000 < 10) {
        //     console.log(data[i]);
        // }
    }
    ctx.putImageData(imageData, 0, 0);
}

function draw() {
    time++;

    fade()

    for (let p of Particles) {
        p.update();
        p.render();
    }

    requestAnimationFrame(draw);
}

draw();
