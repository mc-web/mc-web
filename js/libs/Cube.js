import { getMaterialArrHash } from "./GetMaterialArrHash.js";
let material_hash = new getMaterialArrHash();

class Cube {
  constructor(type, position) {
    this.geometry = new THREE.BoxBufferGeometry(1, 1, 1);
    let cube = new THREE.Mesh(this.geometry, material_hash[type]);

    cube.castShadow = true;
    cube.receiveShadow = true;
    cube.position.copy(position);
    return cube;
  }
}

export { Cube };