export default class WebGlUtils {
	static createShader(gl: WebGLRenderingContext, type: number, source: string) {
		let shader = gl.createShader(type);
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
		if (success) {
			return shader;
		}

		console.log(gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
	}

	static createProgram(
		gl: WebGLRenderingContext,
		vertexShader: WebGLShader,
		fragmentShader: WebGLShader
	) {
		let program = gl.createProgram();
		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);
		gl.linkProgram(program);
		let success = gl.getProgramParameter(program, gl.LINK_STATUS);
		if (success) {
			return program;
		}

		console.log(gl.getProgramInfoLog(program));
		gl.deleteProgram(program);
	}

	static createProgramFromScripts(gl: WebGLRenderingContext, shaderIds: string[]) {
		// Get the strings for our GLSL shaders
		let vertexShaderSource = (<HTMLScriptElement>document.getElementById(shaderIds[0])).text;
		let fragmentShaderSource = (<HTMLScriptElement>document.getElementById(shaderIds[1])).text;

		// create GLSL shaders, upload the GLSL source, compile the shaders
		let vertexShader = WebGlUtils.createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
		let fragmentShader = WebGlUtils.createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

		let program = WebGlUtils.createProgram(gl, vertexShader, fragmentShader);

		return program;
	}
}
