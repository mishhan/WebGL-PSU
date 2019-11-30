const fragmentShader: string = `
precision mediump float;

uniform sampler2D uSampler;
uniform vec3 uLightPos;

varying vec4 vVertexPos;
varying vec3 vVertexNormal;
varying vec2 vTextureCoord;

void main() {
  vec3 lightToPos = normalize(uLightPos - vVertexPos.xyz);
  vec4 color = texture2D(uSampler, vTextureCoord);

  float ambientStrength = 0.3;
  vec3 lightColor = vec3(1.0, 1.0, 1.0);
  vec3 ambient = ambientStrength * lightColor;
  float diff = max(dot(vVertexNormal, lightToPos), 0.0);
  gl_FragColor = color * vec4(ambient, 1.0) + color * diff;
}
`;

export default fragmentShader;
