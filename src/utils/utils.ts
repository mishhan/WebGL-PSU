export function createProgramFromScripts(
	gl: WebGLRenderingContext,
	vertexShaderSource: string,
	fragmentShaderSource: string
): WebGLProgram {
	const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
	const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
	const program = createProgram(gl, vertexShader, fragmentShader);
	return program;
}

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
	if (success) {
		return shader;
	}

	console.error(gl.getShaderInfoLog(shader));
	gl.deleteShader(shader);
}

function createProgram(
	gl: WebGLRenderingContext,
	vertexShader: WebGLShader,
	fragmentShader: WebGLShader
) {
	const program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	const success = gl.getProgramParameter(program, gl.LINK_STATUS);
	if (success) {
		return program;
	}

	console.error(gl.getProgramInfoLog(program));
	gl.deleteProgram(program);
}

export function degToRad(degree: number): number {
	return (degree * Math.PI) / 180;
}

export function radToDeg(radian: number): number {
	return (radian * 180) / Math.PI;
}

export function wrap(a: number, min: number, max: number): number {
	a -= min;
	max -= min;
	if (max === 0) {
		return min;
	}
	a = fmod(a, max) + min;
	if (a < min) {
		a += max;
	}
	return a;
}

export function fmod(a: number, b: number): number {
	return a - b * Math.floor(a / b);
}
