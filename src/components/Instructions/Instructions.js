import React from "react";
import "./Instructions.scss";

const Instructions = () => {
  return (
    <div className="instructions-overlay">
      <h2>How to Play</h2>
      <ul>
        <li>
          <b>Rotate View:</b> Click and drag with your mouse (← ↑ → ↓) to
          position the game board.
        </li>
        <li>
          <b>Zoom:</b> Use two fingers on the trackpad or the mouse scroll wheel
          to zoom in/out.
        </li>
        <li>
          <b>Move Cube:</b> Use 'A'/'←' (Left) and 'D'/'→' (Right) keys.
        </li>
        <li>
          <b>Goal:</b> Dodge the pink obstacles for as long as possible!
        </li>
      </ul>
      <p>Click "Start Game" in the top-right corner when ready.</p>
    </div>
  );
};

export default Instructions;
