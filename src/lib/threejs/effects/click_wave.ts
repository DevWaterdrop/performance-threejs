import anime from 'animejs';
import type {
	EffectImageUniforms,
	EffectSettings,
	FragmentString,
	Uniform,
	VertexString
} from '../effect';
import Effect, { EffectClick } from '../effect';
import type MacawImage from '../image';

type Settings = {
	strength: number;
};

export default class ClickWave
	extends Effect
	implements EffectClick, EffectImageUniforms, EffectSettings
{
	readonly imageFragmentString: FragmentString;
	readonly imageVertexString: VertexString;
	readonly imageUniforms: Uniform;
	declare settings: Settings;

	constructor(options: Settings) {
		super();

		// Default Settings
		this.settings = options;

		this.imageFragmentString = {
			varying: /*glsl*/ `
				varying float vNoise;
			`,
			afterGl_FragColor: /*glsl*/ `
				gl_FragColor.rgb += 0.05*vec3(vNoise);
			`
		};
		this.imageVertexString = {
			struct: /*glsl*/ `
				struct ClickWave {
					float strength;
				};
			`,
			uniforms: /*glsl*/ `
				uniform ClickWave u_clickWave;
			`,
			varying: /*glsl*/ `
				varying float vNoise;
			`,
			beforeGl_Position: /*glsl*/ ` 
				float dist = distance(uv, u_clickPosition);

				newposition.z += u_click*10.*sin(dist*u_clickWave.strength + u_time);
				vNoise = u_click*sin(dist*10. - u_time);
      `
		};
		this.imageUniforms = {
			u_clickWave: { value: this.settings }
		};
	}

	setSettings(value: Settings) {
		this.settings = value;

		this.scene.mapMeshImages.forEach((img) => {
			this.setImageUniforms(img);
		});
	}

	// TODO Make it async ?
	async click(imageId: string, intersects: THREE.Intersection<THREE.Object3D<THREE.Event>>[]) {
		if (intersects.length > 0) {
			const { material } = this.scene.mapMeshImages.get(imageId);

			material.uniforms.u_clickPosition.value = intersects[0].uv;

			this.scene.manualShouldRender = true;
			this.scene.clickRender += 1;

			anime({
				targets: material.uniforms.u_click,
				easing: 'easeOutQuart',
				value: [1, 0]
			}).finished.then(() => {
				this.scene.clickRender -= 1;
				if (this.scene.clickRender === 0) {
					this.scene.manualShouldRender = false;
				}
			});
		}
	}

	setImageUniforms({ material }: MacawImage) {
		material.uniforms.u_clickWave.value = this.settings;
	}
}
