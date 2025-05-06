import React, { useRef, useState, useEffect } from "react";
import useBabylonGame from "./hooks/useBabylonGame";
import ScoreDisplay from "./components/ScoreDisplay/ScoreDisplay";
import Instructions from "./components/Instructions/Instructions";
import "./App.scss";

const App = () => {
  const canvasRef = useRef(null);
  const [started, setStarted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [isTouchingLeft, setIsTouchingLeft] = useState(false);
  const [isTouchingRight, setIsTouchingRight] = useState(false);

  const { score, gameOver } = useBabylonGame(
    canvasRef,
    started,
    isTouchingLeft,
    isTouchingRight
  );

  useEffect(() => {
    const updateViewportOffset = () => {
      if (window.visualViewport) {
        const offset =
          window.innerHeight -
          (window.visualViewport.offsetTop + window.visualViewport.height);
        document.documentElement.style.setProperty(
          "--visual-viewport-bottom-offset",
          `${Math.max(0, offset)}px`
        );
      } else {
        document.documentElement.style.setProperty(
          "--visual-viewport-bottom-offset",
          `0px`
        );
      }
    };

    if (window.visualViewport) {
      updateViewportOffset();

      window.visualViewport.addEventListener("resize", updateViewportOffset);
      window.visualViewport.addEventListener("scroll", updateViewportOffset); // Scroll might also affect offsetTop

      return () => {
        window.visualViewport.removeEventListener(
          "resize",
          updateViewportOffset
        );
        window.visualViewport.removeEventListener(
          "scroll",
          updateViewportOffset
        );
      };
    }
  }, []);

  const handleStartClick = () => {
    setShowInstructions(false);
    setStarted(false);
    setTimeout(() => setStarted(true), 0);
  };

  const handleTouchStart = (direction) => {
    if (direction === "left") {
      setIsTouchingLeft(true);
    } else if (direction === "right") {
      setIsTouchingRight(true);
    }
  };

  const handleTouchEnd = (direction) => {
    if (direction === "left") {
      setIsTouchingLeft(false);
    } else if (direction === "right") {
      setIsTouchingRight(false);
    }
  };

  return (
    <div className="app-container">
      {showInstructions && <Instructions />}
      {(!started || gameOver) && (
        <button onClick={handleStartClick} className="start-button">
          {gameOver ? "Restart Game" : "Start Game"}
        </button>
      )}
      <canvas ref={canvasRef} className="game-canvas" />
      {started && !showInstructions && (
        <>
          <ScoreDisplay score={score} gameOver={gameOver} />
          <button
            type="button"
            className="mobile-control left-arrow"
            onTouchStart={() => handleTouchStart("left")}
            onTouchEnd={() => handleTouchEnd("left")}
            onMouseDown={() => handleTouchStart("left")}
            onMouseUp={() => handleTouchEnd("left")}
          >
            &lt;
          </button>
          <button
            type="button"
            className="mobile-control right-arrow"
            onTouchStart={() => handleTouchStart("right")}
            onTouchEnd={() => handleTouchEnd("right")}
            onMouseDown={() => handleTouchStart("right")}
            onMouseUp={() => handleTouchEnd("right")}
          >
            &gt;
          </button>
        </>
      )}
    </div>
  );
};

export default App;
