import { useEffect, useState, useRef } from "react";
import * as BABYLON from "babylonjs";

export default function useBabylonGame(canvasRef, started) {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const sceneRef = useRef(null);
  const playerRef = useRef(null);
  const obstaclesRef = useRef([]);
  const shadowGenRef = useRef(null);
  const gameLoopObserverRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new BABYLON.Engine(canvas, true);
    const scene = new BABYLON.Scene(engine);
    sceneRef.current = scene;

    const camera = new BABYLON.ArcRotateCamera(
      "Camera",
      Math.PI / 2,
      Math.PI / 4,
      10,
      BABYLON.Vector3.Zero(),
      scene
    );
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 5;
    camera.upperRadiusLimit = 20;

    const hemi = new BABYLON.HemisphericLight(
      "light",
      new BABYLON.Vector3(0, 1, 0),
      scene
    );
    hemi.intensity = 0.7;
    const dir = new BABYLON.DirectionalLight(
      "dirLight",
      new BABYLON.Vector3(0, -1, 1),
      scene
    );
    dir.position = new BABYLON.Vector3(0, 10, -10);

    const player = BABYLON.MeshBuilder.CreateBox("player", { size: 1 }, scene);
    player.position.set(0, 0.5, -4);
    const mat = new BABYLON.StandardMaterial("playerMat", scene);
    mat.diffuseColor = new BABYLON.Color3(0, 0, 1);
    player.material = mat;
    playerRef.current = player;

    const ground = BABYLON.MeshBuilder.CreateGround(
      "ground",
      { width: 10, height: 100 },
      scene
    );
    ground.position.set(0, 0, 45);
    ground.receiveShadows = true;

    const shadowGen = new BABYLON.ShadowGenerator(1024, dir);
    shadowGen.addShadowCaster(player);
    shadowGenRef.current = shadowGen;

    engine.runRenderLoop(() => {
      sceneRef.current?.render();
    });

    const handleResize = () => engine.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      engine.dispose();
      sceneRef.current = null;
      playerRef.current = null;
      obstaclesRef.current = [];
      shadowGenRef.current = null;
      gameLoopObserverRef.current = null; // Ensure observer ref is cleared
    };
  }, [canvasRef]);

  useEffect(() => {
    const scene = sceneRef.current;
    const player = playerRef.current;
    const shadowGen = shadowGenRef.current;

    if (!scene || !player || !shadowGen) return;

    if (started) {
      setScore(0);
      setGameOver(false);
      obstaclesRef.current.forEach((obs) => obs.dispose());
      obstaclesRef.current = [];
      player.position.set(0, 0.5, -4);

      let internalScore = 0;
      let isOver = false;
      let speed = 0.02;
      const speedInc = 0.00005;
      const inputMap = {};

      const handleKeyDown = (e) => (inputMap[e.key] = true);
      const handleKeyUp = (e) => (inputMap[e.key] = false);
      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);

      const createObstacle = () => {
        if (!scene || !shadowGen) return null;
        const obs = BABYLON.MeshBuilder.CreateBox(
          "obstacle",
          { size: 1 },
          scene
        );
        obs.position.x = Math.random() * 8 - 4;
        obs.position.z = player.position.z + 20 + Math.random() * 20;
        obs.position.y = 0.5;
        const oMat = new BABYLON.StandardMaterial(
          "obsMat" + Math.random(),
          scene
        );
        oMat.diffuseColor = new BABYLON.Color3(1, 0, 1);
        obs.material = oMat;
        shadowGen.addShadowCaster(obs);
        obstaclesRef.current.push(obs);
        return obs;
      };

      if (gameLoopObserverRef.current) {
        scene.onBeforeRenderObservable.remove(gameLoopObserverRef.current);
      }
      gameLoopObserverRef.current = scene.onBeforeRenderObservable.add(() => {
        if (isOver || !scene || !player) return;

        for (let i = obstaclesRef.current.length - 1; i >= 0; i--) {
          const obs = obstaclesRef.current[i];
          obs.position.z -= speed;

          if (obs.intersectsMesh(player, false)) {
            isOver = true;
            setGameOver(true);
            break;
          }

          if (obs.position.z < player.position.z - 10) {
            obs.dispose();
            obstaclesRef.current.splice(i, 1);
          }
        }

        if (isOver) return;

        if (obstaclesRef.current.length < 10 && Math.random() < 0.03) {
          createObstacle();
        }

        if (inputMap["ArrowLeft"] || inputMap["a"]) player.position.x -= 0.1;
        if (inputMap["ArrowRight"] || inputMap["d"]) player.position.x += 0.1;
        player.position.x = BABYLON.Scalar.Clamp(player.position.x, -4.5, 4.5);

        internalScore += 0.1;
        setScore(Math.floor(internalScore));
        speed += speedInc;
      });

      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
        if (scene && gameLoopObserverRef.current) {
          scene.onBeforeRenderObservable.remove(gameLoopObserverRef.current);
          gameLoopObserverRef.current = null;
        }
      };
    } else {
      // Cleanup observer if 'started' becomes false while game was running
      if (gameLoopObserverRef.current && scene) {
        scene.onBeforeRenderObservable.remove(gameLoopObserverRef.current);
        gameLoopObserverRef.current = null;
      }
    }
  }, [started, canvasRef]);

  return { score, gameOver };
}
