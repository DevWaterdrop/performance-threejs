import * as THREE from 'three';
import vertex from '$lib/threejs/shaders/vertex.glsl?raw';
import fragment from '$lib/threejs/shaders/fragment.glsl?raw';

interface Props {
	canvas: HTMLCanvasElement;
	images: HTMLImageElement[];
}

type MeshImage = {
	img: HTMLImageElement;
	mesh: THREE.Mesh;
	top: number;
	left: number;
	width: number;
	height: number;
};

export default class ThreePreview {
	readonly canvas: HTMLCanvasElement;

	private images: HTMLImageElement[];
	private dimensions: { width: number; height: number };
	private scene: THREE.Scene;
	private camera: THREE.PerspectiveCamera;
	private renderer: THREE.WebGLRenderer;
	private materials: THREE.ShaderMaterial[];
	private meshImages: MeshImage[];
	private currentScroll: number;

	constructor(options: Props) {
		this.canvas = options.canvas;
		this.images = options.images;

		this.currentScroll = 0;

		this.dimensions = {
			width: this.canvas.offsetWidth,
			height: this.canvas.offsetHeight
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

		this.renderer = new THREE.WebGLRenderer({
			alpha: true,
			canvas: this.canvas
		});
		this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2.5));

		//* Image zone
		this.materials = [];
		this.meshImages = [];
		this.addImage(this.images[0]);
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
	}

	private resize() {
		this.dimensions = {
			width: this.canvas.offsetWidth,
			height: this.canvas.offsetHeight
		};

		this.renderer.setSize(this.dimensions.width, this.dimensions.height);
		this.camera.aspect = this.dimensions.width / this.dimensions.height;
		this.camera.updateProjectionMatrix();
	}

	private render() {
		this.setImagesPosition();

		this.renderer.render(this.scene, this.camera);
		window.requestAnimationFrame(this.render.bind(this));
	}

	//* IMAGES
	private setImagesPosition() {
		this.meshImages.forEach((img) => {
			img.mesh.position.y =
				this.currentScroll - img.top + this.dimensions.height / 2 - img.height / 2;
			img.mesh.position.x = img.left - this.dimensions.width / 2 + img.width / 2;
		});
	}

	private async addImage(image: HTMLImageElement) {
		const baseMaterial = new THREE.ShaderMaterial({
			uniforms: { uImage: { value: 0 } },
			fragmentShader: fragment,
			vertexShader: vertex
		});

		const { top, left, width, height } = image.getBoundingClientRect();

		const geometry = new THREE.PlaneBufferGeometry(width, height);
		const texture = await new THREE.TextureLoader().loadAsync(image['src']);

		const material = baseMaterial.clone();
		material.uniforms.uImage.value = texture;

		const mesh = new THREE.Mesh(geometry, material);

		this.materials.push(material);
		this.meshImages.push({ img: image, mesh, top, left, width, height });

		this.scene.add(mesh);
	}
	//* -- end of IMAGES
}
