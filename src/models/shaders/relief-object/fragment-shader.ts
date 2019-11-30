const fragmentShader: string = `
precision mediump float;

varying highp vec3 vFragPos;
varying highp vec2 vTextureCoord;
varying highp vec3 vTangentLightPos;
varying highp vec3 vTangentViewPos;
varying highp vec3 vTangentFragPos;


uniform sampler2D uSampler;
uniform sampler2D uNormals;

// for fake drowing
uniform int isFake;
uniform vec3 fakeColor;

varying mat3 vTBN;

highp vec3 lightColor = vec3(1, 1, 0.875);

void main() {
  if (isFake == 1) {
    gl_FragColor = vec4(fakeColor, 1.0);
  }
  else {
    vec3 normal = texture2D(uNormals, vTextureCoord).rgb;
    normal = normalize(normal * 2.0 - 1.0);
  
    vec3 texelColor = texture2D(uSampler, vTextureCoord).rgb;
    // ambient
    vec3 ambient = texelColor * 0.1;
  
    //diffuse
    vec3 lightDir = normalize(vTangentLightPos - vTangentFragPos);
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = diff * texelColor;
  
    //specular
    vec3 viewDir  = normalize(vTangentViewPos - vTangentFragPos);
    vec3 reflectDir = reflect(-lightDir, normal);
    vec3 halfwayDir = normalize(lightDir + viewDir);  
    float spec = pow(max(dot(normal, halfwayDir), 0.0), 32.0);
    vec3 specular = vec3(0.2) * spec;
  
    gl_FragColor = vec4(ambient + diffuse + specular, 1.0);
  }
}
`;

export default fragmentShader;
