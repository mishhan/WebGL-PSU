const vertexShader: string = `
attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uViewMatrix;
uniform mat4 uModelMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uRotationMatrix;
uniform mat4 uNormalMatrix;

varying vec4 vVertexPos;
varying vec3 vVertexNormal;
varying vec2 vTextureCoord;

void main() {
  vVertexPos = vec4(aVertexPosition, 1.0);
  vVertexNormal = aVertexNormal;
  vTextureCoord = aTextureCoord;

  //uRotationMatrix - rotates object
  gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * uRotationMatrix * vec4(aVertexPosition, 1.0);
}
`;

export default vertexShader;
