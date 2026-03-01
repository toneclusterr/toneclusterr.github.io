let particles = [];

function setup() {
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('p5-container');

    background(10);
}

function draw() {
    background(10, 10, 10, 40);

    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.update();
        p.display();
        if (p.isDead()) {
            particles.splice(i, 1);
        }
    }
}

function mouseMoved() {
    let speed = dist(mouseX, mouseY, pmouseX, pmouseY);

    if (speed > 8) {
        let count = constrain(floor(map(speed, 8, 100, 1, 3)), 1, 3);
        for (let i = 0; i < count; i++) {
            particles.push(new Particle(mouseX, mouseY, speed));
        }
    }
}

function mouseDragged() {
    let speed = dist(mouseX, mouseY, pmouseX, pmouseY);

    if (speed > 4) {
        let count = constrain(floor(map(speed, 4, 100, 1, 4)), 1, 4);
        for (let i = 0; i < count; i++) {
            particles.push(new Particle(mouseX, mouseY, speed));
        }
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    background(10);
}

class Particle {
    constructor(x, y, speed) {
        this.pos = createVector(x, y);

        this.vel = p5.Vector.random2D();
        let maxVel = map(speed, 0, 100, 2, 8);
        this.vel.mult(random(maxVel * 0.5, maxVel));

        this.angle = random(TWO_PI);
        this.angleSpeed = random(-0.2, 0.2);

        this.color = color(random(100, 255), random(100, 255), random(100, 255));

        this.size = random(15, 38);
        this.lifespan = 255;

        this.char = random(["☆", "♫"]);
    }

    update() {
        this.pos.add(this.vel);
        this.angle += this.angleSpeed;
        this.lifespan -= 5;
    }

    display() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.angle);

        noStroke();
        fill(red(this.color), green(this.color), blue(this.color), this.lifespan);

        textAlign(CENTER, CENTER);
        textSize(this.size);
        text(this.char, 0, 0);

        pop();
    }

    isDead() {
        return this.lifespan < 0;
    }
}
