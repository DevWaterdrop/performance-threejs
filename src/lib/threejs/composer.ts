import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import type { Uniform } from './effect';
import type MacawComposerShader from './shaders/composerShader';

interface Props {
	renderer: THREE.WebGLRenderer;
	dimensions: { width: number; height: number };
	camera: THREE.PerspectiveCamera;
	scene: THREE.Scene;
	shaderEffect: Record<string, unknown>;
}

export default class MacawComposer {
	readonly composer: EffectComposer;
	readonly renderPass: RenderPass;
	shaderPass: ShaderPass;

	constructor(options: Props) {
		const { renderer, dimensions, scene, camera, shaderEffect } = options;

		this.composer = new EffectComposer(renderer);
		this.composer.setSize(dimensions.width, dimensions.height);
		this.renderPass = new RenderPass(scene, camera);
		this.composer.addPass(this.renderPass);

		this.shaderPass = new ShaderPass(shaderEffect);
		this.shaderPass.renderToScreen = true;
		this.composer.addPass(this.shaderPass);
	}

	refreshShaderPass(shader: MacawComposerShader, additionalUniforms: Uniform = {}) {
		// TODO WIP Refactor
		const { uniforms, vertexShader, fragmentShader } = shader;

		this.composer.removePass(this.shaderPass);
		this.shaderPass = new ShaderPass({
			uniforms: { ...additionalUniforms, ...uniforms },
			vertexShader,
			fragmentShader
		});
		this.shaderPass.renderToScreen = true;
		this.composer.addPass(this.shaderPass);
	}
}
