// p5.js global interactive background
// This runs on all pages except p5.html

let siteParticles = [];

function setup() {
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.position(0, 0); // 固定位置
    canvas.style('position', 'fixed'); // スクロールしても追従する
    canvas.style('z-index', '1'); // 画像(0)と文字(2)の間に配置
    canvas.style('pointer-events', 'none'); // クリックを下の要素にパスする

    // 背景を透明にする
    clear();
}

function draw() {
    // 毎フレーム全体をクリア（透明背景での残像効果は難しいため、シンプルに消える効果のみ）
    clear();

    // パーティクルの更新と描画
    for (let i = siteParticles.length - 1; i >= 0; i--) {
        let p = siteParticles[i];
        p.update();
        p.display();
        // 寿命が尽きたら配列から削除
        if (p.isDead()) {
            siteParticles.splice(i, 1);
        }
    }
}

// マウスを動かしたときにパーティクルを生成
function mouseMoved() {
    let speed = dist(mouseX, mouseY, pmouseX, pmouseY);

    if (speed > 8) {
        let count = constrain(floor(map(speed, 8, 100, 1, 3)), 1, 3);
        for (let i = 0; i < count; i++) {
            siteParticles.push(new SiteParticle(mouseX, mouseY, speed));
        }
    }
}

// クリック長押し（ドラッグ）でも生成
function mouseDragged() {
    let speed = dist(mouseX, mouseY, pmouseX, pmouseY);

    if (speed > 4) {
        let count = constrain(floor(map(speed, 4, 100, 1, 4)), 1, 4);
        for (let i = 0; i < count; i++) {
            siteParticles.push(new SiteParticle(mouseX, mouseY, speed));
        }
    }
}

// ウィンドウがリサイズされたらキャンバスも合わせる
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    clear();
}

// --- パーティクルクラス ---
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
