uniform sampler2D uImage;
varying vec2 vUv;

void main()	{
	vec2 newUV = vUv;
	vec4 image = texture2D(uImage,newUV);

	gl_FragColor = image;
}
