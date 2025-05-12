import { useEffect, useState, useRef } from "react";
import * as BABYLON from "babylonjs";

const useBabylonGame = (
  canvasRef,
  started,
  isTouchingLeft,
  isTouchingRight
) => {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const sceneRef = useRef(null);
  const playerRef = useRef(null);
  const obstaclesRef = useRef([]);
  const shadowGenRef = useRef(null);
  const gameLoopObserverRef = useRef(null);
  const isTouchingLeftRef = useRef(isTouchingLeft);
  const isTouchingRightRef = useRef(isTouchingRight);

  const engineRef = useRef(null);
  const gameMusicRef = useRef(null);
  const explosionSoundRef = useRef(null);

  useEffect(() => {
    isTouchingLeftRef.current = isTouchingLeft;
  }, [isTouchingLeft]);

  useEffect(() => {
    isTouchingRightRef.current = isTouchingRight;
  }, [isTouchingRight]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new BABYLON.Engine(canvas, true);
    engineRef.current = engine;

    const scene = new BABYLON.Scene(engine);
    sceneRef.current = scene;

    let soundInstance;
    let explosionInstance;
    if (engine.audioEngine) {
      soundInstance = new BABYLON.Sound(
        "gameMusic",
        "/sounds/gameTrack.mp3",
        scene,
        () => console.log("Sound loaded successfully via Babylon.Sound"),
        { loop: true, autoplay: false, volume: 0.5 }
      );
      explosionInstance = new BABYLON.Sound(
        "explosion",
        "/sounds/gameExplosion.mp3",
        scene,
        () => console.log("Explosion loaded successfully"),
        { loop: false, autoplay: false, volume: 1 }
      );
    } else {
      console.warn(
        "engine.audioEngine undefined; using HTMLAudioElement fallback"
      );
      const audioEl = new Audio("/sounds/gameTrack.mp3");
      audioEl.loop = true;
      audioEl.volume = 0.5;
      soundInstance = audioEl;
      const expEl = new Audio("/sounds/gameExplosion.mp3");
      expEl.loop = false;
      expEl.volume = 1;
      explosionInstance = expEl;
      console.log(
        "HTMLAudioElement created for game music and explosion sound"
      );
    }
    gameMusicRef.current = soundInstance;
    explosionSoundRef.current = explosionInstance;

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
      scene.render();
    });

    const handleResize = () => engine.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (gameMusicRef.current) gameMusicRef.current.dispose();
      engine.dispose();
      sceneRef.current = null;
      playerRef.current = null;
      obstaclesRef.current = [];
      shadowGenRef.current = null;
      gameLoopObserverRef.current = null;
    };
  }, [canvasRef]);

  useEffect(() => {
    const scene = sceneRef.current;
    const player = playerRef.current;
    const shadowGen = shadowGenRef.current;
    const sound = gameMusicRef.current;
    const engine = engineRef.current;

    if (!scene || !player || !shadowGen || !engine) return;

    const inputMap = {};
    let internalScore = 0;
    let speed = 0.02;
    const speedInc = 0.00005;
    let isOverFlag = false;

    const handleKeyDown = (e) => (inputMap[e.key] = true);
    const handleKeyUp = (e) => (inputMap[e.key] = false);

    const gameLoop = () => {
      if (isOverFlag) return;

      const deltaTime = engine.getDeltaTime() / 1000.0;
      const sixtyFpsFactor = deltaTime * 60.0;

      obstaclesRef.current.forEach((obs, i) => {
        obs.position.z -= speed * sixtyFpsFactor;
        if (obs.intersectsMesh(player, false)) {
          isOverFlag = true;
          setGameOver(true);
          player.isVisible = false;
          const particleSystem = new BABYLON.ParticleSystem(
            "particles",
            2000,
            scene
          );
          particleSystem.particleTexture = new BABYLON.Texture(
            "https://www.babylonjs-playground.com/textures/flare.png",
            scene
          );
          particleSystem.emitter = player.position.clone();
          particleSystem.minEmitBox = new BABYLON.Vector3(-0.5, -0.5, -0.5);
          particleSystem.maxEmitBox = new BABYLON.Vector3(0.5, 0.5, 0.5);
          particleSystem.color1 = new BABYLON.Color4(0.2, 0.5, 1.0, 1.0);
          particleSystem.color2 = new BABYLON.Color4(0.1, 0.3, 0.8, 1.0);
          particleSystem.colorDead = new BABYLON.Color4(0, 0, 0.2, 0.0);
          particleSystem.minSize = 0.1;
          particleSystem.maxSize = 0.5;
          particleSystem.minLifeTime = 5.0;
          particleSystem.maxLifeTime = 7.0;
          particleSystem.emitRate = 1500;
          particleSystem.manualEmitCount = 1500;
          particleSystem.targetStopDuration = 0.1;
          particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
          particleSystem.gravity = new BABYLON.Vector3(0, -9.81, 0);
          particleSystem.direction1 = new BABYLON.Vector3(-3, 3, -3);
          particleSystem.direction2 = new BABYLON.Vector3(3, 3, 3);
          particleSystem.minEmitPower = 2;
          particleSystem.maxEmitPower = 5;
          particleSystem.updateSpeed = 0.008;
          particleSystem.disposeOnStop = true;
          particleSystem.start();
          if (sound instanceof Audio) {
            sound.pause();
          } else {
            sound.stop();
          }
          const exp = explosionSoundRef.current;
          if (exp instanceof Audio) {
            exp.play().catch(console.error);
          } else {
            exp.play();
          }
        }
        if (obs.position.z < player.position.z - 10) {
          obs.dispose();
          obstaclesRef.current.splice(i, 1);
        }
      });

      if (
        !isOverFlag &&
        obstaclesRef.current.length < 10 &&
        Math.random() < 0.03
      ) {
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
      }

      if (inputMap["ArrowLeft"] || isTouchingLeftRef.current) {
        player.position.x -= 0.1 * sixtyFpsFactor;
      }
      if (inputMap["ArrowRight"] || isTouchingRightRef.current) {
        player.position.x += 0.1 * sixtyFpsFactor;
      }
      player.position.x = BABYLON.Scalar.Clamp(player.position.x, -4.5, 4.5);

      internalScore += 0.1 * sixtyFpsFactor;
      setScore(Math.floor(internalScore));
      speed += speedInc * sixtyFpsFactor;
    };

    if (started) {
      setScore(0);
      setGameOver(false);
      obstaclesRef.current.forEach((obs) => obs.dispose());
      obstaclesRef.current = [];
      player.position.set(0, 0.5, -4);
      player.isVisible = true;
      internalScore = 0;
      speed = 0.02;
      isOverFlag = false;

      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);

      if (gameLoopObserverRef.current) {
        scene.onBeforeRenderObservable.remove(gameLoopObserverRef.current);
      }
      scene.onBeforeRenderObservable.add(gameLoop);
      gameLoopObserverRef.current = gameLoop;

      if (sound) {
        if (sound instanceof Audio)
          sound.play().catch((e) => console.error("HTML Audio play error:", e));
        else if (!sound.isPlaying) sound.play();
      }
    } else {
      if (gameLoopObserverRef.current) {
        scene.onBeforeRenderObservable.remove(gameLoopObserverRef.current);
        gameLoopObserverRef.current = null;
      }
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (sound) {
        if (sound instanceof Audio) {
          sound.pause();
          sound.currentTime = 0;
        } else if (sound.isPlaying) sound.stop();
      }
    }

    return () => {
      if (gameLoopObserverRef.current) {
        scene.onBeforeRenderObservable.remove(gameLoopObserverRef.current);
        gameLoopObserverRef.current = null;
      }
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [started]);

  return { score, gameOver };
};

export default useBabylonGame;
