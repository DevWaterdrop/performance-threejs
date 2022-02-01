// Struct
struct Glitch {
	bool enable;
	float noiseIntensity;
	float offsetIntensity;
	float colorOffsetIntensity;
};

// Uniform
uniform sampler2D uImage;
uniform float u_time;
uniform Glitch u_glitch;

// Varying
varying vec2 vUv;

// Const
const float range = 0.05;
const float noiseQuality = 250.0;

// --- Glitch ---
float rand(vec2 co) {
	return fract(sin(dot(co.xy ,vec2(13.,77.))) * 4444.);
}	

float verticalBar(float pos, float uvY, float offset){
	float edge0 = (pos - range);
	float edge1 = (pos + range);

	float x = smoothstep(edge0, pos, uvY) * offset;
	x -= smoothstep(pos, edge1, uvY) * offset;
	return x;
}


vec4 glitch(vec2 newUV){
	vec2 uv = newUV.xy;

	for (float i = 0.0; i < 0.71; i += 0.1313){
			float d = mod(u_time * i, 1.7);
			float o = sin(1.0 - tan(u_time * 0.24 * i));
			o *= u_glitch.offsetIntensity;
			uv.x += verticalBar(d, uv.y, o);
	}
	
	float uvY = uv.y;
	uvY *= noiseQuality;
	uvY = float(int(uvY)) * (1.0 / noiseQuality);
	float noise = rand(vec2(u_time * 0.00001, uvY));
	uv.x += noise * u_glitch.noiseIntensity;


	vec2 offsetR = vec2(0.006 * sin(u_time), 0.0) * u_glitch.colorOffsetIntensity;
	vec2 offsetG = vec2(0.0073 * (cos(u_time * 0.97)), 0.0) * u_glitch.colorOffsetIntensity;

	float r = texture(uImage, uv + offsetR).r;
	float g = texture(uImage, uv + offsetG).g;
	float b = texture(uImage, uv).b;

	vec4 tex = vec4(r, g, b, 1.0);

	return tex;
}
// --- end of Glitch ---


void main()	{
	vec2 newUV = vUv;
	vec4 image = texture2D(uImage,newUV);

	if(u_glitch.enable) {
		gl_FragColor = glitch(newUV);
		return;
	}

	gl_FragColor = image;
}

