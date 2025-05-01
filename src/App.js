import React, { useRef, useState } from "react";
import useBabylonGame from "./hooks/useBabylonGame";
import ScoreDisplay from "./components/ScoreDisplay/ScoreDisplay";
import Instructions from "./components/Instructions/Instructions";
import "./App.scss";

const App = () => {
  const canvasRef = useRef(null);
  const [started, setStarted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const { score, gameOver } = useBabylonGame(canvasRef, started);

  const handleStartClick = () => {
    setShowInstructions(false);
    setStarted(false);
    setTimeout(() => setStarted(true), 0);
  };

  return (
    <div className="app-container">
      {" "}
      {showInstructions && <Instructions />}
      {(!started || gameOver) && (
        <button onClick={handleStartClick} className="start-button">
          {gameOver ? "Restart Game" : "Start Game"}
        </button>
      )}
      <canvas ref={canvasRef} className="game-canvas" /> {/* Use className */}
      {started && !showInstructions && (
        <ScoreDisplay score={score} gameOver={gameOver} />
      )}
    </div>
  );
};

export default App;
