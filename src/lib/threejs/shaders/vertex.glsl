// Struct
struct WaveClick {
	bool enable;
};

// Uniform
uniform float u_time;
uniform vec2 u_clickPosition;
uniform float u_click;
uniform WaveClick u_waveClick;

// Varying
varying float vNoise;
varying vec2 vUv;

// Const
const float PI = 3.1415925;

void main() {
  vec3 newposition = position;

  if(u_waveClick.enable) {
    float dist = distance(uv, u_clickPosition);

    newposition.z += u_click*10.*sin(dist*10. + u_time);
    vNoise = u_click*sin(dist*10. - u_time);
  }

  vUv = uv;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(newposition, 1.0);
}