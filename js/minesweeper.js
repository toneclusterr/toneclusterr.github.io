function make2DArray(cols, rows) {
    var arr = new Array(cols);
    for (var i = 0; i < arr.length; i++) {
        arr[i] = new Array(rows);
    }
    return arr;
}

var grid;
var cols = 10;
var rows = 10;
var w = 40;
var totalBees = 15;
var firstClick = true;
var gameWon = false;

let siteParticles = [];

function setup() {
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('p5-container');

    canvas.position(0, 0);
    canvas.style('position', 'fixed');
    canvas.style('z-index', '1');

    canvas.elt.addEventListener('contextmenu', e => e.preventDefault());

    grid = make2DArray(cols, rows);
    for (var i = 0; i < cols; i++) {
        for (var j = 0; j < rows; j++) {
            grid[i][j] = new Cell(i, j, w);
        }
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function gameOver() {
    for (var i = 0; i < cols; i++) {
        for (var j = 0; j < rows; j++) {
            grid[i][j].revealed = true;
        }
    }
}

function placeBees(firstI, firstJ) {
    var options = [];
    for (var i = 0; i < cols; i++) {
        for (var j = 0; j < rows; j++) {
            if (abs(i - firstI) <= 1 && abs(j - firstJ) <= 1) {
                continue;
            }
            options.push([i, j]);
        }
    }

    for (var n = 0; n < totalBees; n++) {
        var index = floor(random(options.length));
        var choice = options[index];
        var i = choice[0];
        var j = choice[1];
        options.splice(index, 1);
        grid[i][j].bee = true;
    }

    for (var i = 0; i < cols; i++) {
        for (var j = 0; j < rows; j++) {
            grid[i][j].countBees();
        }
    }
}

function checkWin() {
    var revealedCount = 0;
    for (var i = 0; i < cols; i++) {
        for (var j = 0; j < rows; j++) {
            if (grid[i][j].revealed && !grid[i][j].bee) {
                revealedCount++;
            }
        }
    }
    if (revealedCount === (cols * rows) - totalBees) {
        gameWon = true;
        for (var i = 0; i < cols; i++) {
            for (var j = 0; j < rows; j++) {
                if (grid[i][j].bee) {
                    grid[i][j].flagged = true;
                }
            }
        }
    }
}

function mousePressed() {
    let xOffset = (width - cols * w) / 2;
    let yOffset = (height - rows * w) / 2;
    let adjX = mouseX - xOffset;
    let adjY = mouseY - yOffset;

    for (var i = 0; i < cols; i++) {
        for (var j = 0; j < rows; j++) {
            if (grid[i][j].contains(adjX, adjY)) {
                if (gameWon) return;

                let isGameOver = false;
                for (let cx = 0; cx < cols; cx++) {
                    for (let cy = 0; cy < rows; cy++) {
                        if (grid[cx][cy].revealed && grid[cx][cy].bee && !grid[cx][cy].flagged) isGameOver = true;
                    }
                }
                if (isGameOver) return;

                if (mouseButton === RIGHT) {
                    if (!grid[i][j].revealed) {
                        grid[i][j].flagged = !grid[i][j].flagged;
                    }
                } else if (mouseButton === LEFT || mouseButton === CENTER) {
                    if (!grid[i][j].flagged) {
                        if (firstClick) {
                            placeBees(i, j);
                            firstClick = false;
                        }

                        grid[i][j].reveal();
                        if (grid[i][j].bee) {
                            gameOver();
                        } else {
                            checkWin();
                        }
                    }
                }
            }
        }
    }
}

function mouseMoved() {
    let speed = dist(mouseX, mouseY, pmouseX, pmouseY);
    if (speed > 8) {
        let count = constrain(floor(map(speed, 8, 100, 1, 3)), 1, 3);
        for (let i = 0; i < count; i++) {
            siteParticles.push(new SiteParticle(mouseX, mouseY, speed));
        }
    }
}

function mouseDragged() {
    let speed = dist(mouseX, mouseY, pmouseX, pmouseY);
    if (speed > 4) {
        let count = constrain(floor(map(speed, 4, 100, 1, 4)), 1, 4);
        for (let i = 0; i < count; i++) {
            siteParticles.push(new SiteParticle(mouseX, mouseY, speed));
        }
    }
}

function draw() {
    background(0);

    for (let i = siteParticles.length - 1; i >= 0; i--) {
        let p = siteParticles[i];
        p.update();
        p.display();
        if (p.isDead()) {
            siteParticles.splice(i, 1);
        }
    }

    let xOffset = (width - cols * w) / 2;
    let yOffset = (height - rows * w) / 2;

    push();
    translate(xOffset, yOffset);
    for (var i = 0; i < cols; i++) {
        for (var j = 0; j < rows; j++) {
            grid[i][j].show();
        }
    }

    if (gameWon) {
        fill(0, 0, 0, 150);
        rect(0, 0, cols * w, rows * w);

        textAlign(CENTER, CENTER);

        fill(0);
        textSize(36);
        textStyle(BOLD);
        text("congrats!", cols * w / 2 + 2, rows * w / 2 - 20 + 2);
        text("you win XD", cols * w / 2 + 2, rows * w / 2 + 20 + 2);

        fill(255, 255, 0);
        text("congrats!", cols * w / 2, rows * w / 2 - 20);
        text("you win XD", cols * w / 2, rows * w / 2 + 20);
    }
    pop();
}

class SiteParticle {
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

class Cell {
    constructor(i, j, w) {
        this.i = i;
        this.j = j;
        this.x = i * w;
        this.y = j * w;
        this.w = w;
        this.neighborCount = 0;
        this.bee = false;
        this.revealed = false;
        this.flagged = false;
    }

    show() {
        let isPressed = this.revealed;
        noStroke();

        if (isPressed) {
            fill(192);
            rect(this.x, this.y, this.w, this.w);
            stroke(128);
            strokeWeight(1);
            noFill();
            rect(this.x, this.y, this.w, this.w);
            noStroke();
        } else {
            fill(192);
            rect(this.x, this.y, this.w, this.w);
            let b = this.w * 0.1;
            fill(255);
            beginShape(); vertex(this.x, this.y); vertex(this.x + this.w, this.y); vertex(this.x + this.w - b, this.y + b); vertex(this.x + b, this.y + b); vertex(this.x + b, this.y + this.w - b); vertex(this.x, this.y + this.w); endShape(CLOSE);
            fill(128);
            beginShape(); vertex(this.x, this.y + this.w); vertex(this.x + this.w, this.y + this.w); vertex(this.x + this.w, this.y); vertex(this.x + this.w - b, this.y + b); vertex(this.x + this.w - b, this.y + this.w - b); vertex(this.x + b, this.y + this.w - b); endShape(CLOSE);
        }

        if (this.revealed) {
            if (this.bee) {
                fill(0);
                ellipse(this.x + this.w * 0.5, this.y + this.w * 0.5, this.w * 0.5);
                fill(255);
                rect(this.x + this.w * 0.35, this.y + this.w * 0.35, this.w * 0.1, this.w * 0.1);
            } else if (this.neighborCount > 0) {
                const colors = [
                    null,
                    [0, 0, 255],
                    [0, 128, 0],
                    [255, 0, 0],
                    [0, 0, 128],
                    [128, 0, 0],
                    [0, 128, 128],
                    [0, 0, 0],
                    [128, 128, 128]
                ];
                textAlign(CENTER, CENTER);
                textFont('Arial');
                textStyle(BOLD);
                let c = colors[this.neighborCount] || [0, 0, 0];
                fill(c[0], c[1], c[2]);
                textSize(this.w * 0.6);
                text(this.neighborCount, this.x + this.w * 0.5, this.y + this.w * 0.5 + 2);
            }
        } else if (this.flagged) {
            fill(0);
            rect(this.x + this.w * 0.45, this.y + this.w * 0.3, this.w * 0.05, this.w * 0.4);
            rect(this.x + this.w * 0.3, this.y + this.w * 0.7, this.w * 0.4, this.w * 0.1);
            rect(this.x + this.w * 0.35, this.y + this.w * 0.65, this.w * 0.3, this.w * 0.05);
            fill(255, 0, 0);
            triangle(this.x + this.w * 0.45, this.y + this.w * 0.25,
                this.x + this.w * 0.45, this.y + this.w * 0.5,
                this.x + this.w * 0.15, this.y + this.w * 0.4);
        }
    }

    countBees() {
        if (this.bee) {
            this.neighborCount = -1;
            return;
        }
        var total = 0;
        for (var xoff = -1; xoff <= 1; xoff++) {
            for (var yoff = -1; yoff <= 1; yoff++) {
                var i = this.i + xoff;
                var j = this.j + yoff;
                if (i > -1 && i < cols && j > -1 && j < rows) {
                    var neighbor = grid[i][j];
                    if (neighbor.bee) {
                        total++;
                    }
                }
            }
        }
        this.neighborCount = total;
    }

    contains(x, y) {
        return (x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.w);
    }

    reveal() {
        this.revealed = true;
        if (this.neighborCount == 0) {
            this.floodFill();
        }
    }

    floodFill() {
        for (var xoff = -1; xoff <= 1; xoff++) {
            for (var yoff = -1; yoff <= 1; yoff++) {
                var i = this.i + xoff;
                var j = this.j + yoff;
                if (i > -1 && i < cols && j > -1 && j < rows) {
                    var neighbor = grid[i][j];
                    if (!neighbor.revealed && !neighbor.bee && !neighbor.flagged) {
                        neighbor.reveal();
                    }
                }
            }
        }
    }
}
