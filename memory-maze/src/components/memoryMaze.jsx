import { useEffect, useState, useRef } from "react";
import confetti from "canvas-confetti";
// redeploy trigger

const fireConfetti = () => {
  const end = Date.now() + 2000;
  const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];
  const frame = () => {
    if (Date.now() > end) return;
    confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors });
    confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors });
    requestAnimationFrame(frame);
  };
  frame();
};

const LEVELS = [
  { id: 1, grid: 2, title: "Numbers", how: "Match identical numbers." },
  { id: 2, grid: 4, title: "Roman Numerals", how: "Match numbers with Roman numerals." },
  { id: 3, grid: 6, title: "Emotions", how: "Match emotion emojis with their names." },
  { id: 4, grid: 8, title: "Planets", how: "Match planets and space objects." },
  { id: 5, grid: 10, title: "Shapes", how: "Match shapes with their names." },
];

const DATA = {
  2: [["1","1"],["2","2"]],
  4: [["1","I"],["2","II"],["3","III"],["4","IV"],["5","V"],["6","VI"],["7","VII"],["8","VIII"]],
  6: [
    ["😄","Happy"],["😢","Sad"],["😍","Love"],["😡","Angry"],
    ["🤔","Thinking"],["😴","Sleepy"],["😎","Cool"],["🥳","Excited"],
    ["😐","Neutral"],["😭","Crying"],["😌","Relaxed"],["😤","Frustrated"],
    ["😜","Playful"],["😃","Joy"],["😟","Worried"],["😬","Nervous"],
    ["😞","Down"],["😱","Fear"],
  ],
  8: [
    ["☀️","Sun"], ["🌍","Earth"], ["🌕","Moon"], ["🔴","Mars"],
    ["🟠","Jupiter"], ["🪐","Saturn"], ["🔵","Uranus"], ["🟣","Neptune"],
    ["☄️","Comet"], ["🌠","Meteor"], ["🪨","Asteroid"], ["🚀","Rocket"],
    ["🛰️","Satellite"], ["🌌","Galaxy"], ["⭐","Star"], ["🌋","Volcano"],
    ["🌙","Crescent Moon"],["🛸","UFO"],
    ["🌑","New Moon"], ["🌒","Waxing Moon"], ["🌓","Half Moon"], ["🌔","Gibbous Moon"],
    ["🌕","Full Moon"], ["💫","Shooting Star"], ["🪐","Ringed Planet"],
    ["🌟","Bright Star"], ["🌠","Falling Star"], ["🧭","Orbit"],
    ["🕳","Black Hole"], ["🧊","Ice Planet"], ["🌡","Atmosphere"], ["🌀","Storm"],
    ],
};

const SHAPE_BASE = [
  ["🔺","Triangle"],["⬛","Square"],["⚪","Circle"],["⭐","Star"],
  ["🔶","Diamond"],["⬟","Hexagon"],["⬠","Octagon"],["⬢","Polygon"],
  ["🟥","Red Square"],["🟦","Blue Square"],["🟩","Green Square"],["🟨","Yellow Square"],
  ["🔵","Blue Circle"],["🔴","Red Circle"],["🟢","Green Circle"],["🟡","Yellow Circle"],
  ["🟪","Purple Square"],["🟫","Brown Square"],["⬜","White Square"],["🔲","Hollow Square"],
  ["🔷","Blue Diamond"],["🔸","Small Diamond"],["💠","Crystal Diamond"],
  ["➕","Plus"],["➖","Minus"],["✖️","Multiply"],["➗","Divide"],
  ["⬆️","Up Arrow"],["⬇️","Down Arrow"],["⬅️","Left Arrow"],["➡️","Right Arrow"],
  ["⚫","Black Circle"],["⚪️","White Circle"],
  ["🔘","Radio Button"],["🔻","Inverted Triangle"],
  ["💎","Gem"],["📐","Angle"],["📏","Line"],["🧩","Puzzle Shape"],
  ["🎯","Target"],["⭕","Ring"],["🛑","Stop"],["🔳","Filled Square"],
  ["🟠","Orange Circle"],["🔺","Solid Triangle"],
];

const getPairs = (grid) => {
  const needed = (grid * grid) / 2;
  if (grid === 10) return SHAPE_BASE.slice(0, 50);
  return DATA[grid].slice(0, needed);
};

const isEmoji = (v) => v.length <= 2;

