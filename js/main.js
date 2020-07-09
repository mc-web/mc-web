import { ImprovedNoise as improved_noise } from "./libs/ImprovedNoise.js";
import { Person } from "./libs/Person.js";
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

// generate cubes
let geometry = new THREE.BoxGeometry(a, a, a);

let grass_dirt_materials = generateMaterialArr([
  "./textures/grass_dirt.png", "./textures/grass_dirt.png",
  "./textures/grass.png", "./textures/dirt.png",
  "./textures/grass_dirt.png", "./textures/grass_dirt.png"
]);

let dirt_materials = generateMaterialArr([
  "./textures/dirt.png","./textures/dirt.png","./textures/dirt.png",
  "./textures/dirt.png","./textures/dirt.png","./textures/dirt.png"
]);

let heights_arr = generateHeight(WORLD_WIDTH, WORLD_LENGTH);
let env_boxs_position_hash = {};
for(let i = 0; i < heights_arr.length; i++) heights_arr[i] = Math.abs(heights_arr[i] * 0.2 | 0);

for(let i = 0; i < WORLD_LENGTH; i++) {
  for(let j = 0; j < WORLD_WIDTH; j++) {
    for(let h = 0; h < heights_arr[i * WORLD_WIDTH + j]; h++) {
      let cube;
      if(h === heights_arr[i * WORLD_WIDTH + j] - 1) {
        // grass_dirt
        cube = new THREE.Mesh(geometry, grass_dirt_materials);
        env_boxs_position_hash[[i, h, j]] = "grass_dirt";
      } else {
        // grass
        cube = new THREE.Mesh(geometry, dirt_materials);
        env_boxs_position_hash[[i, h, j]] = "dirt";
      }

      cube.castShadow = true;
      cube.receiveShadow = true;
      cube.position.x = i * a;
      cube.position.y = h * a;
      cube.position.z = j * a;
      scene.add(cube);
    }
  }
}

// let orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
Person.get_env_position_hash(env_boxs_position_hash);
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

function generateMaterialArr(texture_arr) {
  let materials = [];
  for(let url of texture_arr) {
    let texture = new THREE.TextureLoader().load(url);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    materials.push(
      new THREE.MeshLambertMaterial({
        map: texture,
        side: THREE.DoubleSide, 
        shadowSide: THREE.BackSide
      })
    );
  }
  return materials;
}