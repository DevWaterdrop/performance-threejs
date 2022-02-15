import type { SceneSettings } from '$lib/types';
import * as THREE from 'three';
import vertex from '$lib/threejs/shaders/vertex.glsl?raw';
import fragment from '$lib/threejs/shaders/fragment.glsl?raw';
import type MacawImage from './image';
import MacawComposer from './composer';

interface Props {
	container: HTMLDivElement;
	sceneSettings: SceneSettings;
}

type ScrollSpeed = {
	speed: number;
	target: number;
	render: number;
};

type MapMeshImages = Map<string, MacawImage>;

export default class MacawScene {
	readonly container: HTMLDivElement;
	readonly images: HTMLImageElement[];
	manualShouldRender: boolean;

	private time: number;
	private scrollSpeed: ScrollSpeed;
	private scrollTimes: number;
	private mapMeshImages: MapMeshImages;

	// TODO WIP
	readonly baseMaterial: THREE.ShaderMaterial;
	readonly raycaster: THREE.Raycaster;
	readonly vector2: THREE.Vector2;
	readonly camera: THREE.PerspectiveCamera;
	readonly scene: THREE.Scene;
	readonly materials: THREE.ShaderMaterial[];

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
		const { glitch, waveClick } = this.settings;
		this.baseMaterial = new THREE.ShaderMaterial({
			uniforms: {
				u_image: { value: 0 },
				u_scale: { value: [1, 1] },
				u_time: { value: 0 },
				u_click: { value: 0 },
				u_clickPosition: { value: [0.5, 0.5] }, // Center of Image
				u_glitch: { value: glitch },
				u_waveClick: { value: waveClick }
			},
			fragmentShader: fragment,
			vertexShader: vertex
		});
		// TODO -- end

		//* -- end of Default settings

		this.dimensions = {
			width: this.container.offsetWidth,
			height: this.container.offsetHeight
		};

		this.scene = new THREE.Scene();
		if (!this.settings.options.alpha) {
			this.scene.background = new THREE.Color(this.settings.options.color);
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
			alpha: this.settings.options.alpha
		});

		this.renderer.setPixelRatio(Math.min(devicePixelRatio, this.settings.options.maxDPR ?? 1.75));
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
			settings: this.settings
		});
		//* -- end of Composer

		//* Image zone
		this.materials = [];
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

	//* SETTER
	set Settings(sceneSettings: SceneSettings) {
		this.manualShouldRender = false;

		// TODO Change only changed 💁‍♂️
		this.scene.background = new THREE.Color(sceneSettings.options.color);
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

	//* GETTER
	get PreviewSettings() {
		return this.settings;
	}
	//* -- end of GETTER

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
		// this.setImagesPosition();

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
		if (!this.shouldRender()) {
			this.manualRender();
		}
	}

	// TODO make it "readonly"
	manualRender() {
		const isShaderPass = this.settings.scroll.enable || this.settings.scrollTop.enable;

		// ? Maybe set uniforms only if at least one effect is enabled from previewSettings 🧐
		this.setUniforms({ image: true, shaderPass: isShaderPass });

		// ? Find better performance solution
		if (isShaderPass) {
			if (this.scrollTimes <= 1) this.renderer.render(this.scene, this.camera); //! Temporarily fix
			this.macawComposer.composer.render();
		} else {
			this.renderer.render(this.scene, this.camera);
		}
	}

	private shouldRender() {
		// TODO WIP
		// TODO Add to resize, scroll

		if (this.manualShouldRender) return true;
		if (this.settings.glitch.enable) return true;
		return false;
	}

	//! Render
	private render() {
		this.time += 0.5;

		if (this.settings.scroll.enable) {
			this.scrollSpeedRender();
		}

		if (this.shouldRender()) {
			this.manualRender();
		}

		window.requestAnimationFrame(this.render.bind(this));
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

	private setUniforms({ image = false, shaderPass = false }) {
		const { glitch, waveClick, scroll, scrollTop } = this.settings;

		if (image) {
			for (const material of this.materials) {
				material.uniforms.u_time.value = this.time;
				material.uniforms.u_glitch.value = glitch;
				material.uniforms.u_waveClick.value = waveClick;
			}
		}

		if (shaderPass) {
			this.macawComposer.shaderPass.uniforms.u_time.value = this.time;
			this.macawComposer.shaderPass.uniforms.u_scroll.value = scroll;
			this.macawComposer.shaderPass.uniforms.u_scrollTop.value = scrollTop;
		}
	}

	//* IMAGES
	private setImagesPosition(resize = false) {
		this.mapMeshImages.forEach((img) => {
			img.setPosition(resize);
		});
	}
}
