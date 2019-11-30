const vertexShader: string = `
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat4 uViewMatrix;
uniform mat4 uModelMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uNormalMatrix;

varying vec3 vTextureCoord;

void main() {
  vTextureCoord = vec3(-aVertexPosition.x, aVertexPosition.y, aVertexPosition.z);
  gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aVertexPosition, 1.0);
}
`;

export default vertexShader;
