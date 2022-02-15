import anime from 'animejs';
import * as THREE from 'three';
import type MacawScene from './scene';

interface Props {
	scene: MacawScene;
}

export default class MacawImage {
	private scene: MacawScene;

	element: HTMLImageElement;
	mesh: THREE.Mesh;
	top: number;
	left: number;
	width: number;
	height: number;
	material: THREE.ShaderMaterial;

	constructor(options: Props) {
		this.scene = options.scene;
	}

	cleanUp() {
		this.element.removeEventListener('click', this.clickEvent.bind(this));
	}

	setPosition(resize = false) {
		// TODO Bug: positionY difference in 1px (FIXED?)
		const { width, height, top, left } = this.element.getBoundingClientRect();

		// TODO WIP need to remove resize prop
		if (resize) {
			this.mesh.visible = true;
		}

		// ? Maybe remove Math.min
		this.material.uniforms.u_scale.value = [
			Math.min((width * this.element.naturalHeight) / (height * this.element.naturalWidth), 1),
			1
		]; // TODO WIP

		this.mesh.scale.set(width, height, 1); // ? Maybe if not resize
		this.mesh.position.y =
			-this.scene.currentScroll - top + this.scene.dimensions.height / 2 - height / 2;
		this.mesh.position.x = left - this.scene.dimensions.width / 2 + width / 2;
		this.mesh.updateMatrix();
	}

	private clickEvent(event: MouseEvent) {
		const { settings, vector2, raycaster, camera, scene } = this.scene;

		if (settings.waveClick.enable) {
			vector2.setX((event.clientX / window.innerWidth) * 2 - 1);
			vector2.setY(-(event.clientY / window.innerHeight) * 2 + 1);

			raycaster.setFromCamera(vector2, camera);
			const intersects = raycaster.intersectObjects(scene.children);

			if (intersects.length > 0) {
				this.material.uniforms.u_clickPosition.value = intersects[0].uv;

				this.scene.manualShouldRender = true;
				this.scene.clickRender += 1;

				anime({
					targets: this.material.uniforms.u_click,
					easing: 'easeOutQuart',
					value: [1, 0]
				}).finished.then(() => {
					if (this.material.uniforms.u_click.value === 0) {
						this.scene.clickRender -= 1;
						if (this.scene.clickRender === 0) {
							this.scene.manualShouldRender = false;
						}
					}
				});
			}
		}
	}

	async create(image: HTMLImageElement, id: string) {
		const { top, left, width, height } = image.getBoundingClientRect();

		const geometry = new THREE.PlaneBufferGeometry(1, 1, 10, 10);
		// TODO Use code below (this method cause error: GL ERROR:GL_INVALID_VALUE: glTexSubImage2D: bad dimensions)
		/*
			const texture = new THREE.Texture();
			texture.needsUpdate = true;
		*/
		const texture = await new THREE.TextureLoader().loadAsync(image.src);

		const material = this.scene.baseMaterial.clone();
		material.uniforms.u_image.value = texture;

		const mesh = new THREE.Mesh(geometry, material);

		// Events
		image.addEventListener('click', this.clickEvent.bind(this));
		// --- end of Events

		mesh.matrixAutoUpdate = false;

		this.scene.materials.push(material);

		// TODO WIP ? Performance
		image.id = image.id ? image.id : `threejs_img_${id}`;

		this.element = image;
		this.mesh = mesh;
		this.top = top;
		this.left = left;
		this.width = width;
		this.height = height;
		this.material = material;

		this.setPosition();

		this.scene.scene.add(mesh);

		this.scene.observer.observe(image);
	}
}
