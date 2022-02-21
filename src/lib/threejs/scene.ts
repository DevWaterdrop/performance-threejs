import * as THREE from 'three';
import type MacawImage from './image';
import MacawComposer from './composer';
import type { GeneralEffect } from './effect';
import MacawImageShader from './shaders/imageShader';
import MacawComposerShader from './shaders/composerShader';

interface Props {
	container: HTMLDivElement;
	sceneSettings: SceneSettings;
}

type ScrollSpeed = {
	speed: number;
	target: number;
	render: number;
};

export type SceneSettings = {
	alpha: boolean;
	color: number;
	maxDPR?: number;
};

type MapMeshImages = Map<string, MacawImage>;
export type MapEffects = Map<string, GeneralEffect>;

export default class MacawScene {
	readonly container: HTMLDivElement;
	readonly images: HTMLImageElement[];
	manualShouldRender: boolean;

	private time: number;
	private scrollSpeed: ScrollSpeed;
	private scrollTimes: number;

	// TODO WIP
	readonly baseMaterial: THREE.ShaderMaterial;
	readonly raycaster: THREE.Raycaster;
	readonly vector2: THREE.Vector2;
	readonly camera: THREE.PerspectiveCamera;
	readonly scene: THREE.Scene;

	observer: IntersectionObserver;
	settings: SceneSettings;
	clickRender: number;
	dimensions: { width: number; height: number };
	currentScroll: number;
	// TODO -- end

	// TODO WIP 2
	readonly renderer: THREE.WebGLRenderer;

	private macawComposer: MacawComposer;
	// TODO -- end of 2

	// TODO WIP 3
	readonly mapMeshImages: MapMeshImages;
	readonly mapEffects: Map<string, GeneralEffect>;
	readonly imageShader: MacawImageShader;
	readonly composerShader: MacawComposerShader;
	shaderEffect: Record<string, unknown>;
	// TODO rename
	isShaderPass: number;
	// TODO -- end of 3

	constructor(options: Props) {
		this.container = options.container;
		this.settings = options.sceneSettings;

		//* Default settings
		this.currentScroll = window.scrollY || document.documentElement.scrollTop;
		this.scrollTimes = 0;
		this.time = 0;
		this.scrollSpeed = {
			speed: 0,
			target: 0,
			render: 0
		};
		this.manualShouldRender = false;
		this.clickRender = 0;
		this.vector2 = new THREE.Vector2();

		// TODO
		this.mapEffects = new Map();

		this.imageShader = new MacawImageShader();
		this.composerShader = new MacawComposerShader();

		this.baseMaterial = new THREE.ShaderMaterial({
			uniforms: this.imageShader.uniforms,
			fragmentShader: this.imageShader.fragmentShader,
			vertexShader: this.imageShader.vertexShader
		});
		this.shaderEffect = {
			uniforms: this.composerShader.uniforms,
			fragmentShader: this.composerShader.fragmentShader,
			vertexShader: this.composerShader.vertexShader
		};
		this.isShaderPass = 0;
		// TODO -- end

		//* -- end of Default settings

		this.dimensions = {
			width: this.container.offsetWidth,
			height: this.container.offsetHeight
		};

		this.scene = new THREE.Scene();
		if (!this.settings.alpha) {
			this.scene.background = new THREE.Color(this.settings.color);
		}

		const near = 70;
		const far = 2000;

		this.camera = new THREE.PerspectiveCamera(
			70,
			this.dimensions.width / this.dimensions.height,
			near,
			far
		);
		this.camera.position.z = 600;
		this.camera.position.y = -this.currentScroll;
		this.camera.fov =
			2 * Math.atan(this.dimensions.height / 2 / this.camera.position.z) * (180 / Math.PI);

		this.renderer = new THREE.WebGLRenderer({
			powerPreference: 'high-performance',
			alpha: this.settings.alpha
		});

		this.renderer.setPixelRatio(Math.min(devicePixelRatio, this.settings.maxDPR ?? 1.75));
		this.container.appendChild(this.renderer.domElement);

		this.raycaster = new THREE.Raycaster();
		this.raycaster.near = near;
		this.raycaster.far = far;

		//* Composer
		this.macawComposer = new MacawComposer({
			scene: this.scene,
			camera: this.camera,
			renderer: this.renderer,
			dimensions: this.dimensions,
			shaderEffect: this.shaderEffect
		});
		//* -- end of Composer

		//* Image zone
		this.mapMeshImages = new Map();
		//* -- end of Image zone

		//* Init
		this.scroll();
		this.resize();

		this.setupObserver();
		this.setupScroll();
		this.setupResize();

		this.render();
		this.manualRender();
	}

	// TODO Same code in removeEffect
	addEffect(key: string, effect: GeneralEffect) {
		if (this.mapEffects.has(key)) {
			this.removeEffect(key);
			return false;
		}

		effect.scene = this;
		this.mapEffects.set(key, effect);

		if (effect.composerFragmentString !== undefined) {
			this.isShaderPass += 1;
			this.composerShader.create(this.mapEffects);
			this.macawComposer.refreshShaderPass(this.composerShader, effect.composerUniforms);
		}
		if (effect.imageFragmentString !== undefined) {
			this.imageShader.create(this.mapEffects);
			this.mapMeshImages.forEach((img) => {
				img.refreshMaterial(effect.imageUniforms);
			});
		}

		this.manualRender(); // TODO maybe remove

		return true;
	}

