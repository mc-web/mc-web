import {ImprovedNoise as improved_noise} from "./libs/ImprovedNoise.js";
const WORLD_WIDTH = 20;
const WORLD_LENGTH = 20;


const screen_width = document.documentElement.clientWidth,
    screen_height = document.documentElement.clientHeight;
    
const renderer = new THREE.WebGLRenderer();
renderer.setSize(screen_width, screen_height);
document.getElementsByTagName('body')[0].appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color( 0xbfd1e5 );

const camera = new THREE.PerspectiveCamera(45, screen_width / screen_height, 0.1, 1000);
camera.position.set(0,15,0);
camera.lookAt(new THREE.Vector3(0, 0, 0));
scene.add(camera);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1000);
scene.add(directionalLight);

let geometry = new THREE.BoxGeometry(3, 3, 3);
let url_list = ["./textures/grass_dirt.png", "./textures/grass_dirt.png",
                "./textures/grass.png", "./textures/dirt.png",
                "./textures/grass_dirt.png", "./textures/grass_dirt.png"];
let materials = [];
for(let url of url_list) {
    materials.push(
        new THREE.MeshBasicMaterial({
            map: new THREE.TextureLoader().load(url),
            side: THREE.DoubleSide,
        })
    );
}

let heights_arr = generateHeight(WORLD_WIDTH, WORLD_LENGTH);
for(let i = 0; i < WORLD_LENGTH; i++) {
    for(let j = 0; j < WORLD_WIDTH; j++) {
        for(let h = 0; h < Math.abs(heights_arr[i * WORLD_WIDTH + j] * 0.2 | 0); h++) {
            let cube2 = new THREE.Mesh(geometry, materials);
            cube2.position.x = i;
            cube2.position.y = h;
            cube2.position.z = j;
            scene.add(cube2);
        }
    }
}

console.log(scene)
renderer.render(scene, camera);

let orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
console.log(orbitControls)
window.requestAnimationFrame(step);
function step() {
    renderer.render(scene, camera);
    console.log(1)
    window.requestAnimationFrame(step)
}


function generateHeight( width, height ) {
    let data = [], perlin = new improved_noise(),
        size = width * height, 
        quality = 2, 
        z = Math.random() * 100;

    for (let j = 0; j < 4; j ++) {
        if (j === 0) {
            for (let i = 0; i < size; i ++) {
                data[ i ] = 0;
            }
        }
        for (let i = 0; i < size; i ++) {
            let x = i % width, 
                y = ( i / width ) | 0;
            data[i] += perlin.noise(x / quality, y / quality, z) * quality;
        }
        quality *= 4;
    }

    return data;

}