import type { PreviewSettings } from '$lib/types';
import * as THREE from 'three';
import vertex from '$lib/threejs/shaders/vertex.glsl?raw';
import fragment from '$lib/threejs/shaders/fragment.glsl?raw';
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

export default class ThreePreview {
	readonly container: HTMLDivElement;
	readonly images: HTMLImageElement[];
	previewSettings: PreviewSettings;

	private time: number;
	private dimensions: { width: number; height: number };
	private scene: THREE.Scene;
	private camera: THREE.PerspectiveCamera;
	private renderer: THREE.WebGLRenderer;
	private materials: THREE.ShaderMaterial[];
	private meshImages: MeshImage[];
	private currentScroll: number;
	private raycaster: THREE.Raycaster;

	constructor(options: Props) {
		this.container = options.container;
		this.images = options.images;
		this.previewSettings = options.previewSettings;

		this.currentScroll = 0;
		this.time = 0;

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
		this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2.5));
		this.container.appendChild(this.renderer.domElement);

		this.raycaster = new THREE.Raycaster();

		//* Image zone
		this.materials = [];
		this.meshImages = [];
		this.images.forEach((image) => {
			this.addImage(image);
		});
		//* -- end of Image zone

		//* Init
		this.scroll();
		this.resize();

		this.setupScroll();
		this.setupResize();

		this.render();
	}

	private setupResize() {
		window.addEventListener('resize', this.resize.bind(this));
	}

	private setupScroll() {
		window.addEventListener('scroll', this.scroll.bind(this));
	}

	private scroll() {
		this.currentScroll = window.scrollY || document.documentElement.scrollTop;

		this.setImagesPosition();
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

		this.setImagesPosition();
	}

	private render() {
		this.time += 0.5;

		this.setUniforms();

		this.renderer.render(this.scene, this.camera);
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

	//* IMAGES
	private setUniforms() {
		for (const material of this.materials) {
			const { glitch } = this.previewSettings;

			material.uniforms.u_time.value = this.time;
			material.uniforms.u_glitch.value = glitch;
		}
	}

	private setImagesPosition() {
		this.meshImages.forEach((img) => {
			const { width, height, top, left } = img.element.getBoundingClientRect();

			// ? Perhaps there is a better option 💁‍♂️
			img.mesh.geometry = new THREE.PlaneBufferGeometry(width, height, 100, 100);

			img.mesh.position.y = -this.currentScroll - top + this.dimensions.height / 2 - height / 2;
			img.mesh.position.x = left - this.dimensions.width / 2 + width / 2;
		});
	}

	private clickEvent(event: MouseEvent) {
		const mouse = new THREE.Vector2();
		mouse.x = (event.clientX / this.dimensions.width) * 2 - 1;
		mouse.y = -(event.clientY / this.dimensions.height) * 2 + 1;

		this.raycaster.setFromCamera(mouse, this.camera);
		const intersects = this.raycaster.intersectObjects(this.scene.children);

		if (intersects.length > 0) {
			const imageIndex = this.meshImages.findIndex(
				(image) => image.element === event.currentTarget
			);
			if (imageIndex === -1) return;

			const { material } = this.meshImages[imageIndex];

			material.uniforms.u_clickPosition.value = intersects[0].uv;

			anime({
				targets: material.uniforms.u_click,
				easing: 'easeOutQuart',
				value: [1, 0]
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

		const geometry = new THREE.PlaneBufferGeometry(width, height, 100, 100);
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
