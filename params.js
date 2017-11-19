const utils = require('./utils')

module.exports = {
  default: () => {
    return {
      diffusion: {
        a: 1.0,
        b: 0.5,
      },
      feed: 0.055,
      kill: 0.062
    }
  },
  random: () => {
    return {
      diffusion: {
        a: utils.random(1, 1.5),
        b: utils.random(1.5,2),
      },
      feed: utils.random(0, 1) * 0.1,
      kill: utils.random(0, 1) * 0.1 
    }
  }
}
