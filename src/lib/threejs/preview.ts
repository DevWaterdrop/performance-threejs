import type { PreviewSettings } from '$lib/types';
import * as THREE from 'three';
import vertex from '$lib/threejs/shaders/vertex.glsl?raw';
import fragment from '$lib/threejs/shaders/fragment.glsl?raw';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import composerVertex from '$lib/threejs/composer_shaders/vertex.glsl?raw';
import composerFragment from '$lib/threejs/composer_shaders/fragment.glsl?raw';
import anime from 'animejs';

interface Props {
	container: HTMLDivElement;
	images: HTMLImageElement[];
	previewSettings: PreviewSettings;
}

type MeshImage = {
	element: HTMLImageElement;
	mesh: THREE.Mesh;
	top: number;
	left: number;
	width: number;
	height: number;
	material: THREE.ShaderMaterial;
};

type ScrollSpeed = {
	speed: number;
	target: number;
	render: number;
};

export default class ThreePreview {
	readonly container: HTMLDivElement;
	readonly images: HTMLImageElement[];
	previewSettings: PreviewSettings;
	manualShouldRender: boolean;

	private time: number;
	private dimensions: { width: number; height: number };
	private scrollSpeed: ScrollSpeed;
	private scene: THREE.Scene;
	private camera: THREE.PerspectiveCamera;
	private renderer: THREE.WebGLRenderer;
	private materials: THREE.ShaderMaterial[];
	private meshImages: MeshImage[];
	private currentScroll: number;
	private raycaster: THREE.Raycaster;
	private composer: EffectComposer;
	private renderPass: RenderPass;
	private shaderPass: ShaderPass;
	private scrollTimes: number;

	constructor(options: Props) {
		this.container = options.container;
		this.images = options.images;
		this.previewSettings = options.previewSettings;

		//* Default settings
		this.currentScroll = 0;
		this.scrollTimes = 0;
		this.time = 0;
		this.scrollSpeed = {
			speed: 0,
			target: 0,
			render: 0
		};
		this.manualShouldRender = false;
		//* -- end of Default settings

		this.dimensions = {
			width: this.container.offsetWidth,
			height: this.container.offsetHeight
		};

		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(
			70,
			this.dimensions.width / this.dimensions.height,
			100,
			2000
		);
		this.camera.position.z = 600;
		this.camera.fov = 2 * Math.atan(this.dimensions.height / 2 / 600) * (180 / Math.PI);

		this.renderer = new THREE.WebGLRenderer({ alpha: true });
		this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
		this.container.appendChild(this.renderer.domElement);

		this.raycaster = new THREE.Raycaster();

		//* Image zone
		this.materials = [];
		this.meshImages = [];
		const promiseImages = this.images.map((image) => this.addImage(image));
		//* -- end of Image zone

		Promise.all(promiseImages).then(() => {
			//* Init
			this.composerPass();
			this.scroll();
			this.resize();

			this.setupScroll();
			this.setupResize();

			this.render();
			this.manualRender();
		});
	}

	private setupResize() {
		window.addEventListener('resize', this.resize.bind(this));
	}

	private setupScroll() {
		window.addEventListener('scroll', this.scroll.bind(this));
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
			// ? Maybe make it 0.01/0.1 for performance
			if (this.scrollSpeed.speed < 0.001) this.scrollSpeed.speed = 0;

			this.scrollSpeed.target += (this.scrollSpeed.speed - this.scrollSpeed.target) * 0.2;
			this.scrollSpeed.render = this.lerp(this.scrollSpeed.render, this.currentScroll, 0.1);
		}

