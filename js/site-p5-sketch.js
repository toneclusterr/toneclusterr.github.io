const siteParticlesSketch = (p) => {
    let siteParticles = [];

    p.setup = () => {
        let canvas = p.createCanvas(p.windowWidth, p.windowHeight);
        canvas.position(0, 0);
        canvas.style('position', 'fixed');
        canvas.style('z-index', '1');
        canvas.style('pointer-events', 'none');
        p.clear();
    };

    p.draw = () => {
        p.clear();
        for (let i = siteParticles.length - 1; i >= 0; i--) {
            let pt = siteParticles[i];
            pt.update();
            pt.display(p);
            if (pt.isDead()) {
                siteParticles.splice(i, 1);
            }
        }
    };

    p.mouseMoved = () => {
        let speed = p.dist(p.mouseX, p.mouseY, p.pmouseX, p.pmouseY);
        if (speed > 8) {
            let count = p.constrain(p.floor(p.map(speed, 8, 100, 1, 3)), 1, 3);
            for (let i = 0; i < count; i++) {
                siteParticles.push(new SiteParticle(p.mouseX, p.mouseY, speed, p));
            }
        }
    };

    p.mouseDragged = () => {
        let speed = p.dist(p.mouseX, p.mouseY, p.pmouseX, p.pmouseY);
        if (speed > 4) {
            let count = p.constrain(p.floor(p.map(speed, 4, 100, 1, 4)), 1, 4);
            for (let i = 0; i < count; i++) {
                siteParticles.push(new SiteParticle(p.mouseX, p.mouseY, speed, p));
            }
        }
    };

    p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
        p.clear();
    };

    class SiteParticle {
        constructor(x, y, speed, pInstance) {
            this.pos = pInstance.createVector(x, y);
            this.vel = pInstance.createVector(pInstance.random(-1, 1), pInstance.random(-1, 1)).normalize();
            let maxVel = pInstance.map(speed, 0, 100, 2, 8);
            this.vel.mult(pInstance.random(maxVel * 0.5, maxVel));
            this.angle = pInstance.random(pInstance.TWO_PI);
            this.angleSpeed = pInstance.random(-0.2, 0.2);
            this.color = pInstance.color(pInstance.random(100, 255), pInstance.random(100, 255), pInstance.random(100, 255));
            this.size = pInstance.random(15, 38);
            this.lifespan = 255;
            this.char = pInstance.random(["☆", "♫"]);
        }

        update() {
            this.pos.add(this.vel);
            this.angle += this.angleSpeed;
            this.lifespan -= 5;
        }

        display(pInstance) {
            pInstance.push();
            pInstance.translate(this.pos.x, this.pos.y);
            pInstance.rotate(this.angle);
            pInstance.noStroke();
            pInstance.fill(pInstance.red(this.color), pInstance.green(this.color), pInstance.blue(this.color), this.lifespan);
            pInstance.textAlign(pInstance.CENTER, pInstance.CENTER);
            pInstance.textSize(this.size);
            pInstance.text(this.char, 0, 0);
            pInstance.pop();
        }

        isDead() {
            return this.lifespan < 0;
        }
    }
};

new p5(siteParticlesSketch);