	removeEffect(key: string) {
		if (!this.mapEffects.has(key)) return false;

		const effect = { ...this.mapEffects.get(key) };
		this.mapEffects.delete(key);

		if (effect.composerFragmentString !== undefined) {
			this.isShaderPass -= 1;
			this.composerShader.create(this.mapEffects);
			this.macawComposer.refreshShaderPass(this.composerShader);
		}
		if (effect.imageFragmentString !== undefined) {
			this.imageShader.create(this.mapEffects);
			this.mapMeshImages.forEach((img) => img.refreshMaterial());
		}

		this.manualRender(); // TODO maybe remove

		return true;
	}

	// TODO make it "readonly"
	manualRender() {
		// ? Maybe set uniforms only if at least one effect is enabled from previewSettings 🧐
		this.setUniforms({ image: true, shaderPass: this.isShaderPass > 0 });

		this.mapEffects.forEach((effect) => {
			if (effect.manualRender) effect.manualRender();
		});

		// ? Find better performance solution
		if (this.isShaderPass > 0) {
			if (this.scrollTimes <= 1) this.renderer.render(this.scene, this.camera); //! Temporarily fix
			this.macawComposer.composer.render();
		} else {
			this.renderer.render(this.scene, this.camera);
		}
	}
	cleanUp() {
		// TODO WIP
		window.removeEventListener('resize', this.resize.bind(this));
		window.removeEventListener('scroll', this.scroll.bind(this));
		this.mapMeshImages.forEach((img) => {
			img.cleanUp();
		});
		this.observer.disconnect();
	}

	//* SETTER
	set Settings(sceneSettings: SceneSettings) {
		this.manualShouldRender = false;

		// TODO Change only changed 💁‍♂️
		this.scene.background = new THREE.Color(sceneSettings.color);
		// ? Maybe uncomment
		// this.mapMeshImages.forEach((image) => (image.mesh.visible = true));

		this.settings = sceneSettings;
		this.manualRender();
	}

	set Image(image: MacawImage) {
		this.mapMeshImages.set(image.element.id, image);

		this.setImagesPosition();
		this.manualRender();
	}
	//* -- end of SETTER

	private setupResize() {
		window.addEventListener('resize', this.resize.bind(this));
	}

	private setupScroll() {
		window.addEventListener('scroll', this.scroll.bind(this));
	}

	private setupObserver() {
		this.observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				const { mesh } = this.mapMeshImages.get(entry.target.id);

				mesh.visible = entry.isIntersecting;
			});
		});
	}

	private lerp(x: number, y: number, ease: number) {
		return (1 - ease) * x + ease * y;
	}

	private scrollSpeedRender() {
		/* scrollTimes > 1 => removes "first" animation if scroll position > 0,
				cannot be seen in the generator because all scroll animation by default are disabled */
		if (this.scrollTimes > 1) {
			// TODO Find better approach (without if)
			this.scrollSpeed.speed =
				Math.min(Math.abs(this.currentScroll - this.scrollSpeed.render), 200) / 200;

			this.scrollSpeed.target += (this.scrollSpeed.speed - this.scrollSpeed.target) * 0.2;
			this.scrollSpeed.render = this.lerp(this.scrollSpeed.render, this.currentScroll, 0.1);
		}

		this.macawComposer.shaderPass.uniforms.scrollSpeed.value = this.scrollSpeed.target; // ? Maybe move to setUniforms

		// TODO WIP
		// ? Maybe make it 0.01/0.1 for performance
		this.manualShouldRender = this.clickRender > 0 || this.scrollSpeed.speed > 0.01;
	}

	private scroll() {
		this.currentScroll = window.scrollY || document.documentElement.scrollTop;

		this.camera.position.setY(-this.currentScroll);

		this.scrollTimes += 1;
		//? Currently removed for better performance, it seems there is no need, and there are no bugs
		//? UPDATE: Bugs on resize, WIP to remove it
		// TODO performance => need to remove
		this.setImagesPosition();

		this.mapEffects.forEach((effect) => {
			if (effect.scroll) effect.scroll();
		});

		if (!this.shouldRender()) {
			this.manualRender();
		}
	}

	private resize() {
		this.dimensions = {
			width: this.container.offsetWidth,
			height: this.container.offsetHeight
		};

		this.camera.aspect = this.dimensions.width / this.dimensions.height;
		this.camera.fov = 2 * Math.atan(this.dimensions.height / 2 / 600) * (180 / Math.PI);
		this.camera.updateProjectionMatrix();

		this.renderer.setSize(this.dimensions.width, this.dimensions.height);
		this.macawComposer.composer.setSize(this.dimensions.width, this.dimensions.height);

		this.setImagesPosition(true);

		this.mapEffects.forEach((effect) => {
			if (effect.resize) effect.resize();
		});

		if (!this.shouldRender()) {
			this.manualRender();
		}
	}

	private shouldRender() {
		// TODO WIP
		// TODO Add to resize, scroll

		if (this.manualShouldRender) return true;
		// if (this.settings.glitch.enable) return true; // TODO remove
		return false;
	}

	//! Render
	private render() {
		this.time += 0.5;

		if (this.isShaderPass > 0) {
			this.scrollSpeedRender();
		}

		if (this.shouldRender()) {
			this.manualRender();
		}

		window.requestAnimationFrame(this.render.bind(this));
	}

	private setUniforms({ image = false, shaderPass = false }) {
		if (image) {
			this.mapMeshImages.forEach(({ material }) => {
				material.uniforms.u_time.value = this.time;
			});
		}

		if (shaderPass) {
			this.macawComposer.shaderPass.uniforms.u_time.value = this.time;
		}
	}

	//* IMAGES
	private setImagesPosition(resize = false) {
		this.mapMeshImages.forEach((img) => {
			img.setPosition(resize);
		});
	}
}
