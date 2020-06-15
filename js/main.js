import { ImprovedNoise as improved_noise } from "./libs/ImprovedNoise.js";
import { Person } from "./libs/Person.js";
import { Collision } from "./libs/Collision.js";
import { Cube } from "./libs/Cube.js";
import { getMaterialArrHash } from "./libs/getMaterialArrHash.js";
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
camera.position.set(1, 10, 10);
camera.lookAt(new THREE.Vector3(2, 10, 10));
scene.add(camera);

var spotLight = new THREE.SpotLight( 0xffffff, 1.3 );
spotLight.position.set( -20, 20, -20 );
spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;
scene.add( spotLight );

var light = new THREE.AmbientLight(0xffffff, 1.1); // soft white light
scene.add( light );

let cameraHelper = new THREE.CameraHelper(spotLight.shadow.camera);
scene.add(cameraHelper);

let position_hash = {};

// generate cubes
let heights_arr = generateHeight(WORLD_WIDTH, WORLD_LENGTH);
for(let i = 0; i < heights_arr.length; i++) heights_arr[i] = Math.abs(heights_arr[i] * 0.2 | 0);

let material_hash = new getMaterialArrHash();
let geometries_hash = {};
for(let i = 0; i < WORLD_LENGTH; i++) {
  for(let j = 0; j < WORLD_WIDTH; j++) {
    for(let h = 0; h < heights_arr[i * WORLD_WIDTH + j]; h++) {
      let cube;
      let position = new THREE.Vector3(i * a, h * a, j * a);
      if(h === heights_arr[i * WORLD_WIDTH + j] - 1) {
        // grass_dirt
        if(!geometries_hash["grass_dirt"]) geometries_hash["grass_dirt"] = [];
        cube = new Cube(material_hash, "grass_dirt", position);
        geometries_hash["grass_dirt"].push(cube.geometry);
      } else {
        // dirt
        if(!geometries_hash["dirt"]) geometries_hash["dirt"] = [];
        cube = new Cube(material_hash, "dirt", position);
        geometries_hash["dirt"].push(cube.geometry);
      }
      position_hash[[position.x, position.y, position.z]] = cube;
    }
  }
}
for(let type in geometries_hash) {
  scene.add(new THREE.Mesh(THREE.BufferGeometryUtils.mergeBufferGeometries(geometries_hash[type]), material_hash[type]));
}


// let orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
let person = new Person(camera, renderer.domElement);
let person_collision = new Collision(person, position_hash);

let stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

window.requestAnimationFrame(step);
function step(timestamp) {
  stats.begin();
  stats.end();

  person.update(timestamp);
  person_collision.update(timestamp);
  
  renderer.render(scene, camera);
  window.requestAnimationFrame(step);
}

function generateHeight(width, height) {
  let data = [], perlin = new improved_noise(),
    size = width * height, 
    quality = 2, 
    z = Math.random() * 100;

  for (let j = 0; j < 4; j++) {
    if (j === 0) {
      for (let i = 0; i < size; i++) {
        data[i] = 0;
      }
    }
    for (let i = 0; i < size; i++) {
      let x = i % width, 
      y = (i / width) | 0;
      data[i] += perlin.noise(x / quality, y / quality, z) * quality;
    }
    quality *= 4;
  }
  return data;
}