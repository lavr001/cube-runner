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
    const updateViewportValues = () => {
      if (window.visualViewport) {
        const vv = window.visualViewport;
        document.documentElement.style.setProperty(
          "--vv-offset-top",
          `${vv.offsetTop}px`
        );
        document.documentElement.style.setProperty(
          "--vv-height",
          `${vv.height}px`
        );
      } else {
        document.documentElement.style.setProperty("--vv-offset-top", "0px");
        document.documentElement.style.setProperty("--vv-height", "100vh");
      }
    };

    if (window.visualViewport) {
      updateViewportValues();

      window.visualViewport.addEventListener("resize", updateViewportValues);
      window.visualViewport.addEventListener("scroll", updateViewportValues);

      return () => {
        window.visualViewport.removeEventListener(
          "resize",
          updateViewportValues
        );
        window.visualViewport.removeEventListener(
          "scroll",
          updateViewportValues
        );
      };
    } else {
      updateViewportValues();
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
