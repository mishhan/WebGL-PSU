const fragmentShader: string = `
precision mediump float;

uniform samplerCube uSampler;

varying vec3 vTextureCoord;

void main() {
  gl_FragColor = textureCube(uSampler, vTextureCoord);
}
`;

export default fragmentShader;
