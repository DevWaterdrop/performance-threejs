import type { FragmentString, VertexString } from '../effect';
import MacawShader from '../shader';
import { perlinNoise } from '../shader_utils/perlin_noise';

export default class MacawComposerShader extends MacawShader {
	constructor() {
		const baseUniforms = {
			tDiffuse: { value: null },
			scrollSpeed: { value: 0 },
			u_time: { value: 0 }
		};

		const baseVertex: VertexString = {
			varying: /*glsl*/ `
        varying vec2 vUv;
      `,
			beforeGl_Position: /*glsl*/ `
        vUv = uv;
      `,
			afterGl_Position: /*glsl*/ `
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      `
		};

		const baseFragment: FragmentString = {
			utils: /*glsl*/ `
      ${perlinNoise}
      `,
			uniforms: /*glsl*/ `
        uniform sampler2D tDiffuse;
        uniform float scrollSpeed;
        uniform float u_time;
      `,
			varying: /*glsl*/ `
        varying vec2 vUv;
      `,
			beforeGl_FragColor: /*glsl*/ `
        vec2 newUV = vUv;
      `,
			afterGl_FragColor: /*glsl*/ `
        gl_FragColor = texture2D(tDiffuse, newUV);
      `
		};

		const options = { baseUniforms, baseFragment, baseVertex, isImage: false };
		super(options);
	}
}
