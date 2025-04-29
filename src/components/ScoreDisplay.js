import React from "react";

export default function ScoreDisplay({ score, gameOver }) {
  return (
    <div
      id="scoreDisplay"
      style={{
        position: "absolute",
        top: 10,
        left: 10,
        color: "white",
        fontSize: 20,
      }}
    >
      {gameOver ? `Game Over! Final Score: ${score}` : `Score: ${score}`}
    </div>
  );
}
