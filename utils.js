module.exports = {
  random: (min, max) => {
    return Math.random() * (max - min) + min
  }, 
  initInCenter: (rad, seedSize) => {
    const temp = []
    for( let i = 0; i < rad; i += 1 ) {
      for( let j = 0; j < rad; j += 1 ) {
        let cell = [255.0, 0.0, 0.0, 255.0]
        if (( i > Math.floor( rad / 2 ) - seedSize) &&
          (i < Math.floor( rad / 2 ) + seedSize) &&
          (j > Math.floor( rad / 2 ) - seedSize) &&
          (j < Math.floor( rad / 2 ) + seedSize)) {
          cell = [255.0, 255.0, 0.0, 255.0]
        }
        for( let k = 0; k < 4; k += 1 ) {
          temp.push(cell[k])
        }
      }
    }
    return temp
  },
  initRandom: (rad, chance) => {
    const temp = []
    for( let i = 0; i < rad; i += 1 ) {
      for( let j = 0; j < rad; j += 1 ) {
        let cell = [255.0, (Math.random() > chance) ? 0.0 : 255.0, 0.0, 255.0]
        for( let k = 0; k < 4; k += 1 ) {
          temp.push(cell[k])
        }
      }
    }
    return temp
  }
}
