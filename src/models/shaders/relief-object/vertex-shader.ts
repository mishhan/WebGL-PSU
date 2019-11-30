const vertexShader: string = `
attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec3 aTangent;
attribute vec3 aBitangent;
attribute vec2 aTextureCoord;

uniform mat4 uViewMatrix;
uniform mat4 uModelMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uNormalMatrix;
uniform mat4 uRotationMatrix;

uniform vec3 lightPos;
uniform vec3 viewPos;

varying vec2 vTextureCoord;
varying vec3 vFragPos;

varying vec3 vTangentLightPos;
varying vec3 vTangentViewPos;
varying vec3 vTangentFragPos;

mat3 transpose(mat3 inMatrix) {
  vec3 i0 = inMatrix[0];
  vec3 i1 = inMatrix[1];
  vec3 i2 = inMatrix[2];

  mat3 outMatrix = mat3(
    vec3(i0.x, i1.x, i2.x),
    vec3(i0.y, i1.y, i2.y),
    vec3(i0.z, i1.z, i2.z)
  );

  return outMatrix;
}

void main() {
  //uRotationMatrix - rotates object
  gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * uRotationMatrix * vec4(aVertexPosition, 1.0);

  vFragPos = vec3(uModelMatrix * vec4(aVertexPosition, 1.0));
  vTextureCoord = aTextureCoord;

  vec3 T = normalize(vec3(uNormalMatrix * vec4(aTangent, 1.0)));
  vec3 N = normalize(vec3(uNormalMatrix * vec4(aVertexNormal, 1.0)));
  vec3 B = normalize(vec3(uNormalMatrix * vec4(aBitangent, 1.0)));

  mat3 tTBN = transpose(mat3(T, B, N));

  vTangentLightPos = tTBN * vec3(0, 3, 0);
  vTangentViewPos  = tTBN * vec3(1, 1, 1);
  vTangentFragPos  = tTBN * vFragPos;
}`;

export default vertexShader;
