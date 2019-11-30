const vertexShader: string = `
attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uViewMatrix;
uniform mat4 uModelMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uNormalMatrix;

varying vec4 vVertexPos;
varying vec3 vVertexNormal;
varying vec2 vTextureCoord;

void main() {
  vVertexPos = uProjectionMatrix * uModelMatrix * vec4(aVertexPosition, 1.0);
  vVertexNormal = aVertexNormal;
  vTextureCoord = aTextureCoord;

  gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aVertexPosition, 1.0);
}
`;

export default vertexShader;
