import {ImprovedNoise as improved_noise} from "./libs/ImprovedNoise.js";
const WORLD_WIDTH = 20;
const WORLD_LENGTH = 20;
const a = 1; //方块边长
const screen_width = document.documentElement.clientWidth,
    screen_height = document.documentElement.clientHeight;



// init
const renderer = new THREE.WebGLRenderer();
renderer.setSize(screen_width, screen_height);
document.getElementsByTagName('body')[0].appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color( 0xbfd1e5 );

const camera = new THREE.PerspectiveCamera(45, screen_width / screen_height, 0.1, 1000);
camera.position.set(0,10,0);
camera.lookAt(new THREE.Vector3(0, 0, 0));
scene.add(camera);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1000);
scene.add(directionalLight);



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
for(let i = 0; i < WORLD_LENGTH; i++) {
    for(let j = 0; j < WORLD_WIDTH; j++) {
        for(let h = 0; h < Math.abs(heights_arr[i * WORLD_WIDTH + j] * 0.2 | 0); h++) {
            let cube;
            if(h === Math.abs(heights_arr[i * WORLD_WIDTH + j] * 0.2 | 0) - 1) {
                // grass_dirt
                cube = new THREE.Mesh(geometry, grass_dirt_materials);
            } else {
                // grass
                cube = new THREE.Mesh(geometry, dirt_materials);
            }

            cube.position.x = i * a;
            cube.position.y = h * a;
            cube.position.z = j * a;
            scene.add(cube);
        }
    }
}

renderer.render(scene, camera);

let orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
window.requestAnimationFrame(step);
function step() {
    renderer.render(scene, camera);
    window.requestAnimationFrame(step)
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
            new THREE.MeshBasicMaterial({
                map: texture,
                side: THREE.DoubleSide,
            })
        );
    }
    return materials;
}