import confetti from 'canvas-confetti';

export const confettiConfig = {
  levelUp: () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);
  },

  achievement: () => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999
    };

    function fire(particleRatio: number, opts: any) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });

    fire(0.2, {
      spread: 60,
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  },

  milestone: (emoji: string = '🎉') => {
    const scalar = 3;
    const emojiConfetti = confetti.shapeFromText({ text: emoji, scalar });

    confetti({
      shapes: [emojiConfetti],
      particleCount: 40,
      spread: 100,
      origin: { y: 0.6 },
      zIndex: 9999,
      scalar
    });
  },

  streak: () => {
    const colors = ['#ff6b6b', '#ff8c42', '#ffd93d'];
    
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors,
      shapes: ['circle'],
      zIndex: 9999,
      gravity: 1.5,
      ticks: 300
    });
  },

  follow: () => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#a78bfa', '#ec4899', '#fb923c'],
      zIndex: 9999
    });
    
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#a78bfa', '#ec4899', '#fb923c'],
      zIndex: 9999
    });
  },

  bookComplete: () => {
    const end = Date.now() + (2 * 1000);
    const colors = ['#8b5cf6', '#ec4899', '#f97316'];

    (function frame() {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
        zIndex: 9999
      });
      
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
        zIndex: 9999
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  },

  customExplosion: (x: number, y: number, color: string) => {
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { x, y },
      colors: [color],
      zIndex: 9999,
      ticks: 200
    });
  }
};

// Sound effects (optional - can be toggled in settings)
export const soundEffects = {
  levelUp: () => {
    const audio = new Audio('/sounds/level-up.mp3');
    audio.volume = 0.3;
    audio.play().catch(() => {});
  },
  achievement: () => {
    const audio = new Audio('/sounds/achievement.mp3');
    audio.volume = 0.3;
    audio.play().catch(() => {});
  },
  streak: () => {
    const audio = new Audio('/sounds/streak.mp3');
    audio.volume = 0.3;
    audio.play().catch(() => {});
  }
};
