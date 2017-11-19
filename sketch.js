const glsl = require('glslify')
const regl = require('regl')()
const params = require('./params')
const utils = require('./utils')

const radius = 512

const weights = [
  0.05, 0.20, 0.05,
  0.20, -1.00, 0.20,
  0.05, 0.20, 0.05
]


const neighborhood = [
 [-1, -1], [0, -1], [1, -1],
 [-1, 0],  [0, 0],  [1, 0],
 [-1, 1],  [0, 1],  [1, 1],
]

const reactionParams = params.default()

const state = (Array(2)).fill().map(() =>
  regl.framebuffer({
    color: regl.texture({
      radius,
      data: utils.initInCenter(radius, 50),
      wrap: 'repeat'
    }),
    depthStencil: false
  }))

const update = regl({
  frag: glsl`
  precision mediump float;

  #pragma glslify: noise = require(glsl-noise/classic/3d)

  uniform sampler2D prevState;
  uniform mat3 weights, neighX, neighY;
  uniform float diffusionA, diffusionB, feed_rate, kill_rate, radius, time;
  varying vec2 uv;

  vec2 laplace() {
    vec2 sum = vec2(0.0);
    for( int x = 0; x < 3; x++ ) {
      for( int y = 0; y < 3; y++ ) {
        vec4 n = texture2D(prevState, uv + vec2(neighX[x][y], neighY[x][y]) / radius);
        sum.x += n.r * weights[x][y];
        sum.y += n.g * weights[x][y];
      }
    }
    return sum;
  }
  
  vec2 calculateLiquidAmounts(float a, float b, vec2 lap, float reaction, float feed, float kill) {
    return vec2(
      a + 0.001 + (diffusionA * lap.x - reaction + feed),
      b + (diffusionB * lap.y + reaction - kill)
    );
  }

  void main() {
    vec4 center = texture2D(prevState, uv);

    float a = center.x;
    float b = center.y;
    vec2 lap = laplace();
    float reaction = a * b * b;
    float feed = (feed_rate) * (1.0 - a);
    float kill = (kill_rate + feed_rate) * b;

    vec2 amounts = calculateLiquidAmounts(a, b, lap, reaction, feed, kill);

    gl_FragColor = vec4(amounts.x, amounts.y, 0.0, 1.0);
  }
  `,

  framebuffer: ({tick}) => state[(tick + 1) % 2],

  uniforms: {
    weights,
    neighX: neighborhood.map(i => i[0]),
    neighY: neighborhood.map(i => i[1]),
    radius,
    diffusionA: reactionParams.diffusion.a,
    diffusionB: reactionParams.diffusion.b,
    kill_rate: reactionParams.kill,
    feed_rate: reactionParams.feed,
    time: ({tick}) => 0.001 * tick,
  }
})

const setupQuad = regl({
  vert: glsl`
  precision mediump float;
  attribute vec2 position;
  varying vec2 uv;
  void main() {
    uv = 0.5 * (position + 1.0);
    gl_Position = vec4(position, 0, 1);
  }`,

  frag: glsl`
  precision mediump float;

  #pragma glslify: noise = require(glsl-noise/classic/2d)
  uniform sampler2D prevState;
  uniform float radius;
  varying vec2 uv;
  
  void main() {
    vec4 s = texture2D(prevState, uv);
    vec4 sN = texture2D(prevState, uv + vec2(-1.0, 1.0) / radius);
    float color = (s.g - s.r);
    gl_FragColor = vec4(vec3(color), 1.0);
  }`,
  attributes: {
    position: [ -4, -4, 4, -4, 0, 4 ]
  },
  uniforms: {
    prevState: ({tick}) => state[tick % 2],
    radius
  },
  depth: { enable: false },
  count: 3
})

regl.frame(() => {
  setupQuad(() => {
    regl.draw()
    update()
  })
})
