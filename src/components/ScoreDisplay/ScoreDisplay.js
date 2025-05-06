import React from "react";
import "./ScoreDisplay.scss";

const ScoreDisplay = ({ score, gameOver }) => {
  if (gameOver) {
    return (
      <div className="game-over-modal">
        <h2>Game Over!</h2>
        <p className="final-score-text">Final Score: {score}</p>
      </div>
    );
  }

  return (
    <div id="scoreDisplay" className="score-display">
      {`Score: ${score}`}
    </div>
  );
};

export default ScoreDisplay;
