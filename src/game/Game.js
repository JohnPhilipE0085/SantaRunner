import { Santa } from './Santa.js';
import { ObstacleManager } from './ObstacleManager.js';
import { Audio } from './Audio.js';

export class Game {
    constructor(canvas, ui) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.ui = ui;

        // Set canvas resolution
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.audio = new Audio(); // Initialize audio

        // Handle resize
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            // Ensure ground level is consistent (though restarting is cleaner for simple games)
            if (!this.isRunning && !this.isGameOver) {
                this.santa.canvasHeight = this.canvas.height;
                this.santa.y = this.canvas.height - this.santa.height - 50;
            }
        });

        this.santa = new Santa(this.canvas.height);
        this.obstacleManager = new ObstacleManager(this.canvas.width, this.canvas.height);

        this.gameSpeed = 5;
        this.initialSpeed = 5;
        this.score = 0;
        this.wallet = 3000;
        this.isRunning = false;
        this.isGameOver = false;
        this.victory = false;
        this.animationId = null;

        // Milestones
        this.milestone1Reached = false; // 50
        this.milestone2Reached = false; // 250
        this.milestone3Reached = false; // 500
        this.milestone4Reached = false; // 550
        this.event400Reached = false; // 400 (New 21st Week)

        // Custom Events
        this.event100Reached = false;
        this.event110Reached = false;
        this.event120Reached = false;

        // Background scroll
        this.groundImage = new Image();
        this.groundImage.src = '/src/assets/ground.png';
        this.bgX = 0;

        // Coin
        this.coinImage = new Image();
        this.coinImage.src = '/src/assets/coin.png';
        this.coin = {
            active: false,
            x: 0,
            y: 0,
            width: 40,
            height: 40,
            collected: false
        };
        this.coinSpawned = false;

        this.loop = this.loop.bind(this);
        this.immunityTimer = 0;
    }

    start() {
        if (this.isRunning) return;

        // Reset state
        this.isRunning = true;
        this.isGameOver = false;
        this.isRunning = true;
        this.isGameOver = false;
        this.victory = false;
        this.score = 0;
        this.wallet = 3000;
        this.milestone1Reached = false;
        this.milestone2Reached = false;
        this.milestone3Reached = false;
        this.milestone4Reached = false;
        this.event400Reached = false;
        this.event100Reached = false;
        this.event110Reached = false;
        this.event120Reached = false;
        this.event130Reached = false;
        this.event200Reached = false;
        this.event1180Reached = false;
        this.event13021Reached = false;

        this.ui.updateWallet(this.wallet);
        this.gameSpeed = this.initialSpeed;
        this.santa = new Santa(this.canvas.height);
        this.obstacleManager.reset();
        this.obstacleManager.reset();
        this.bgX = 0;

        // Reset Coin
        this.coin.active = false;
        this.coin.collected = false;
        this.coinSpawned = false;

        this.ui.showScoreBoard();
        this.ui.hideStartScreen();
        this.ui.hideGameOverScreen();
        this.ui.hideVictoryScreen();
        this.ui.hideNotification();

        this.loop();
    }

    stop() {
        this.isRunning = false;
        cancelAnimationFrame(this.animationId);
    }

    gameOver() {
        this.stop();
        this.isGameOver = true;
        this.ui.showGameOverScreen(Math.floor(this.score), this.wallet);
    }

    revive() {
        if (this.isRunning) return; // Prevent multiple loops
        if (this.wallet >= 1000) {
            this.wallet -= 1000;
            this.ui.updateWallet(this.wallet);

            this.isGameOver = false;
            this.isRunning = true;
            this.immunityTimer = 180; // 3 seconds immunity

            // Hard reset speed to a manageable level
            this.gameSpeed = 6;

            // Clear obstacles and reset spawner
            this.obstacleManager.prepareRevive(this.santa.x);
            // Ensure building flag allows respawn if we died before it (though unrelated, good hygiene)
            this.obstacleManager.buildingSpawned = false;

            // Reset jump state just in case
            this.santa.y = this.canvas.height - this.santa.height - 50;
            this.santa.vy = 0;
            this.santa.isJumping = false;

            this.ui.hideGameOverScreen();
            this.loop();
        }
    }


    winGame() {
        this.stop();
        this.victory = true;
        this.audio.playScore(); // Or a specific victory sound if we had one
        this.ui.showVictoryScreen();
    }

    handleInput() {
        if (this.isRunning) {
            if (!this.santa.isJumping) {
                this.santa.jump();
                this.audio.playJump();
            }
        } else if (this.isGameOver || this.victory) {
            // Only restart if revive is NOT available or specifically requested
            // But since we use space for jump, let's block space-restart if we can revive?
            // Actually, keep it simple. If Game Over, Space = Restart.
            // But user might accidentally press it. Let's make Space restart only if wallet < 1000?
            // Or imply they need to click the button. 
            // Let's rely on the button for Revive and Button for Restart. Space shouldn't auto-restart if Revive is an option.

            // Current behavior: Space calls start(). 
            // Fix: Do NOT call start() via Space on GameOver. Use UI buttons.

            // Original code: this.start();
            // New code: Do nothing here, forcing user to click UI.
        } else {
            this.start();
        }
    }

    update() {
        if (!this.isRunning) return;

        this.santa.update();
        // Calculate score early or use currentScore from previous frame, 
        // but better to use the one about to be calculated or just current rough value.
        // Actually score is updated further down. Let's move score calculation up or use `this.score`.
        this.obstacleManager.update(this.gameSpeed, Math.floor(this.score));

        if (this.immunityTimer > 0) {
            this.immunityTimer--;
        } else {
            const collisionResult = this.obstacleManager.checkCollision(this.santa);
            if (collisionResult === 'victory') {
                this.winGame();
                return;
            } else if (collisionResult) {
                this.audio.playGameOver();
                this.gameOver();
                return;
            }
        }

        // Increase speed and score
        this.gameSpeed += 0.003;
        this.score += 0.1;
        const currentScore = Math.floor(this.score);

        // Custom Events
        // DSA Repeat events removed as per request
        if (currentScore >= 110 && !this.event110Reached) {
            this.event110Reached = true;
            this.ui.showNotification("DSA Week");
            this.audio.playMilestone();
        }

        // Check for Santa appearance based on wallet
        if (this.wallet <= 0) {
            this.santa.setAppearance('broke');
        } else if (this.wallet <= 1000) {
            this.santa.setAppearance('shirtless');
        } else {
            this.santa.setAppearance('normal');
        }









        // Coin Logic
        if (currentScore >= 180 && !this.coinSpawned) {
            this.coinSpawned = true;
            this.coin.active = true;
            this.coin.x = this.canvas.width;
            this.coin.y = this.canvas.height - 200; // Lowered from 250 to avoid trees/be easier
            this.coin.collected = false;
        }

        if (this.coin.active) {
            this.coin.x -= this.gameSpeed;

            // Check Collision
            if (!this.coin.collected &&
                this.santa.x < this.coin.x + this.coin.width &&
                this.santa.x + this.santa.width > this.coin.x &&
                this.santa.y < this.coin.y + this.coin.height &&
                this.santa.y + this.santa.height > this.coin.y
            ) {
                this.coin.collected = true;
                this.coin.active = false;
                this.wallet += 5000;
                this.ui.updateWallet(this.wallet);
                this.ui.showNotification("Won Linked In Competition +5000");
                this.audio.playScore(); // Reuse score sound
            }

            // Remove if off screen
            if (this.coin.x + this.coin.width < 0) {
                this.coin.active = false;
            }
        }

        // Milestones
        if (currentScore >= 75 && !this.milestone1Reached) {
            this.milestone1Reached = true;
            this.ui.showNotification("Congratulations on completing Week 1-6!");
            this.audio.playMilestone();
        }

        if (currentScore >= 400 && !this.event400Reached) {
            this.event400Reached = true;
            this.ui.showNotification("Congratulations on passing the 21st Week!");
            this.audio.playMilestone();
        }

        if (currentScore >= 500 && !this.milestone3Reached) {
            this.milestone3Reached = true;
            this.obstacleManager.spawnBuilding();
            this.ui.showNotification("Week 30 Reached! Congratulations on passing all the tests!");
        }

        if (currentScore >= 550 && !this.milestone4Reached) {
            this.milestone4Reached = true;
            this.obstacleManager.spawnBuilding();
            this.ui.showNotification("Super Bonus! Another Victory Building!");
        }

        this.ui.updateScore(currentScore);

        // Scroll background
        this.bgX -= this.gameSpeed;
        if (this.bgX <= -this.canvas.width) {
            this.bgX = 0;
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw Ground (Simple repeating pattern)
        // We draw two instances of the ground to make it seamless
        if (this.groundImage.complete) {
            // Assume ground image is meant to be at the bottom
            let groundY = this.canvas.height - 50;
            this.ctx.drawImage(this.groundImage, this.bgX, groundY, this.canvas.width, 50);
            this.ctx.drawImage(this.groundImage, this.bgX + this.canvas.width, groundY, this.canvas.width, 50);
        } else {
            this.ctx.fillStyle = '#eee';
            this.ctx.fillRect(0, this.canvas.height - 50, this.canvas.width, 50);
        }

        this.santa.draw(this.ctx, this.immunityTimer > 0);
        this.obstacleManager.draw(this.ctx);

        // Draw Coin
        if (this.coin.active && !this.coin.collected && this.coinImage.complete) {
            this.ctx.drawImage(this.coinImage, this.coin.x, this.coin.y, this.coin.width, this.coin.height);

            // Draw Coin Label
            this.ctx.fillStyle = '#0077b5'; // LinkedIn Blue-ish
            this.ctx.font = 'bold 16px Arial';
            const text = "LinkedIn Competition";
            const textWidth = this.ctx.measureText(text).width;
            this.ctx.fillText(text, this.coin.x + (this.coin.width / 2) - (textWidth / 2), this.coin.y - 15);
        }
    }

    loop() {
        if (!this.isRunning) return;
        this.update();
        this.draw();
        this.animationId = requestAnimationFrame(this.loop);
    }
}
