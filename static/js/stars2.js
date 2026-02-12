const STAR_COLOR = "#fff";
const STAR_SIZE = 2;
const STAR_MIN_SCALE = 0.2;
const OVERFLOW_THRESHOLD = 50;
const STAR_COUNT = (window.innerWidth + window.innerHeight) / 4;

const canvas = document.getElementById("starCanvas");
let context = canvas.getContext("2d");

let scale = 1, // device pixel ratio
    width,
    height;

let stars = [];

let pointerX, pointerY;

let velocity = { x: 0, y: 0, tx: 0, ty: 0, z: 0.0015 };

let lengthFactor = 10;

let touchInput = false;

let smoothDX = 0;
let smoothDY = 0;

generate();
resize();
step();

window.onresize = resize;
canvas.onmousemove = onMouseMove;
canvas.ontouchmove = onTouchMove;
canvas.ontouchend = onMouseLeave;
document.onmouseleave = onMouseLeave;

function generate() {
    for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
            x: 0,
            y: 0,
            z: STAR_MIN_SCALE + Math.random() * (1 - STAR_MIN_SCALE),
            trail: []   // NEW
        });
    }
}

function placeStar(star) {
    star.x = Math.random() * width;
    star.y = Math.random() * height;
}

function recycleStar(star) {
    let direction = "z";

    let vx = Math.abs(velocity.x),
        vy = Math.abs(velocity.y);

    if (vx > 1 || vy > 1) {
        let axis;

        if (vx > vy) {
            axis = Math.random() < vx / (vx + vy) ? "h" : "v";
        } else {
            axis = Math.random() < vy / (vx + vy) ? "v" : "h";
        }

        if (axis === "h") {
            direction = velocity.x > 0 ? "l" : "r";
        } else {
            direction = velocity.y > 0 ? "t" : "b";
        }
    }

    star.z = STAR_MIN_SCALE + Math.random() * (1 - STAR_MIN_SCALE);

    if (direction === "z") {
        star.z = 0.1;
        star.x = Math.random() * width;
        star.y = Math.random() * height;
    } else if (direction === "l") {
        star.x = -OVERFLOW_THRESHOLD;
        star.y = height * Math.random();
    } else if (direction === "r") {
        star.x = width + OVERFLOW_THRESHOLD;
        star.y = height * Math.random();
    } else if (direction === "t") {
        star.x = width * Math.random();
        star.y = -OVERFLOW_THRESHOLD;
    } else if (direction === "b") {
        star.x = width * Math.random();
        star.y = height + OVERFLOW_THRESHOLD;
    }
    star.trail = [];
}

function resize() {
    scale = window.devicePixelRatio || 1;

    width = window.innerWidth * scale;
    height = window.innerHeight * scale;

    canvas.width = width;
    canvas.height = height;

    stars.forEach(placeStar);
}

function step() {
    context.clearRect(0, 0, width, height);

    update();
    render();

    requestAnimationFrame(step);
}

function update() {
    velocity.tx *= 0.97;
    velocity.ty *= 0.97;

    velocity.x += (velocity.tx - velocity.x) * 0.9;
    velocity.y += (velocity.ty - velocity.y) * 0.9;

    stars.forEach((star) => {
        star.x += velocity.x * star.z * 0.2;
        star.y += velocity.y * star.z * 0.2;

        star.x += (star.x - width / 2) * velocity.z * star.z;
        star.y += (star.y - height / 2) * velocity.z * star.z;
        star.z += velocity.z;

        star.trail.push({ x: star.x, y: star.y });

        // limit trail length based on star depth
        const maxLength = Math.floor(lengthFactor * star.z);
        if (star.trail.length > maxLength) {
            star.trail.shift();
        }

        // recycle when out of bounds
        if (
            star.x < -OVERFLOW_THRESHOLD ||
            star.x > width + OVERFLOW_THRESHOLD ||
            star.y < -OVERFLOW_THRESHOLD ||
            star.y > height + OVERFLOW_THRESHOLD
        ) {
            recycleStar(star);
        }
    });
}

function render() {
    stars.forEach((star) => {
        context.beginPath();
        context.lineCap = "round";
        context.lineWidth = STAR_SIZE * star.z * scale;
        context.globalAlpha = 0.5 + 0.5 * Math.random();
        context.strokeStyle = STAR_COLOR;

        context.beginPath();
        let trail = star.trail;

        if (trail.length > 1) {
            context.moveTo(trail[0].x, trail[0].y);

            for (let i = 1; i < trail.length - 1; i++) {
                let xc = (trail[i].x + trail[i + 1].x) / 2;
                let yc = (trail[i].y + trail[i + 1].y) / 2;
                context.quadraticCurveTo(trail[i].x, trail[i].y, xc, yc);
            }

            // last segment
            let last = trail[trail.length - 1];
            context.lineTo(last.x, last.y);
        } else {
            context.moveTo(star.x, star.y);
            context.lineTo(star.x + 0.5, star.y + 0.5);
        }
        context.stroke();
    });
}

function movePointer(x, y) {
    if (typeof pointerX === "number" && typeof pointerY === "number") {
        let ox = x - pointerX,
            oy = y - pointerY;

        // Smooth the raw mouse delta (low-pass filter)
        smoothDX += (ox - smoothDX) * 0.08;
        smoothDY += (oy - smoothDY) * 0.08;

        // Apply the SMOOTHED delta instead of raw
        velocity.tx += (smoothDX / 50) * scale * (touchInput ? 1 : -1);
        velocity.ty += (smoothDY / 50) * scale * (touchInput ? 1 : -1);
    }

    pointerX = x;
    pointerY = y;
}

function onMouseMove(event) {
    touchInput = false;

    movePointer(event.clientX, event.clientY);
}

function onTouchMove(event) {
    touchInput = true;

    movePointer(event.touches[0].clientX, event.touches[0].clientY, true);

    event.preventDefault();
}

function onMouseLeave() {
    pointerX = null;
    pointerY = null;
}
