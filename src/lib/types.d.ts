export interface SceneSettings {
	options: {
		alpha: boolean;
		color: number;
		maxDPR?: number;
	};
	glitch: {
		enable: boolean;
		noiseIntensity: number;
		offsetIntensity: number;
		colorOffsetIntensity: number;
	};
	waveClick: {
		enable: boolean;
	};
	scroll: {
		enable: boolean;
	};
	scrollTop: {
		enable: boolean;
	};
}
