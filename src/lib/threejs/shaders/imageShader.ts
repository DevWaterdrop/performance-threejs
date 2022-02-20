import type { FragmentString, VertexString } from '../effect';
import MacawShader from '../shader';

export default class MacawImageShader extends MacawShader {
	constructor() {
		const baseUniforms = {
			u_image: { value: 0 },
			u_scale: { value: [1, 1] },
			u_time: { value: 0 },
			u_click: { value: 0 },
			u_clickPosition: { value: [0.5, 0.5] }
		};

		const baseVertex: VertexString = {
			uniforms: /*glsl*/ `
        uniform float u_time;
        uniform vec2 u_clickPosition;
        uniform float u_click;
      `,
			varying: /*glsl*/ `
        varying vec2 vUv;
      `,
			const: /*glsl*/ `
        const float PI = 3.1415925;
      `,
			beforeGl_Position: /*glsl*/ `
        vec3 newposition = position;
      `,
			afterGl_Position: /*glsl*/ `
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newposition, 1.0);
      `
		};

		const baseFragment: FragmentString = {
			uniforms: /*glsl*/ `
        uniform sampler2D u_image;
        uniform float u_time;
        uniform vec2 u_scale;
      `,
			varying: /*glsl*/ `
        varying vec2 vUv;
      `,
			beforeGl_FragColor: /*glsl*/ `
        vec2 newUV = vUv*u_scale+vec2((u_scale.x - 1.) / 2. * -1.,0.);
        vec4 image = texture2D(u_image,newUV);
      `,
			afterGl_FragColor: /*glsl*/ `
        gl_FragColor = image;
      `
		};

		const options = { baseUniforms, baseFragment, baseVertex, isImage: true };
		super(options);
	}
}