		// TODO WIP
		this.manualShouldRender = this.scrollSpeed.speed !== 0;
	}

	private scroll() {
		this.currentScroll = window.scrollY || document.documentElement.scrollTop;

		//? Currently removed for better performance, it seems there is no need, and there are no bugs
		//? UPDATE: Bugs on resize, WIP to remove it
		this.setImagesPosition();

		const scrollPercentage = (window.scrollY + window.innerHeight) / this.dimensions.height;
		this.shaderPass.uniforms.scrollPercentage.value = scrollPercentage;

		this.scrollTimes += 1;
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
		this.composer.setSize(this.dimensions.width, this.dimensions.height);

		this.setImagesPosition();
	}

	// TODO make it "readonly"
	manualRender() {
		// ? Maybe set uniforms only if at least one effect is enabled from previewSettings 🧐
		this.setUniforms();

		// ? Find better performance solution
		if (this.previewSettings.scroll.enable) {
			this.shaderPass.uniforms.scrollSpeed.value = this.scrollSpeed.target;
			this.composer.render();
		} else {
			this.renderer.render(this.scene, this.camera);
		}
	}

	private shouldRender() {
		// TODO WIP
		// TODO Add to resize, scroll

		// ? Maybe use:
		/* Object.values(this.previewSettings).some((effect) => effect.enable) */
		// ? Maybe calculate this only when this.previewSettings changed

		if (this.manualShouldRender) return true;
		if (this.previewSettings.glitch.enable) return true;
		return false;
	}

	//! Render
	private render() {
		this.time += 0.5;

		if (this.previewSettings.scroll.enable) {
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
		this.meshImages.forEach(({ element }) => {
			element.removeEventListener('click', this.addImage.bind(this));
		});
	}

	//* COMPOSER
	private composerPass() {
		this.composer = new EffectComposer(this.renderer);
		this.composer.setSize(this.dimensions.width, this.dimensions.height);
		this.renderPass = new RenderPass(this.scene, this.camera);
		this.composer.addPass(this.renderPass);

		const shaderEffect = {
			uniforms: {
				tDiffuse: { value: null },
				scrollSpeed: { value: 0 },
				scrollPercentage: { value: 0 }
			},
			fragmentShader: composerFragment,
			vertexShader: composerVertex
		};

		this.shaderPass = new ShaderPass(shaderEffect);
		this.shaderPass.renderToScreen = true;
		this.composer.addPass(this.shaderPass);
	}
	//* -- enf of COMPOSER

	//* IMAGES
	private setUniforms() {
		for (const material of this.materials) {
			const { glitch, waveClick } = this.previewSettings;

			material.uniforms.u_time.value = this.time;
			material.uniforms.u_glitch.value = glitch;
			material.uniforms.u_waveClick.value = waveClick;
		}
	}

	private setImagesPosition() {
		this.meshImages.forEach((img) => {
			const { width, height, top, left } = img.element.getBoundingClientRect();

			// TODO Bug: positionY difference in 1px

			img.mesh.scale.set(width, height, 1);
			img.mesh.position.y = -this.currentScroll - top + this.dimensions.height / 2 - height / 2;
			img.mesh.position.x = left - this.dimensions.width / 2 + width / 2;
		});
	}

	private clickEvent(event: MouseEvent) {
		const mouse = new THREE.Vector2();
		mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

		this.raycaster.setFromCamera(mouse, this.camera);
		const intersects = this.raycaster.intersectObjects(this.scene.children);

		if (intersects.length > 0) {
			const imageIndex = this.meshImages.findIndex(
				(image) => image.element === event.currentTarget
			);
			if (imageIndex === -1) return;

			const { material } = this.meshImages[imageIndex];

			material.uniforms.u_clickPosition.value = intersects[0].uv;

			this.manualShouldRender = true;

			anime({
				targets: material.uniforms.u_click,
				easing: 'easeOutQuart',
				value: [1, 0]
			}).finished.then(() => {
				if (material.uniforms.u_click.value === 0) {
					this.manualShouldRender = false;
				}
			});
		}
	}

	private async addImage(image: HTMLImageElement) {
		const { glitch, waveClick } = this.previewSettings;

		const baseMaterial = new THREE.ShaderMaterial({
			uniforms: {
				u_image: { value: 0 },
				u_time: { value: 0 },
				u_click: { value: 0 },
				u_clickPosition: { value: new THREE.Vector2(0.5, 0.5) }, // Center of Image
				u_glitch: { value: glitch },
				u_waveClick: { value: waveClick }
			},
			fragmentShader: fragment,
			vertexShader: vertex
		});

		const { top, left, width, height } = image.getBoundingClientRect();

		const geometry = new THREE.PlaneBufferGeometry(1, 1, 10, 10);
		const texture = await new THREE.TextureLoader().loadAsync(image['src']);

		const material = baseMaterial.clone();
		material.uniforms.u_image.value = texture;

		const mesh = new THREE.Mesh(geometry, material);

		// Events
		image.addEventListener('click', this.clickEvent.bind(this));
		// --- end of Events

		this.materials.push(material);
		this.meshImages.push({ element: image, mesh, top, left, width, height, material });

		this.setImagesPosition();

		this.scene.add(mesh);
	}
	//* -- end of IMAGES
}
