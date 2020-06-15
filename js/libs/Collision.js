class Collision {
  constructor(removeable_mesh, height_arr) {
    this.mesh = removeable_mesh;
    this.position = removeable_mesh.position;
    this.height_arr = height_arr;
  }

  update() {
    // console.log(this.mesh)
  }
}

export { Collision };