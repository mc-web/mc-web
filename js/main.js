import { Person } from "./libs/Person.js";
import { Collision } from "./libs/Collision.js";
import { Cube } from "./libs/Cube.js";
import { generateHeight } from "./libs/GenerateHeight.js";
import Stats from "./libs/Stats.js";

const WORLD_WIDTH = 20;
const WORLD_LENGTH = 20;
const a = 1; //方块边长
const screen_width = document.documentElement.clientWidth,
  screen_height = document.documentElement.clientHeight - 4;



// init
const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(screen_width, screen_height);
document.getElementsByTagName('body')[0].appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color( 0xbfd1e5 );

const camera = new THREE.PerspectiveCamera(45, screen_width / screen_height, 0.1, 1000);
camera.position.set(1, 20, 10);
camera.lookAt(new THREE.Vector3(2, 20, 10));
scene.add(camera);

let spotLight = new THREE.SpotLight( 0xffffff, 1.3 );
spotLight.position.set( -20, 20, -20 );
// spotLight.castShadow = true;
// spotLight.shadow.mapSize.width = 1024;
// spotLight.shadow.mapSize.height = 1024;
scene.add( spotLight );

let light = new THREE.AmbientLight(0xffffff, 1.1); // soft white light
scene.add( light );

let cameraHelper = new THREE.CameraHelper(spotLight.shadow.camera);
scene.add(cameraHelper);


// generate cubes
let env_boxs_position_hash = {};
let heights_arr = generateHeight(WORLD_WIDTH, WORLD_LENGTH);
for(let i = 0; i < heights_arr.length; i++) heights_arr[i] = Math.abs(heights_arr[i] * 0.2 | 0);

let geometries_hash = {};
for(let i = 0; i < WORLD_LENGTH; i++) {
  for(let j = 0; j < WORLD_WIDTH; j++) {
    for(let h = 0; h < heights_arr[i * WORLD_WIDTH + j]; h++) {
      let cube;
      let position = new THREE.Vector3(i * a, h * a, j * a);
      if(h === heights_arr[i * WORLD_WIDTH + j] - 1) {
        // grass_dirt
        if(!geometries_hash["grass_dirt"]) geometries_hash["grass_dirt"] = [];
        cube = new Cube("grass_dirt", position);
        geometries_hash["grass_dirt"].push(cube.geometry);
      } else {
        // dirt
        if(!geometries_hash["dirt"]) geometries_hash["dirt"] = [];
        cube = new Cube("dirt", position);
        geometries_hash["dirt"].push(cube.geometry);
      }
      env_boxs_position_hash[[position.x, position.y, position.z]] = cube;
      cube.castShadow = true;
      cube.receiveShadow = true;
      cube.position.x = i * a;
      cube.position.y = h * a;
      cube.position.z = j * a;
      scene.add(cube);
    }
  }
}


Collision.getEnvPositionHash(env_boxs_position_hash);
let person = new Person(camera, renderer.domElement);

let stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

window.requestAnimationFrame(step);
function step(timestamp) {
  stats.begin();
  stats.end();

  person.update(timestamp);
  
  renderer.render(scene, camera);
  window.requestAnimationFrame(step);
}