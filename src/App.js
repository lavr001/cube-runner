import React, { useRef, useState } from "react";
import useBabylonGame from "./hooks/useBabylonGame";
import ScoreDisplay from "./components/ScoreDisplay";

function App() {
  const canvasRef = useRef(null);
  const [started, setStarted] = useState(false);
  const { score, gameOver } = useBabylonGame(canvasRef, started);

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      {/* Start or Restart button at top-right */}
      {(!started || gameOver) && (
        <button
          onClick={() => {
            setStarted(false); // Reset started to false to trigger effect cleanup
            setTimeout(() => setStarted(true), 0); // Immediately start a new game
          }}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            background: "transparent",
            border: "1px solid white",
            color: "white",
            padding: "10px 20px",
            fontSize: "18px",
            cursor: "pointer",
          }}
        >
          {gameOver ? "Restart Game" : "Start Game"}
        </button>
      )}
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      {started && <ScoreDisplay score={score} gameOver={gameOver} />}
    </div>
  );
}

export default App;
