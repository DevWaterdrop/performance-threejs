uniform sampler2D tDiffuse;
uniform float scrollSpeed;

varying vec2 vUv;

void main(){
  vec2 newUV = vUv;

  float area = smoothstep(0.4,0.,vUv.y);
  area = pow(area,4.);

  newUV.x -= (vUv.x - 0.5)*0.1*area*scrollSpeed;

  gl_FragColor = texture2D(tDiffuse, newUV);
  // gl_FragColor = vec4(area,0.,0.,1.); // Uncomment for debug
}