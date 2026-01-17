import {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef
} from "react";
import "./Game.css";

const SIZE = 15;
const SPEED = 450;
const MIN_SPEED = 120;

export default function Game({ onEditProfile }) {
  // 🔹 USER-WISE BEST SCORE KEY
  const email = localStorage.getItem("userEmail");
  const bestScoreKey = email ? `bestScore_${email}` : "bestScore_guest";

  const [snake, setSnake] = useState([
    { x: 7, y: 7 },
    { x: 6, y: 7 },
    { x: 5, y: 7 }
  ]);
  const [direction, setDirection] = useState({ x: 1, y: 0 });
  const [food, setFood] = useState(randomFood());
  const [score, setScore] = useState(0);

  const [bestScore, setBestScore] = useState(
    Number(localStorage.getItem(bestScoreKey)) || 0
  );

  const [paused, setPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [angry, setAngry] = useState(true);

  // 🔹 DYNAMIC SPEED
  const [speed, setSpeed] = useState(SPEED);

  // 🔊 SOUND
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [soundUnlocked, setSoundUnlocked] = useState(false);

  // 🔇 MUTE STATE
  const [isMuted, setIsMuted] = useState(false);

  // 🎉 PARTY / CRACKER
  const [celebrate, setCelebrate] = useState(false);
  const [newRecord, setNewRecord] = useState(false);

  // 👆 TOUCH
  const touchStart = useRef({ x: 0, y: 0 });

  // 🔽 PROFILE MENU
  const [menuOpen, setMenuOpen] = useState(false);
  const username =
    localStorage.getItem("username") ||
    localStorage.getItem("userEmail") ||
    "Player";

  // 🖼️ AVATAR
  const [avatar, setAvatar] = useState(null);

  const eatSound = useMemo(
    () => new Audio(process.env.PUBLIC_URL + "/eat.mp3"),
    []
  );
  const gameOverSound = useMemo(
    () => new Audio(process.env.PUBLIC_URL + "/gameover.mp3"),
    []
  );
  const partySound = useMemo(
    () => new Audio(process.env.PUBLIC_URL + "/party.mp3"),
    []
  );
  const bgMusic = useMemo(
    () => new Audio(process.env.PUBLIC_URL + "/bgmusic.mp3"),
    []
  );

  function randomFood() {
    return {
      x: Math.floor(Math.random() * SIZE),
      y: Math.floor(Math.random() * SIZE)
    };
  }

  // =======================
  // 📥 FETCH PROFILE
  // =======================
  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (!email) return;

    fetch(`http://localhost:5000/api/auth/profile/${email}`)
      .then(res => res.json())
      .then(data => {
        if (data.avatar) setAvatar(data.avatar);
      })
      .catch(() => {});
  }, []);

  // 🔓 SOUND UNLOCK
  const unlockSound = useCallback(() => {
    if (soundUnlocked) return;

    eatSound
      .play()
      .then(() => {
        eatSound.pause();
        eatSound.currentTime = 0;
        setSoundEnabled(true);
        setSoundUnlocked(true);

        // 🔊 START BG MUSIC LOOP
        bgMusic.loop = true;
        bgMusic.volume = 0.3;
        bgMusic.muted = isMuted;
        bgMusic.play().catch(() => {});
      })
      .catch(() => {});
  }, [soundUnlocked, eatSound, bgMusic, isMuted]);

  // 🔇 MUTE/UNMUTE FUNCTION
  const toggleMute = () => {
    setIsMuted(prev => !prev);
    [eatSound, gameOverSound, partySound, bgMusic].forEach(audio => {
      if (audio) audio.muted = !isMuted;
    });
  };

  // 🔊 PAUSE / STOP BG MUSIC
  useEffect(() => {
    if (!soundEnabled) return;

    if (paused) {
      bgMusic.pause();
    } else if (!gameOver) {
      bgMusic.play().catch(() => {});
    }
  }, [paused, soundEnabled, bgMusic, gameOver]);

  // 👉 TOUCH START
  const handleTouchStart = e => {
    unlockSound();
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };

  // 👉 TOUCH END
  const handleTouchEnd = e => {
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 30 && direction.x !== -1) setDirection({ x: 1, y: 0 });
      else if (dx < -30 && direction.x !== 1)
        setDirection({ x: -1, y: 0 });
    } else {
      if (dy > 30 && direction.y !== -1)
        setDirection({ x: 0, y: 1 });
      else if (dy < -30 && direction.y !== 1)
        setDirection({ x: 0, y: -1 });
    }
  };

  const moveSnake = useCallback(() => {
    const head = snake[0];
    const newHead = { x: head.x + direction.x, y: head.y + direction.y };

    if (
      newHead.x < 0 ||
      newHead.y < 0 ||
      newHead.x >= SIZE ||
      newHead.y >= SIZE ||
      snake.some(s => s.x === newHead.x && s.y === newHead.y)
    ) {
      if (soundEnabled && !isMuted) {
        gameOverSound.currentTime = 0;
        gameOverSound.play().catch(() => {});
      }

      // 🏆 CHECK NEW RECORD
      if (score > bestScore) {
        localStorage.setItem(bestScoreKey, score);
        setBestScore(score);
        setNewRecord(true);
      } else {
        setNewRecord(false);
      }

      setGameOver(true);
      return;
    }

    const newSnake = [newHead, ...snake];

    if (newHead.x === food.x && newHead.y === food.y) {
      if (soundEnabled && !isMuted) {
        eatSound.currentTime = 0;
        eatSound.play().catch(() => {});
      }
      setFood(randomFood());
      setScore(s => s + 1);
      setAngry(false);

      // ⚡ SPEED UP
      setSpeed(prev => (prev > MIN_SPEED ? prev - 15 : prev));
    } else {
      newSnake.pop();
      setAngry(true);
    }

    setSnake(newSnake);
  }, [
    snake,
    direction,
    food,
    soundEnabled,
    eatSound,
    gameOverSound,
    score,
    bestScore,
    bestScoreKey,
    isMuted
  ]);

  useEffect(() => {
    if (paused || gameOver) return;
    const id = setInterval(moveSnake, speed);
    return () => clearInterval(id);
  }, [moveSnake, paused, gameOver, speed]);

  // 🎉 CELEBRATE ONLY IF NEW RECORD + GAME OVER
  useEffect(() => {
    if (gameOver && newRecord) {
      setCelebrate(true);

      if (soundEnabled && !isMuted) {
        partySound.currentTime = 0;
        partySound.play().catch(() => {});
      }

      setTimeout(() => setCelebrate(false), 3000);
    }
  }, [gameOver, newRecord, soundEnabled, partySound, isMuted]);

  // 🎆 REAL ANIMATED CRACKERS
  useEffect(() => {
    if (!celebrate) return;

    const canvas = document.getElementById("crackerCanvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ["#ff3d00", "#ffea00", "#00e5ff", "#76ff03", "#ff1744"];

    for (let i = 0; i < 180; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 0.5) * 14,
        size: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 120
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        if (p.life <= 0) return;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2;
        p.life--;
      });
    };

    const interval = setInterval(animate, 16);
    return () => clearInterval(interval);
  }, [celebrate]);

  // ⌨️ KEYBOARD
  useEffect(() => {
    const handleKey = e => {
      unlockSound();
      if (e.key === " ") setPaused(p => !p);
      if (e.key === "ArrowUp" && direction.y !== 1)
        setDirection({ x: 0, y: -1 });
      if (e.key === "ArrowDown" && direction.y !== -1)
        setDirection({ x: 0, y: 1 });
      if (e.key === "ArrowLeft" && direction.x !== 1)
        setDirection({ x: -1, y: 0 });
      if (e.key === "ArrowRight" && direction.x !== -1)
        setDirection({ x: 1, y: 0 });
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [direction, unlockSound]);

  // 🔴 LOGOUT SAFE
  const preserveBestScores = () => {
    const saved = {};
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith("bestScore_")) {
        saved[key] = localStorage.getItem(key);
      }
    });
    return saved;
  };

  const restoreBestScores = saved => {
    Object.keys(saved).forEach(key => {
      localStorage.setItem(key, saved[key]);
    });
  };

  const handleLogout = () => {
    const savedBest = preserveBestScores();
    localStorage.clear();
    restoreBestScores(savedBest);
    window.location.reload();
  };

  return (
    <div
      className="container"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={unlockSound}
    >
      {/* 🔝 TOP BAR */}
      <div className="top-bar">
        <div
          className="profile"
          onClick={onEditProfile}
          style={{ cursor: "pointer" }}
        >
          {avatar ? (
            <img src={avatar} alt="avatar" className="header-avatar" />
          ) : (
            <span>👤</span>
          )}
          <span>{username}</span>
        </div>

        <div className="menu-bar-right">
          {/* 🔇 MUTE ICON */}
          <span className="mic-icon" onClick={toggleMute}>
            {isMuted ? "🔇" : "🎤"}
          </span>

          <span onClick={() => setMenuOpen(!menuOpen)}>⋮</span>
          {menuOpen && (
            <div className="dropdown">
              <button onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </div>

      <h1>🐍 Snake Game</h1>

      <div className="stats">
        <span>Score: {score}</span>
        <span>Best: {bestScore}</span>
      </div>

      <div className="board">
        {[...Array(SIZE)].map((_, y) =>
          [...Array(SIZE)].map((_, x) => {
            const index = snake.findIndex(s => s.x === x && s.y === y);
            return (
              <div
                key={`${x}-${y}`}
                className={`cell
                  ${index === 0 ? `snake-head ${angry ? "angry" : ""}` : ""}
                  ${index > 0 ? "snake-body" : ""}
                  ${food.x === x && food.y === y ? "food" : ""}
                `}
              />
            );
          })
        )}

        {/* 🏆 NEW RECORD TEXT ON BOARD */}
        {celebrate && <div className="board-record-text">NEW BEST SCORE!</div>}
      </div>

      <div className="controls">
        <button onClick={() => setDirection({ x: 0, y: -1 })}>⬆</button>
        <div>
          <button onClick={() => setDirection({ x: -1, y: 0 })}>⬅</button>
          <button onClick={() => setPaused(p => !p)}>⏸</button>
          <button onClick={() => setDirection({ x: 1, y: 0 })}>➡</button>
        </div>
        <button onClick={() => setDirection({ x: 0, y: 1 })}>⬇</button>
      </div>

      {gameOver && (
        <button className="restart" onClick={() => window.location.reload()}>
          🔄
        </button>
      )}

      {/* 🎆 CRACKER CANVAS */}
      {celebrate && <canvas id="crackerCanvas" className="cracker-canvas"></canvas>}
    </div>
  );
}
