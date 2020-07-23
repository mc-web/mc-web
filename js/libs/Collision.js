let env_boxs_position_hash;
let moving_obj_arr = [];

class Collision {
  static getEnvPositionHash(hash) {
    env_boxs_position_hash = hash;
  }

  static register(obj) {
    moving_obj_arr.push(obj);
  }

  /**
   * 根据碰撞情况对正在移动物体的moving_vector进行处理
   * 暂时不考虑移动物体相互碰撞的情况
   * 暂时使用坐标来判断物体的碰撞情况（后续考虑改成射线）
   * @param {*} obj 需要处理的 object
   */
  static judge(obj) {
    let next_position = new THREE.Vector3().copy(obj.position).sub(obj.moving_vector);
    next_position.x = Math.round(next_position.x * 100) / 100;
    next_position.y = Math.round(next_position.y * 100) / 100;
    next_position.z = Math.round(next_position.z * 100) / 100;

    // y 轴
    if(env_boxs_position_hash[next_position.x, next_position.y, next_position.z])
  }
}

export { Collision };