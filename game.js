// Get the canvas element and initialize Babylon.js engine and scene
const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);
const scene = new BABYLON.Scene(engine);

// Set up the camera
const camera = new BABYLON.ArcRotateCamera(
  "Camera",
  Math.PI / 2,
  Math.PI / 4,
  10,
  BABYLON.Vector3.Zero(),
  scene
);
camera.attachControl(canvas, true);

// Set up the lighting
const light = new BABYLON.HemisphericLight(
  "light",
  new BABYLON.Vector3(0, 1, 0),
  scene
);
light.intensity = 0.7;

// Create the player's cube
const player = BABYLON.MeshBuilder.CreateBox("player", { size: 1 }, scene);
player.position.z = -4;
player.position.y = 0.5;

const playerMaterial = new BABYLON.StandardMaterial("playerMaterial", scene);
playerMaterial.diffuseColor = new BABYLON.Color3(0, 0, 1); // Blue
player.material = playerMaterial;

// Create the ground
const ground = BABYLON.MeshBuilder.CreateGround(
  "ground",
  { width: 10, height: 100 },
  scene
);
ground.position.z = 45;
ground.receiveShadows = true;

// Add directional light for shadows
const directionalLight = new BABYLON.DirectionalLight(
  "dirLight",
  new BABYLON.Vector3(0, -1, 1),
  scene
);
directionalLight.position = new BABYLON.Vector3(0, 10, -10);

// Shadow generator
const shadowGenerator = new BABYLON.ShadowGenerator(1024, directionalLight);
shadowGenerator.addShadowCaster(player);

// Function to create obstacles
const createObstacle = () => {
  const obstacle = BABYLON.MeshBuilder.CreateBox(
    "obstacle",
    { size: 1 },
    scene
  );
  obstacle.position.x = Math.random() * 8 - 4;
  obstacle.position.z = Math.random() * 20 + 10;
  obstacle.position.y = 0.5;

  const obstacleMaterial = new BABYLON.StandardMaterial(
    "obstacleMaterial",
    scene
  );
  obstacleMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0); // Red
  obstacle.material = obstacleMaterial;

  shadowGenerator.addShadowCaster(obstacle);
  return obstacle;
};

const obstacles = [];
let score = 0;
let isGameOver = false;
let obstacleSpeed = 0.1; // Initial obstacle speed
const speedIncreaseRate = 0.001; // Rate at which the speed increases

// Handle player input
const inputMap = {};
window.addEventListener("keydown", (event) => {
  inputMap[event.key] = true;
});
window.addEventListener("keyup", (event) => {
  inputMap[event.key] = false;
});

// Function to trigger cube explosion effect
const triggerCubeExplosion = () => {
  const fragments = [];

  // Create fragments by splitting the cube into smaller cubes
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      for (let k = 0; k < 5; k++) {
        const fragment = BABYLON.MeshBuilder.CreateBox(
          "fragment",
          { size: 0.2 },
          scene
        );
        fragment.position = player.position
          .clone()
          .add(
            new BABYLON.Vector3((i - 2) * 0.2, (j - 2) * 0.2, (k - 2) * 0.2)
          );

        const fragmentMaterial = new BABYLON.StandardMaterial(
          "fragmentMaterial",
          scene
        );
        fragmentMaterial.diffuseColor = BABYLON.Color3.Random(); // Random color for each fragment
        fragment.material = fragmentMaterial;

        fragments.push(fragment);

        // Apply random velocity to each fragment to simulate explosion
        const velocity = new BABYLON.Vector3(
          Math.random() * 2 - 1,
          Math.random() * 2 - 1,
          Math.random() * 2 - 1
        );
        scene.onBeforeRenderObservable.add(() => {
          fragment.position.addInPlace(
            velocity.multiplyByFloats(0.05, 0.05, 0.05)
          );
        });
      }
    }
  }

  // Remove the original player mesh
  player.dispose();
};

// Update the game state
scene.onBeforeRenderObservable.add(() => {
  if (isGameOver) return;

  // Move obstacles towards the player
  obstacles.forEach((obstacle) => {
    obstacle.position.z -= obstacleSpeed;

    // Check for collision
    if (obstacle.intersectsMesh(player, false)) {
      isGameOver = true;
      console.log("Game Over");
      document.getElementById("scoreDisplay").innerText =
        "Game Over! Final Score: " + Math.floor(score);

      // Trigger cube explosion effect
      triggerCubeExplosion();

      // Stop the game after the explosion
      setTimeout(() => {
        engine.stopRenderLoop();
      }, 2000);
      return;
    }
  });

  // Generate new obstacles
  if (Math.random() < 0.02) {
    obstacles.push(createObstacle());
  }

  // Player controls
  if (inputMap["ArrowLeft"] || inputMap["a"]) {
    player.position.x -= 0.1;
  }
  if (inputMap["ArrowRight"] || inputMap["d"]) {
    player.position.x += 0.1;
  }

  // Prevent the player from moving out of bounds
  player.position.x = BABYLON.Scalar.Clamp(player.position.x, -4.5, 4.5);

  // Update score based on distance traveled
  score += 0.1;
  document.getElementById("scoreDisplay").innerText =
    "Score: " + Math.floor(score);

  // Increase obstacle speed over time
  obstacleSpeed += speedIncreaseRate;
});

// Render loop
engine.runRenderLoop(() => {
  scene.render();
});

// Handle window resize
window.addEventListener("resize", () => {
  engine.resize();
});
