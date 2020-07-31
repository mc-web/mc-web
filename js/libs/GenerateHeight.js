import { ImprovedNoise as improved_noise } from "./ImprovedNoise.js";

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

export { generateHeight };