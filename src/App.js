import React, { useRef, useEffect } from "react";
import * as BABYLON from "babylonjs";

function App() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const engine = new BABYLON.Engine(canvas, true);
    const scene = new BABYLON.Scene(engine);

    // Camera
    const camera = new BABYLON.ArcRotateCamera(
      "Camera",
      Math.PI / 2,
      Math.PI / 4,
      10,
      BABYLON.Vector3.Zero(),
      scene
    );
    camera.attachControl(canvas, true);

    // Lights
    const light = new BABYLON.HemisphericLight(
      "light",
      new BABYLON.Vector3(0, 1, 0),
      scene
    );
    light.intensity = 0.7;
    const dirLight = new BABYLON.DirectionalLight(
      "dirLight",
      new BABYLON.Vector3(0, -1, 1),
      scene
    );
    dirLight.position = new BABYLON.Vector3(0, 10, -10);

    // Player cube
    const player = BABYLON.MeshBuilder.CreateBox("player", { size: 1 }, scene);
    player.position.z = -4;
    player.position.y = 0.5;
    const playerMat = new BABYLON.StandardMaterial("playerMat", scene);
    playerMat.diffuseColor = new BABYLON.Color3(0, 0, 1);
    player.material = playerMat;

    // Ground and shadows
    const ground = BABYLON.MeshBuilder.CreateGround(
      "ground",
      { width: 10, height: 100 },
      scene
    );
    ground.position.z = 45;
    ground.receiveShadows = true;
    const shadowGen = new BABYLON.ShadowGenerator(1024, dirLight);
    shadowGen.addShadowCaster(player);

    // Obstacles setup
    const obstacles = [];
    let score = 0;
    let isGameOver = false;
    let speed = 0.1;
    const speedInc = 0.001;
    const inputMap = {};
    window.addEventListener("keydown", (e) => (inputMap[e.key] = true));
    window.addEventListener("keyup", (e) => (inputMap[e.key] = false));

    const createObstacle = () => {
      const obs = BABYLON.MeshBuilder.CreateBox("obstacle", { size: 1 }, scene);
      obs.position.x = Math.random() * 8 - 4;
      obs.position.z = Math.random() * 20 + 10;
      obs.position.y = 0.5;
      const mat = new BABYLON.StandardMaterial("obsMat", scene);
      mat.diffuseColor = new BABYLON.Color3(1, 0, 0);
      obs.material = mat;
      shadowGen.addShadowCaster(obs);
      return obs;
    };

    // Game loop
    scene.onBeforeRenderObservable.add(() => {
      if (isGameOver) return;
      obstacles.forEach((obs) => {
        obs.position.z -= speed;
        if (obs.intersectsMesh(player, false)) {
          isGameOver = true;
          document.getElementById("scoreDisplay").innerText =
            "Game Over! Final Score: " + Math.floor(score);
          // explosion omitted for brevity
          setTimeout(() => engine.stopRenderLoop(), 2000);
        }
      });
      if (Math.random() < 0.02) obstacles.push(createObstacle());
      if (inputMap["ArrowLeft"] || inputMap["a"]) player.position.x -= 0.1;
      if (inputMap["ArrowRight"] || inputMap["d"]) player.position.x += 0.1;
      player.position.x = BABYLON.Scalar.Clamp(player.position.x, -4.5, 4.5);
      score += 0.1;
      document.getElementById("scoreDisplay").innerText =
        "Score: " + Math.floor(score);
      speed += speedInc;
    });

    engine.runRenderLoop(() => scene.render());
    window.addEventListener("resize", () => engine.resize());

    return () => {
      engine.dispose();
      window.removeEventListener("resize", () => engine.resize());
    };
  }, []);

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      <canvas
        ref={canvasRef}
        id="renderCanvas"
        style={{ width: "100%", height: "100%" }}
      />
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
        Score: 0
      </div>
    </div>
  );
}

export default App;
