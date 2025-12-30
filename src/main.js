import { Game } from './game/Game.js';

// Simple UI Helper
const UI = {
    startScreen: document.getElementById('start-screen'),
    gameOverScreen: document.getElementById('game-over-screen'),
    victoryScreen: document.getElementById('victory-screen'),
    notificationBar: document.getElementById('notification-bar'),
    notificationText: document.getElementById('notification-text'),
    walletAmount: document.getElementById('wallet-amount'),
    scoreBoard: document.getElementById('score-board'),
    scoreEl: document.getElementById('score'),
    finalScoreEl: document.getElementById('final-score'),

    introScreen: document.getElementById('intro-screen'),
    introVideo: document.getElementById('intro-video'),
    introOverlay: document.getElementById('intro-overlay'),

    hideStartScreen() {
        this.startScreen.classList.add('hidden');
    },
    showStartScreen() {
        this.startScreen.classList.remove('hidden');
    },
    showScoreBoard() {
        this.scoreBoard.classList.remove('hidden');
    },
    showGameOverScreen(score) {
        this.finalScoreEl.innerText = score;
        this.gameOverScreen.classList.remove('hidden');
    },
    hideGameOverScreen() {
        this.gameOverScreen.classList.add('hidden');
    },
    showVictoryScreen() {
        this.victoryScreen.classList.remove('hidden');
    },
    hideVictoryScreen() {
        this.victoryScreen.classList.add('hidden');
    },
    showNotification(text) {
        this.notificationText.innerText = text;
        this.notificationBar.classList.remove('hidden');
        this.notificationBar.classList.add('visible');
        // Hide after 3 seconds (shorter since it's big)
        if (this.notificationTimeout) clearTimeout(this.notificationTimeout);
        this.notificationTimeout = setTimeout(() => {
            this.hideNotification();
        }, 3000);
    },
    hideNotification() {
        this.notificationBar.classList.remove('visible');
        this.notificationBar.classList.add('hidden');
    },
    updateScore(score) {
        this.scoreEl.innerText = score;
    },
    updateWallet(amount) {
        this.walletAmount.innerText = amount;
    }
};

const canvas = document.getElementById('game-canvas');
const game = new Game(canvas, UI);

// Intro Video Logic
UI.introOverlay.addEventListener('click', () => {
    UI.introOverlay.classList.add('hidden');
    UI.introVideo.play().catch(e => console.error("Intro video play failed:", e));
});

UI.introVideo.addEventListener('ended', () => {
    UI.introScreen.classList.add('hidden');
    UI.showStartScreen();
});

// Input handling
window.addEventListener('keydown', (e) => {
    // Only handle input if game is visible (not intro)
    if (UI.introScreen.classList.contains('hidden')) {
        if (e.code === 'Space' || e.code === 'ArrowUp') {
            game.handleInput();
        }
    }
});

// Touch support for mobile (basic)
window.addEventListener('touchstart', (e) => {
    if (UI.introScreen.classList.contains('hidden')) {
        e.preventDefault(); // Prevent scrolling
        game.handleInput();
    }
}, { passive: false });

document.getElementById('restart-btn').addEventListener('click', () => {
    game.start();
});



document.getElementById('revive-btn').addEventListener('click', () => {
    game.revive();
});

document.getElementById('continue-btn').addEventListener('click', () => {
    UI.hideVictoryScreen();
    const videoScreen = document.getElementById('video-screen');
    const video = document.getElementById('ending-video');

    videoScreen.classList.remove('hidden');
    video.play().catch(e => console.log("Video autoplay failed (interaction needed?): ", e));
});

document.getElementById('close-video-btn').addEventListener('click', () => {
    location.reload(); // Simple restart
});