export default function MemoryGame() {
  const [level, setLevel] = useState(1);
  const [unlocked, setUnlocked] = useState(1);
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [solved, setSolved] = useState([]);
  const [disabled, setDisabled] = useState(false);
  const [steps, setSteps] = useState(0);
  const [won, setWon] = useState(false);
  const [lost, setLost] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const currentLevel = LEVELS[level - 1];
  const gridSize = currentLevel.grid;
  const maxSteps = Math.floor((gridSize * gridSize )* 1.8);
  const boardSize = gridSize <= 6 ? 420 : gridSize === 8 ? 625 : 600;


  const clickSound = useRef(null);
  const wrongSound = useRef(null);
  const winSound = useRef(null);

  useEffect(() => {
    clickSound.current = new Audio("/button-click.mp3");
    wrongSound.current = new Audio("/wrong.mp3");
    winSound.current = new Audio("/balloon-burst.mp3");
  }, []);

  const initGame = () => {
    const pairs = getPairs(gridSize);
    const deck = pairs.flatMap((p, i) => [
      { value: p[0], pairId: i },
      { value: p[1], pairId: i },
    ]);
    setCards(deck.sort(() => Math.random() - 0.5).map((c, i) => ({ ...c, id: i })));
    setFlipped([]);
    setSolved([]);
    setSteps(0);
    setWon(false);
    setLost(false);
    setDisabled(false);
  };

  useEffect(initGame, [level]);

  const handleClick = (id) => {
    if (disabled || flipped.includes(id) || won || lost) return;

    setSteps(prev => {
      const next = prev + 1;
      if (next >= maxSteps) {
        setLost(true);
        return maxSteps;
      }
      return next;
    });

    if (steps >= maxSteps - 1) return;

    clickSound.current?.play();

    if (flipped.length === 0) {
      setFlipped([id]);
      return;
    }

    setDisabled(true);
    const first = flipped[0];
    setFlipped([first, id]);

    if (cards[first].pairId === cards[id].pairId) {
      setTimeout(() => {
        setSolved(s => [...s, first, id]);
        setFlipped([]);
        setDisabled(false);
      }, 350);
    } else {
      wrongSound.current?.play();
      setTimeout(() => {
        setFlipped([]);
        setDisabled(false);
      }, 550);
    }
  };

  useEffect(() => {
    if (lost) wrongSound.current?.play();
  }, [lost]);

  useEffect(() => {
    if (solved.length === cards.length && cards.length) {
      winSound.current?.play();
      fireConfetti();
      setWon(true);
      setUnlocked(u => Math.max(u, level + 1));
    }
  }, [solved]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#0b1220", color: "white" }}>
      
      {/* SIDEBAR */}
      <div
        style={{
          width: sidebarOpen ? 260 : 60,
          transition: "width 0.3s",
          padding: sidebarOpen ? 20 : 10,
          background: "#111827",
        }}
      >
        <button
          onClick={() => setSidebarOpen(o => !o)}
          style={{
            background: "#1f2933",
            border: "none",
            color: "white",
            width: "100%",
            borderRadius: 8,
            marginBottom: 12,
            cursor: "pointer",
          }}
        >
          {sidebarOpen ? "❮❮" : "☰"}
        </button>

        {sidebarOpen && (
          <>
            <h3 style={{ marginBottom: 6 }}>How to Play</h3>
            <p style={{ fontSize: "1.0rem", opacity: 0.85, marginBottom: 16 }}>
              <strong>Level {level}:</strong> {currentLevel.title}<br />
              {currentLevel.how}<br />
            </p>
          </>
        )}

        {sidebarOpen && LEVELS.map(l => (
          <button
            key={l.id}
            disabled={l.id > unlocked}
            onClick={() => setLevel(l.id)}
            style={{
              width: "100%",
              padding: 10,
              marginBottom: 8,
              borderRadius: 10,
              border: "none",
              background: l.id === level ? "#3b82f6" : "#1f2933",
              color: "white",
              opacity: l.id > unlocked ? 0.4 : 1,
              cursor: l.id > unlocked ? "not-allowed" : "pointer",
            }}
          >
            Level {l.id}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
        
        <div
            style={{
                background: "#1f2933",
                padding: 26,
                borderRadius: 20,
                width: boardSize,
                transition: "width 0.3s ease",
            }}
        >

          <h1 style={{ textAlign: "center" }}>Memory Maze</h1>

          <p style={{ textAlign: "center" }}>
            Steps: {steps}/{maxSteps}
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
              gap: 10,
            }}
          >
            {cards.map(card => {
              const isOpen = flipped.includes(card.id);
              const isSolvedCard = solved.includes(card.id);
              const bg = isSolvedCard ? "#22c55e" : isOpen ? "#3b82f6" : "#374151";

              return (
                <div
                  key={card.id}
                  onClick={() => handleClick(card.id)}
                  style={{
                    aspectRatio: "1",
                    background: bg,
                    borderRadius: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: isEmoji(card.value) ? "1.5rem" : "0.9rem",
                    cursor: "pointer",
                  }}
                >
                  {(isOpen || isSolvedCard) && card.value}
                </div>
              );
            })}
          </div>

          <button
            onClick={initGame}
            style={{
              marginTop: 16,
              width: "100%",
              padding: 10,
              borderRadius: 10,
              border: "none",
              background: "#22c55e",
              color: "white",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {won || lost ? "Play Again" : "Reset"}
          </button>

          {won && <p style={{ color: "#22c55e", textAlign: "center" }}>🎉 Level Complete!</p>}
          {lost && <p style={{ color: "#ef4444", textAlign: "center" }}>❌ Out of Steps!</p>}
        </div>
      </div>
    </div>
  );
}
