import type MacawImage from './image';
import type MacawScene from './scene';

// ! WIP WIP WIP WIP

export default abstract class Effect {
	scene: MacawScene;
	isUsingShaderPass?: boolean;
	settings?: Record<string, unknown>;
}

export abstract class EffectAdd extends Effect {
	abstract add(): void | unknown;
}

export abstract class EffectClick extends Effect {
	abstract click(
		imageId: string,
		intersects: THREE.Intersection<THREE.Object3D<THREE.Event>>[]
	): void | unknown;
}

export abstract class EffectScroll extends Effect {
	abstract scroll(): void | unknown;
}

export abstract class EffectResize extends Effect {
	abstract resize(): void | unknown;
}

export abstract class EffectRender extends Effect {
	abstract render(): void | unknown;
}

export abstract class EffectManualRender extends Effect {
	abstract manualRender(): void | unknown;
}

export abstract class EffectSettings extends Effect {
	abstract setSettings(...args: unknown[]): void | unknown;
}

export type Uniform = Record<string, { value: unknown }>;

export type FragmentStringKeys = [
	'utils',
	'struct',
	'uniforms',
	'varying',
	'const',
	'functions',
	'beforeGl_FragColor',
	'afterGl_FragColor'
];

export type VertexStringKeys = [
	'utils',
	'struct',
	'uniforms',
	'varying',
	'const',
	'functions',
	'beforeGl_Position',
	'afterGl_Position'
];

export type FragmentString = Partial<Record<FragmentStringKeys[number], string>>;

export type VertexString = Partial<Record<VertexStringKeys[number], string>>;

export abstract class EffectImageUniforms extends Effect {
	readonly imageFragmentString: FragmentString;
	readonly imageVertexString: VertexString;
	readonly imageUniforms: Uniform;

	abstract setImageUniforms?(img: MacawImage): void | unknown;
}

export abstract class EffectComposerUniforms extends Effect {
	readonly composerFragmentString: FragmentString;
	readonly composerVertexString: VertexString;
	readonly composerUniforms: Uniform;

	abstract setComposerUniforms?(): void | unknown;
}

export type GeneralEffect = Effect &
	Partial<
		EffectManualRender &
			EffectSettings &
			EffectComposerUniforms &
			EffectImageUniforms &
			EffectAdd &
			EffectClick &
			EffectScroll &
			EffectRender &
			EffectResize
	>;
