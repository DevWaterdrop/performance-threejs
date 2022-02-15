import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import composerVertex from '$lib/threejs/composer_shaders/vertex.glsl?raw';
import composerFragment from '$lib/threejs/composer_shaders/fragment.glsl?raw';
import type { SceneSettings } from '$lib/types';

interface Props {
	settings: SceneSettings;
	renderer: THREE.WebGLRenderer;
	dimensions: { width: number; height: number };
	camera: THREE.PerspectiveCamera;
	scene: THREE.Scene;
}

export default class MacawComposer {
	readonly composer: EffectComposer;
	readonly renderPass: RenderPass;
	readonly shaderPass: ShaderPass;

	constructor(options: Props) {
		const { renderer, settings, dimensions, scene, camera } = options;

		this.composer = new EffectComposer(renderer);
		this.composer.setSize(dimensions.width, dimensions.height);
		this.renderPass = new RenderPass(scene, camera);
		this.composer.addPass(this.renderPass);

		const { scroll, scrollTop } = settings;

		const shaderEffect = {
			uniforms: {
				tDiffuse: { value: null },
				scrollSpeed: { value: 0 },
				u_time: { value: 0 },
				u_scroll: { value: scroll },
				u_scrollTop: { value: scrollTop }
			},
			fragmentShader: composerFragment,
			vertexShader: composerVertex
		};

		this.shaderPass = new ShaderPass(shaderEffect);
		this.shaderPass.renderToScreen = true;
		this.composer.addPass(this.shaderPass);
	}
}
