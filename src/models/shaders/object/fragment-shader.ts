const fragmentShader: string = `
precision mediump float;

uniform sampler2D uSampler;
uniform vec3 lightPos;

// for fake drowing
uniform int isFake;
uniform vec3 fakeColor;

varying vec4 vVertexPos;
varying vec3 vVertexNormal;
varying vec2 vTextureCoord;

void main() {
  if (isFake == 1) {
    gl_FragColor = vec4(fakeColor, 1.0);
  }
  else {
    gl_FragColor = texture2D(uSampler, vTextureCoord);
  }
}
`;

export default fragmentShader;
