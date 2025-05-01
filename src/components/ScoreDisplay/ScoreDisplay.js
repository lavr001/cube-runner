import React from "react";
import "./ScoreDisplay.scss";

const ScoreDisplay = ({ score, gameOver }) => {
  return (
    <div id="scoreDisplay" className="score-display">
      {gameOver ? `Game Over! Final Score: ${score}` : `Score: ${score}`}
    </div>
  );
};

export default ScoreDisplay;
