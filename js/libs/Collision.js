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
   */
  static update() {
    for(let obj of moving_obj_arr) {

    }
  }
}

export { Collision };