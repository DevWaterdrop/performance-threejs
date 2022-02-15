import type { SceneSettings } from '$lib/types';
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
	sceneSettings: SceneSettings;
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

type MapMeshImages = Map<string, MeshImage>;

export default class MacawScene {
	readonly container: HTMLDivElement;
	readonly images: HTMLImageElement[];
	manualShouldRender: boolean;

	private settings: SceneSettings;
	private time: number;
	private dimensions: { width: number; height: number };
	private scrollSpeed: ScrollSpeed;
	private scene: THREE.Scene;
	private camera: THREE.PerspectiveCamera;
	private renderer: THREE.WebGLRenderer;
	private materials: THREE.ShaderMaterial[];
	private currentScroll: number;
	private raycaster: THREE.Raycaster;
	private composer: EffectComposer;
	private renderPass: RenderPass;
	private shaderPass: ShaderPass;
	private scrollTimes: number;
	private mapMeshImages: MapMeshImages;
	private clickRender: number;
	private vector2: THREE.Vector2;
	private observer: IntersectionObserver;

	constructor(options: Props) {
		this.container = options.container;
		this.images = options.images;
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
		this.composerPass();
		//* -- end of Composer

		//* Image zone
		this.materials = [];
		this.mapMeshImages = new Map();
		const promiseImages = this.images.map((image, index) => this.addImage(image, index));
		//* -- end of Image zone

		//* Init
		Promise.all(promiseImages).then(() => {
			this.scroll();
			this.resize();

			this.setupObserver();
			this.setupScroll();
			this.setupResize();

			this.render();
			this.manualRender();
		});
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

		this.images.forEach((image) => {
			this.observer.observe(image);
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

		this.shaderPass.uniforms.scrollSpeed.value = this.scrollSpeed.target; // ? Maybe move to setUniforms

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
		this.composer.setSize(this.dimensions.width, this.dimensions.height);

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
			this.composer.render();
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
		this.mapMeshImages.forEach(({ element }) => {
			element.removeEventListener('click', this.addImage.bind(this));
		});
		this.observer.disconnect();
	}

	//* COMPOSER
	private composerPass() {
		this.composer = new EffectComposer(this.renderer);
		this.composer.setSize(this.dimensions.width, this.dimensions.height);
		this.renderPass = new RenderPass(this.scene, this.camera);
		this.composer.addPass(this.renderPass);

		const { scroll, scrollTop } = this.settings;

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
	//* -- end of COMPOSER

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
			this.shaderPass.uniforms.u_time.value = this.time;
			this.shaderPass.uniforms.u_scroll.value = scroll;
			this.shaderPass.uniforms.u_scrollTop.value = scrollTop;
		}
	}

	//* IMAGES
	private setImagesPosition(resize = false) {
		this.mapMeshImages.forEach((img) => {
			// TODO Bug: positionY difference in 1px (FIXED?)
			const { width, height, top, left } = img.element.getBoundingClientRect();

			// TODO WIP need to remove resize prop
			if (resize) {
				img.mesh.visible = true;
			}

			// ? Maybe remove Math.min
			img.material.uniforms.u_scale.value = [
				Math.min((width * img.element.naturalHeight) / (height * img.element.naturalWidth), 1),
				1
			]; // TODO WIP

			img.mesh.scale.set(width, height, 1); // ? Maybe if not resize
			img.mesh.position.y = -this.currentScroll - top + this.dimensions.height / 2 - height / 2;
			img.mesh.position.x = left - this.dimensions.width / 2 + width / 2;
			img.mesh.updateMatrix();
		});
	}

	private clickEvent(event: MouseEvent) {
		if (this.settings.waveClick.enable) {
			this.vector2.setX((event.clientX / window.innerWidth) * 2 - 1);
			this.vector2.setY(-(event.clientY / window.innerHeight) * 2 + 1);

			this.raycaster.setFromCamera(this.vector2, this.camera);
			const intersects = this.raycaster.intersectObjects(this.scene.children);

			if (intersects.length > 0) {
				const element = event.currentTarget as HTMLImageElement;

				const { material } = this.mapMeshImages.get(element.id);

				material.uniforms.u_clickPosition.value = intersects[0].uv;

				this.manualShouldRender = true;
				this.clickRender += 1;

				anime({
					targets: material.uniforms.u_click,
					easing: 'easeOutQuart',
					value: [1, 0]
				}).finished.then(() => {
					if (material.uniforms.u_click.value === 0) {
						this.clickRender -= 1;
						if (this.clickRender === 0) {
							this.manualShouldRender = false;
						}
					}
				});
			}
		}
	}

	private async addImage(image: HTMLImageElement, index: number) {
		const { glitch, waveClick } = this.settings;

		const { top, left, width, height } = image.getBoundingClientRect();

		const baseMaterial = new THREE.ShaderMaterial({
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

		const geometry = new THREE.PlaneBufferGeometry(1, 1, 10, 10);
		// TODO Use code below (this method cause error: GL ERROR:GL_INVALID_VALUE: glTexSubImage2D: bad dimensions)
		/*
			const texture = new THREE.Texture();
			texture.needsUpdate = true;
		*/
		const texture = await new THREE.TextureLoader().loadAsync(image.src);

		const material = baseMaterial.clone();
		material.uniforms.u_image.value = texture;

		const mesh = new THREE.Mesh(geometry, material);

		// Events
		image.addEventListener('click', this.clickEvent.bind(this));
		// --- end of Events

		mesh.matrixAutoUpdate = false;

		this.materials.push(material);

		// TODO WIP ? Performance
		image.id = image.id ? image.id : `threejs_img_${index}`;

		this.mapMeshImages.set(image.id, {
			element: image,
			mesh,
			top,
			left,
			width,
			height,
			material
		});

		this.setImagesPosition();

		this.scene.add(mesh);
	}
	//* -- end of IMAGES
}
