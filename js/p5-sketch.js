// p5.js playground sketch
// This runs on p5.html

let particles = [];

function setup() {
    // Canvasをウインドウサイズいっぱいに作成し、div(#p5-container)の中に配置
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('p5-container');

    // 背景を暗い色に
    background(10);
}

function draw() {
    // 毎フレーム薄く背景を塗りつぶすことで軌跡を残す（フェード効果）
    background(10, 10, 10, 40);

    // パーティクルの更新と描画
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.update();
        p.display();
        // 寿命が尽きたら配列から削除
        if (p.isDead()) {
            particles.splice(i, 1);
        }
    }
}

// マウスを動かしたときにパーティクルを生成
function mouseMoved() {
    // 1フレーム前からのマウス移動距離（速度）を計算
    let speed = dist(mouseX, mouseY, pmouseX, pmouseY);

    // ゆっくり動かしている時（速度が小さい時）は生成しない
    if (speed > 8) {
        // 速度が速いほど多く生成（最大3個まで）
        let count = constrain(floor(map(speed, 8, 100, 1, 3)), 1, 3);
        for (let i = 0; i < count; i++) {
            particles.push(new Particle(mouseX, mouseY, speed));
        }
    }
}

// クリック長押し（ドラッグ）でも生成
function mouseDragged() {
    let speed = dist(mouseX, mouseY, pmouseX, pmouseY);

    // ドラッグ時は少しだけ出やすくする
    if (speed > 4) {
        let count = constrain(floor(map(speed, 4, 100, 1, 4)), 1, 4);
        for (let i = 0; i < count; i++) {
            particles.push(new Particle(mouseX, mouseY, speed));
        }
    }
}

// ウィンドウがリサイズされたらキャンバスも合わせる
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    background(10);
}

// --- パーティクルクラス ---
class Particle {
    constructor(x, y, speed) {
        this.pos = createVector(x, y);

        // ランダムな方向に散るように速度を設定
        this.vel = p5.Vector.random2D();
        // マウスの速度に応じて飛び散る勢いを変化させる
        let maxVel = map(speed, 0, 100, 2, 8);
        this.vel.mult(random(maxVel * 0.5, maxVel));

        // 回転するための角度と回転スピード
        this.angle = random(TWO_PI);
        this.angleSpeed = random(-0.2, 0.2);

        // カラフルな色をランダムに
        this.color = color(random(100, 255), random(100, 255), random(100, 255));

        // 文字サイズと寿命（中間サイズに調整）
        this.size = random(15, 38);
        this.lifespan = 255;

        // 出現する文字をランダムに決定（☆ か ♫）
        this.char = random(["☆", "♫"]);
    }

    update() {
        this.pos.add(this.vel);
        this.angle += this.angleSpeed; // 回転させる
        this.lifespan -= 5; // 徐々に消えるスピード
    }

    display() {
        // 現在の座標系を保存
        push();
        // 原点をパーティクルの位置に移動
        translate(this.pos.x, this.pos.y);
        // 回転を適用
        rotate(this.angle);

        noStroke();
        // 寿命に応じて透明度を下げる
        fill(red(this.color), green(this.color), blue(this.color), this.lifespan);

        // テキストを描画
        textAlign(CENTER, CENTER);
        textSize(this.size);
        text(this.char, 0, 0);

        // 座標系を元に戻す
        pop();
    }

    isDead() {
        return this.lifespan < 0;
    }
}
