class getMaterialArrHash {
  constructor() {
    this.textures = {
      "grass_dirt": [
        "./textures/grass_dirt.png", "./textures/grass_dirt.png",
        "./textures/grass.png", "./textures/dirt.png",
        "./textures/grass_dirt.png", "./textures/grass_dirt.png"
      ],
      "dirt": [
        "./textures/dirt.png","./textures/dirt.png","./textures/dirt.png",
        "./textures/dirt.png","./textures/dirt.png","./textures/dirt.png"
      ]
    };

    let material_arr_hash = {};
    for(let type in this.textures) material_arr_hash[type] = this.generateMaterialArr(this.textures[type]);
    return material_arr_hash;
  }

  generateMaterialArr(texture_arr) {
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


}

export { getMaterialArrHash };