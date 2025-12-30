export class Santa {
    constructor(canvasHeight) {
        this.canvasHeight = canvasHeight;
        this.width = 120;
        this.height = 120;
        this.x = 50;
        this.y = this.canvasHeight - this.height - 50; // Initial ground position

        this.vy = 0;
        this.gravity = 0.6;
        this.jumpStrength = -18;
        this.isJumping = false;

        this.img = new Image();
        this.img.src = '/src/assets/santa.png';

        this.shirtlessImg = new Image();
        this.shirtlessImg.src = '/src/assets/santa_shirtless.png';

        this.brokeImg = new Image();
        this.brokeImg.src = '/src/assets/santa_broke.png';

        this.appearance = 'normal'; // normal, shirtless, broke
    }

    jump() {
        if (!this.isJumping) {
            this.vy = this.jumpStrength;
            this.isJumping = true;
        }
    }

    update() {
        this.y += this.vy;

        // Apply gravity only if in air
        if (this.y < this.canvasHeight - this.height - 50) {
            this.vy += this.gravity;
            this.isJumping = true;
        } else {
            this.vy = 0;
            this.y = this.canvasHeight - this.height - 50;
            this.isJumping = false;
        }
    }

    draw(ctx, isImmune = false) {
        ctx.save();
        if (isImmune) {
            ctx.globalAlpha = 0.5;
        }
        // Draw image
        let sprite = this.img;
        if (this.appearance === 'shirtless') sprite = this.shirtlessImg;
        if (this.appearance === 'broke') sprite = this.brokeImg;

        if (sprite.complete) { // Ensure image is loaded
            ctx.drawImage(sprite, this.x, this.y, this.width, this.height);
        } else {
            // Fallback
            ctx.fillStyle = 'red';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
        ctx.restore();
    }

    setAppearance(type) {
        this.appearance = type;
    }
}
