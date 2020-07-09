const PI = Math.PI;
let env_boxs_position_hash;

class Person {
  constructor(camera, element) {
    this.camera = camera;
    this.element = element;

    this.position = this.camera.position;
    this.pitch = PI * 0.5;    // 0.01PI ~ 0.99PI  从上往下看0 从下往上看PI
    this.max_pitch = PI * 0.99;
    this.min_pitch = PI * 0.15;
    this.rotation = PI;     // 0 ~ 2PI  x轴正方向为0 从上往下看顺时针递增 camera所在的位置为准
    this.vector = new THREE.Vector3(); // 视线单位向量

    // 灵敏度
    this.sensity_x = 0.3;
    this.sensity_y = 0.3;
    this.speed = 3; // 1代表1s移动1格

    this.pointer_locked = false;

    this.move_keys = ["w", "s", "a", "d"];
    this.pressing_keys = Array(this.move_keys.length).fill(0);

    this.gravity = 0.1; // 掉落速度 相对于this.speed

    this.init();
  }

  init() {
    document.addEventListener("pointerlockchange", (e) => {
      this.pointer_locked = !this.pointer_locked;
    });

    this.element.addEventListener("click", (e) => {
      if(!this.pointer_locked) {
        this.lockPointer(this.element);
      }
    });

    // 视角移动
    this.element.addEventListener("mousemove", (e) => {
      if(this.pointer_locked) {
        this.rotation += e.movementX / this.element.clientWidth * PI * 2 * this.sensity_x;
        this.rotation %= PI * 2;
        this.pitch -= e.movementY / this.element.clientHeight * PI * this.sensity_y;
        if(this.pitch > this.max_pitch) this.pitch = this.max_pitch;
        if(this.pitch < this.min_pitch) this.pitch = this.min_pitch;
        this.pitch %= PI;
      }
    });

    document.addEventListener("keydown", (e) => {
      if(this.pointer_locked) {
        let idx = this.move_keys.indexOf(e.key);
        if(idx !== -1) this.pressing_keys[idx] = 1;
      }
    });
    document.addEventListener("keyup", (e) => {
      if(this.pointer_locked) {
        let idx = this.move_keys.indexOf(e.key);
        if(idx !== -1) this.pressing_keys[idx] = 0;
      }
    });
  }

  lockPointer(elem) {
    if (elem.requestPointerLock) {
      elem.requestPointerLock();
    } else if (elem.webkitRequestPointerLock) {
      elem.webkitRequestPointerLock();
    } else if (elem.mozRequestPointerLock) {
      elem.mozRequestPointerLock();
    } else {
      console.warn("Pointer locking not supported");
    }
  }

  update(timestamp) {
    if(!this.last_timestamp) this.last_timestamp = timestamp;
    let diff = timestamp - this.last_timestamp;

    // 计算移动方向上的单位向量
    let moving_vector = new THREE.Vector3(0, this.gravity, 0);
    
    // 按 速度&按下的key 修改这一帧的移动向量
    let vertical_vector = new THREE.Vector3();
    vertical_vector.x = Math.cos(this.rotation) * Math.sin(this.pitch);
    vertical_vector.y = this.gravity;
    vertical_vector.z = Math.sin(this.rotation) * Math.sin(this.pitch);
    vertical_vector.normalize(); // 去掉视线y方向分量之后的单位向量
    vertical_vector.divideScalar(1000 / this.speed / diff); 

    let rotate_matrix = new THREE.Matrix4(), horizontal_vector = new THREE.Vector3(); // 向右边的单位向量
    rotate_matrix.makeRotationY(PI / 2);
    horizontal_vector.copy(vertical_vector).applyMatrix4(rotate_matrix);

    for(let i = 0; i < this.pressing_keys.length; i++) {
      if(this.pressing_keys[i] === 1) {
        if(i === 0) {
          moving_vector.copy(vertical_vector);
        } else if(i === 1) {
          moving_vector.copy(vertical_vector).divideScalar(-1);
        } else if(i === 2) {
          moving_vector.copy(horizontal_vector);
        } else if(i === 3) {
          moving_vector.copy(horizontal_vector).divideScalar(-1);
        }
      }
    }

    // 判断碰撞
    console.log(this.position, [Math.floor(this.position.x), Math.floor(this.position.y) - 1, Math.floor(this.position.z)], env_boxs_position_hash);
    if(env_boxs_position_hash[[Math.floor(this.position.x), Math.floor(this.position.y) - 1, Math.floor(this.position.z)]]) moving_vector.y = 0;



    if(vertical_vector.x >= 0) {
      if(env_boxs_position_hash[[Math.ceil(this.position.x), Math.floor(this.position.y), Math.floor(this.position.z)]]) moving_vector.x = 0;
    } else {
      if(env_boxs_position_hash[[Math.floor(this.position.x), Math.floor(this.position.y), Math.floor(this.position.z)]]) moving_vector.x = 0;
    }
    if(vertical_vector.z >= 0) {
      if(env_boxs_position_hash[[Math.floor(this.position.x), Math.floor(this.position.y), Math.ceil(this.position.z)]]) moving_vector.z = 0;
    } else {
      if(env_boxs_position_hash[[Math.floor(this.position.x), Math.floor(this.position.y), Math.floor(this.position.z)]]) moving_vector.z = 0;
    }


    
    this.position.sub(moving_vector);
    this.last_timestamp = timestamp;
    this.camera.position.copy(this.position);
    this.camera.position.x = Math.round(this.camera.position.x * 100) / 100;    
    this.camera.position.y = Math.round(this.camera.position.y * 100) / 100;    
    this.camera.position.z = Math.round(this.camera.position.z * 100) / 100;    

    // 更新lookat
    let vector = new THREE.Vector3();
    vector.y = Math.cos(this.pitch);
    let temp = Math.sin(this.pitch);
    vector.x = Math.cos(this.rotation) * temp;
    vector.z = Math.sin(this.rotation) * temp;

    let lookat_point = new THREE.Vector3();
    lookat_point.copy(this.position).sub(vector);
    this.camera.lookAt(lookat_point);
  }

  static get_env_position_hash(hash) {
    env_boxs_position_hash = hash;
  }
}

export { Person };