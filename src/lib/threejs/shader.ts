import type {
	FragmentString,
	FragmentStringKeys,
	Uniform,
	VertexString,
	VertexStringKeys
} from './effect';
import type { MapEffects } from './scene';

interface Props {
	baseUniforms: Uniform;
	baseVertex: VertexString;
	baseFragment: FragmentString;
	isImage: boolean;
}

export default class MacawShader {
	readonly baseUniforms: Uniform;
	readonly baseVertex: VertexString;
	readonly baseFragment: FragmentString;
	readonly isImage: boolean;
	readonly vertexKeys: VertexStringKeys;
	readonly fragmentKeys: FragmentStringKeys;
	uniforms: Uniform;
	vertexShader: string;
	fragmentShader: string;

	constructor(options: Props) {
		// TODO Refactor
		const { baseUniforms, baseVertex, baseFragment, isImage } = options;

		this.vertexKeys = [
			'utils',
			'struct',
			'uniforms',
			'varying',
			'const',
			'functions',
			'beforeGl_Position',
			'afterGl_Position'
		];
		this.fragmentKeys = [
			'utils',
			'struct',
			'uniforms',
			'varying',
			'const',
			'functions',
			'beforeGl_FragColor',
			'afterGl_FragColor'
		];

		this.baseUniforms = baseUniforms;
		this.baseVertex = baseVertex;
		this.baseFragment = baseFragment;
		this.isImage = isImage;

		this.create();
	}

	create(mapEffects: MapEffects = new Map()) {
		this.uniforms = this.baseUniforms;

		// TODO Refactor
		const vertex: VertexString = {};
		const fragment: FragmentString = {};

		mapEffects.forEach((effect) => {
			const {
				imageVertexString,
				imageUniforms,
				imageFragmentString,
				composerFragmentString,
				composerUniforms,
				composerVertexString
			} = effect;

			const vertexString = (this.isImage ? imageVertexString : composerVertexString) ?? {};
			const fragmentString = (this.isImage ? imageFragmentString : composerFragmentString) ?? {};
			const uniforms = (this.isImage ? imageUniforms : composerUniforms) ?? {};

			// ? Maybe change to hasOwnProperty
			this.vertexKeys.forEach((key) => {
				if (key in vertexString) {
					vertex[key] = [vertex[key], vertexString[key]].join('\n');
				}
			});

			this.fragmentKeys.forEach((key) => {
				if (key in fragmentString) {
					fragment[key] = [fragment[key], fragmentString[key]].join('\n');
				}
			});

			this.uniforms = { ...this.uniforms, ...uniforms };
		});

		const preVertexShader = /*glsl*/ `
			// Utils
			${this.baseVertex.utils}
      ${vertex.utils}
			// Struct
			${this.baseVertex.struct}
      ${vertex.struct}
			// Uniform
			${this.baseVertex.uniforms}
      ${vertex.uniforms}
			// Varying
			${this.baseVertex.varying}
      ${vertex.varying}
			// Const
			${this.baseVertex.const}
      ${vertex.const}
			// Functions
			${this.baseVertex.functions}
      ${vertex.functions}
			void main() {
				${this.baseVertex.beforeGl_Position}
				${vertex.beforeGl_Position}
				${this.baseVertex.afterGl_Position}
				${vertex.afterGl_Position}
			}
    `;

		const preFragmentShader = /*glsl*/ `
			// Utils
			${this.baseFragment.utils}
      ${fragment.utils}
			// Struct
			${this.baseFragment.struct}
			${fragment.struct}
			// Uniform
			${this.baseFragment.uniforms}
			${fragment.uniforms}
			// Varying
			${this.baseFragment.varying}
			${fragment.varying}
			// Const
			${this.baseFragment.const}
			${fragment.const}
			// Functions
			${this.baseFragment.functions}
      ${fragment.functions}
			void main() {
				${this.baseFragment.beforeGl_FragColor}
				${fragment.beforeGl_FragColor}
				${this.baseFragment.afterGl_FragColor}
				${fragment.afterGl_FragColor}
			}
    `;

		this.vertexShader = this.removeUndefined(preVertexShader);
		this.fragmentShader = this.removeUndefined(preFragmentShader);
	}

	get PrettyShaders() {
		const prettyVertex = this.prettifier(this.vertexShader);
		const prettyFragment = this.prettifier(this.fragmentShader);

		return { prettyVertex, prettyFragment };
	}

	private removeUndefined(string: string) {
		return string.replace(/\bundefined\b/g, '');
	}

	private prettifier(string: string) {
		// TODO WIP
		return string
			.replace(/  +/g, '')
			.replace(/\t/g, '')
			.replace(/^\s*[\r\n]/gm, '');
	}
}
