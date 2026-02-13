const canvas = document.getElementById("waveCanvas");
const ctx = canvas.getContext("2d");

const LOGICAL_SIZE = 1000;

function resize() {
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width;
    canvas.height = rect.height;

    ctx.setTransform(1, 0, 0, 1, 0, 0);

    const scale = Math.min(
        rect.width / LOGICAL_SIZE,
        rect.height / LOGICAL_SIZE
    );

    const offsetX = -(rect.width / LOGICAL_SIZE) * (rect.width - LOGICAL_SIZE) / 2;

    //Super scuffed centering
    const offsetY = (rect.height / LOGICAL_SIZE) * ((rect.height - LOGICAL_SIZE) / 2 - rect.height/2) + rect.height/2 + 5*(rect.height)**(0.33);

    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);
}

window.addEventListener("resize", resize);
resize();


let time = 0;

const gridSize = 12;
const spacing = 24;
const amplitude = 50;

const cameraDistance = 1000;
const tiltX = 0.6;
const tiltY = -0.6;

function project(x, y, z) {
    let x1 = x * Math.cos(tiltY) - z * Math.sin(tiltY);
    let z1 = x * Math.sin(tiltY) + z * Math.cos(tiltY);

    let y1 = y * Math.cos(tiltX) - z1 * Math.sin(tiltX);
    let z2 = y * Math.sin(tiltX) + z1 * Math.cos(tiltX);

    const scale = cameraDistance / (cameraDistance + z2);

    return {
        x: x1 * scale + canvas.width / 2,
        y: y1 * scale + canvas.height / 2
    };
}

function heightFunction(x, z, t) {
    // Wave ONLY propagates along X axis
    return Math.sin(x * 0.25 - t * 0.6);
}

function draw() {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;

    for (let z = -gridSize; z <= gridSize; z++) {
        ctx.beginPath();

        for (let x = -gridSize; x <= gridSize; x++) {
            let worldX = x * spacing;
            let worldZ = z * spacing;

            let y = heightFunction(x, z, time) * amplitude;

            let p = project(worldX, y, worldZ);

            if (x === -gridSize)
                ctx.moveTo(p.x, p.y);
            else
                ctx.lineTo(p.x, p.y);
        }

        ctx.stroke();
    }

    for (let x = -gridSize; x <= gridSize; x++) {
        ctx.beginPath();

        for (let z = -gridSize; z <= gridSize; z++) {
            let worldX = x * spacing;
            let worldZ = z * spacing;

            let y = heightFunction(x, z, time) * amplitude;

            let p = project(worldX, y, worldZ);

            if (z === -gridSize)
                ctx.moveTo(p.x, p.y);
            else
                ctx.lineTo(p.x, p.y);
        }

        ctx.stroke();
    }

    time += 0.02;
    requestAnimationFrame(draw);
}

draw();