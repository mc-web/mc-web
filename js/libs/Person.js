const PI = Math.PI;
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
    this.updateLookAt();

    // 灵敏度
    this.sensity_x = 0.3;
    this.sensity_y = 0.3;
    this.speed = 1 / 5;

    this.pointer_locked = false;

    this.move_keys = ["w", "s", "a", "d"];
    this.pressing_key_flag = 0; // 对应的位表示对应index的move_key是否现在被按下了

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

    this.element.addEventListener("mousemove", (e) => {
      if(this.pointer_locked) {
        this.rotation += e.movementX / this.element.clientWidth * PI * 2 * this.sensity_x;
        this.rotation %= PI * 2;
        this.pitch -= e.movementY / this.element.clientHeight * PI * this.sensity_y;
        if(this.pitch > this.max_pitch) this.pitch = this.max_pitch;
        if(this.pitch < this.min_pitch) this.pitch = this.min_pitch;
        this.pitch %= PI;
        this.updateLookAt();
      }
    });

    document.addEventListener("keydown", (e) => {
      if(this.pointer_locked) {
        let idx = this.move_keys.indexOf(e.key);
        if(idx !== -1) this.pressing_key_flag |= 1 << idx;
      }
    });

    this.registerAnimationFrame();
  }

  /**
   * 
   * @param {*} idx 
   * 0: front，
   * 1: end，
   * 2: left,
   * 3: right
   * 
   */
  move(idx) {
    let vector = new THREE.Vector3().copy(this.vector);
    vector.y = 0;
    vector.normalize().divideScalar(1 / this.speed); // 去掉视线y方向分量之后的单位向量
    
    let rotate_matrix = new THREE.Matrix4(), vector2 = new THREE.Vector3();
    rotate_matrix.makeRotationY(PI / 2);
    vector2.copy(vector).applyMatrix4(rotate_matrix).divideScalar(1 / this.speed);

    if(idx === 0) {
      this.camera.position.sub(vector);
    } else if(idx === 1) {
      this.camera.position.add(vector);
    } else if(idx === 2) {
      this.camera.position.sub(vector2);
    } else if(idx === 3) {
      this.camera.position.add(vector2);
    }

    this.updateLookAt(false);
  }

  /**
   * 
   * @param {*} vector_update 
   * 在视线并没有更新的时候传入false，避免不必要的计算
   * 
   */
  updateLookAt(vector_update = true) {
    if(vector_update) {
      this.vector.y = Math.cos(this.pitch);
      let temp = Math.sin(this.pitch);
      this.vector.x = Math.cos(this.rotation) * temp;
      this.vector.z = Math.sin(this.rotation) * temp;
    }

    let lookat_point = new THREE.Vector3();
    lookat_point.copy(this.position).sub(this.vector);
    this.camera.lookAt(lookat_point);
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

  registerAnimationFrame() {
    let step = (timestamp) => {
      window.requestAnimationFrame(step);
    };

    window.requestAnimationFrame(step);
  }
}

export { Person };