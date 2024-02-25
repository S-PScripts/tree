
let area2 = document.querySelector('#area-out');


let pos = [];
let mpos = [0, 0];
let keys = [];
let vel = [0, 0];
let translate = '';
let width = 0;
let height = 0;
let center = [0, 0];
let lastPos = [0, 0];
let isMouse = false;
let zoom = 0.8;

let id = '';

let gen = (async () => {
    pos = await genTree(id);
});

if (area) {
    gen();
}

function down(e) {
    keys[e.key.toLowerCase()] = true;
};

function up(e) {
    keys[e.key.toLowerCase()] = false;
};

function mouseMove(e) {
    lastPos = [e.clientX, e.clientY];
    if (!isMouse) return;
    mpos[0] += e.clientX - center[0];
    mpos[1] += e.clientY - center[1];
    center = lastPos;
}

function mouseUp(e) {
    isMouse = false;
}

function mouseDown(e) {
    if (e.button == '2') return;
    isMouse = true;
    center = [e.clientX, e.clientY];
}

function wheel(e) {
    mpos[0] -= lastPos[0];
    mpos[1] -= lastPos[1];

    mpos[0] *= (1.005 ** -e.deltaY)
    mpos[1] *= (1.005 ** -e.deltaY)

    mpos[0] += lastPos[0];
    mpos[1] += lastPos[1];

    zoom *= (1.005 ** -e.deltaY)
}

function move() {
    width = area2.clientWidth;
    height = area.clientHeight;

    var isShift = keys['q'];
    vel[0] += ((keys['a'] ? 1 : 0) - (keys['d'] ? 1 : 0)) * (isShift ? 5 : 1);
    vel[1] += ((keys['w'] ? 1 : 0) - (keys['s'] ? 1 : 0)) * (isShift ? 5 : 1);

    vel[0] *= 0.9;
    vel[1] *= 0.9;

    mpos[0] += vel[0];
    mpos[1] += vel[1];

    translate = `translate(${mpos[0]}px,${mpos[1]}px) scale(${zoom},${zoom})`;
    
    area.style.transform = translate;
}

setInterval(move, 10);

window.addEventListener('keydown', down);
window.addEventListener('keyup', up);
window.addEventListener('wheel', wheel);
window.addEventListener('mousemove', mouseMove);
window.addEventListener('mousedown', mouseDown);
window.addEventListener('mouseup', mouseUp);