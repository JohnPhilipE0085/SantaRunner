export class ObstacleManager {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.obstacles = [];
        this.speed = 5;
        this.spawnTimer = 0;
        this.spawnInterval = 100 + Math.random() * 100; // Random initial interval

        this.image = new Image();
        this.image.src = '/src/assets/tree.png';

        this.buildingImage = new Image();
        this.buildingImage.src = '/src/assets/building.png';

        this.tree120Spawned = false;
        this.tree150Spawned = false;
        this.tree250Spawned = false;
        this.tree270Spawned = false;
        this.tree290Spawned = false;
        this.tree300Spawned = false;
        this.buildingSpawned = false;
    }

    update(gameSpeed, currentScore) {
        this.spawnTimer++;

        // Big Tree at 120
        if (currentScore >= 120 && !this.tree120Spawned) {
            this.spawnObstacle(true, 'DSA 1st attempt');
            this.tree120Spawned = true;
            this.spawnTimer = 0; // Reset timer to avoid overlap
        }
        // Big Tree at 150
        else if (currentScore >= 150 && !this.tree150Spawned) {
            this.spawnObstacle(true, 'DSA 2nd attempt');
            this.tree150Spawned = true;
            this.spawnTimer = 0;
        }
        // Big Trees at 250, 270, 290, 300
        else if (currentScore >= 250 && !this.tree250Spawned) {
            this.spawnObstacle(true, "Full domain 1st attempt");
            this.tree250Spawned = true;
            this.spawnTimer = 0;
        }
        else if (currentScore >= 270 && !this.tree270Spawned) {
            this.spawnObstacle(true, "Full domain 2nd attempt");
            this.tree270Spawned = true;
            this.spawnTimer = 0;
        }
        else if (currentScore >= 290 && !this.tree290Spawned) {
            this.spawnObstacle(true, "Full domain 3rd attempt");
            this.tree290Spawned = true;
            this.spawnTimer = 0;
        }
        else if (currentScore >= 320 && !this.tree300Spawned) {
            this.spawnObstacle(true, "Full domain 4th attempt");
            this.tree300Spawned = true;
            this.spawnTimer = 0;
        }
        // Building at 500 (handled via external call or check here? Plan said external but nicer here)
        // actually Plan said Game.js calls spawnBuilding. I will stick to adding method here.

        else if (this.spawnTimer > this.spawnInterval && !this.buildingSpawned) {
            this.spawnObstacle();
            this.spawnTimer = 0;
            // Randomize next interval, getting shorter as speed increases
            this.spawnInterval = (80 + Math.random() * 100) / (gameSpeed / 5);
        }

        // Move obstacles
        this.obstacles.forEach(obstacle => {
            obstacle.x -= gameSpeed;
        });

        // Remove off-screen obstacles
        this.obstacles = this.obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);
    }

    spawnObstacle(isBig = false, dsaLabel = 'DSA') {
        let height = 90 + Math.random() * 20;
        let width = 60;
        let isDSA = false;

        if (isBig) {
            height = 320; // Taller than max jump height (~270)
            width = 80;
            isDSA = true;
        }

        const obstacle = {
            x: this.canvasWidth,
            y: this.canvasHeight - height - 50, // Ground offset
            width: width,
            height: height,
            passed: false,
            isDSA: isDSA,
            dsaLabel: dsaLabel, // specific label
            type: 'tree'
        };
        this.obstacles.push(obstacle);
    }

    spawnBuilding() {
        const width = 400; // Wide building
        const height = 600; // Very tall

        const obstacle = {
            x: this.canvasWidth, // Start at absolute 0 or canvas width? Canvas width to scroll in.
            y: this.canvasHeight - height - 50,
            width: width,
            height: height,
            passed: false,
            isDSA: false,
            type: 'building'
        };
        this.obstacles.push(obstacle);
    }

    draw(ctx) {
        this.obstacles.forEach(obstacle => {
            if (obstacle.type === 'building') {
                if (this.buildingImage.complete) {
                    ctx.drawImage(this.buildingImage, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                } else {
                    ctx.fillStyle = 'gray'; // Fallback
                    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                }
            } else {
                if (this.image.complete) {
                    ctx.drawImage(this.image, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                } else {
                    ctx.fillStyle = 'green';
                    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                }

                // Draw DSA Label
                if (obstacle.isDSA) {
                    ctx.fillStyle = 'red';
                    ctx.font = 'bold 24px Arial';
                    const text = obstacle.dsaLabel || 'DSA';
                    // Center text above obstacle
                    const textWidth = ctx.measureText(text).width;
                    ctx.fillText(text, obstacle.x + (obstacle.width / 2) - (textWidth / 2), obstacle.y - 10);
                }
            }
        });
    }

    checkCollision(santa) {
        for (const obstacle of this.obstacles) {
            const collision = (
                santa.x < obstacle.x + obstacle.width &&
                santa.x + santa.width > obstacle.x &&
                santa.y < obstacle.y + obstacle.height &&
                santa.y + santa.height > obstacle.y
            );

            if (collision) {
                if (obstacle.type === 'building') {
                    return 'victory';
                }
                return true;
            }
        }
        return false;
    }

    reset() {
        this.obstacles = [];
        this.spawnTimer = 0;
        this.tree120Spawned = false;
        this.tree150Spawned = false;
        this.tree250Spawned = false;
        this.tree270Spawned = false;
        this.tree290Spawned = false;
        this.tree300Spawned = false;
        this.buildingSpawned = false;
    }

    removeImmediateObstacles(santaX) {
        // Remove obstacles that are within a certain distance ahead of Santa
        // to prevent instant collision upon revive, but keep the rest.
        // to prevent instant collision upon revive, but keep the rest.
        const safeZone = 1000;
        this.obstacles = this.obstacles.filter(obstacle => {
            return obstacle.x > santaX + safeZone || obstacle.x + obstacle.width < santaX;
        });
    }

    prepareRevive(santaX) {
        this.removeImmediateObstacles(santaX);
        this.spawnTimer = 0;
        // Reset to a safe initial interval to prevent instant spawn
        this.spawnInterval = 100;
    }
}
