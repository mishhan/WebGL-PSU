import Landscape from "./environment/landscape";
import Camera from "../graphic/camera";
import matrix4 from "../math/matrix4";
// @ts-ignore
import landscapeImage from "../assets/images/landscape/landscape.jpg";

export default class LandscapeSceneObject {
	private vertex: number[];
	private index: number[];
	private matrixes: {
		translation: number[];
		rotation: number[];
		scale: number[];
	};
	private vertexBuffer: WebGLBuffer;
	private indexBuffer: WebGLBuffer;

	private texture: WebGLTexture;
	private textureLocation: WebGLUniformLocation;

	private positionLocation: number;
	private normalLocation: number;
	private uvLocation: number;

	private mpLocation: WebGLUniformLocation;
	private mvpLocation: WebGLUniformLocation;

	private lightPos: number[];
	private lightPosLocation: WebGLUniformLocation;

	private gl: WebGLRenderingContext;
	private program: WebGLProgram;
	private camera: Camera;
	private projMatrix: number[];

	constructor(
		gl: WebGLRenderingContext,
		program: WebGLProgram,
		camera: Camera,
		projMatrix: number[],
		landscape: Landscape
	) {
		this.gl = gl;
		this.program = program;
		this.camera = camera;
		this.projMatrix = projMatrix;

		this.index = landscape.getIndex();
		this.vertex = landscape.getVertex();
		this.matrixes = landscape.getMatrixes();
		this.lightPos = landscape.getLightPos();
		this.init();
	}

	private init() {
		const gl = this.gl;
		this.positionLocation = gl.getAttribLocation(this.program, "a_position");
		this.normalLocation = gl.getAttribLocation(this.program, "a_normal");
		this.uvLocation = gl.getAttribLocation(this.program, "a_uv");
		this.mpLocation = gl.getUniformLocation(this.program, "u_MV");
		this.mvpLocation = gl.getUniformLocation(this.program, "u_MVP");
		this.lightPosLocation = gl.getUniformLocation(this.program, "u_lightPos");
		this.textureLocation = gl.getUniformLocation(this.program, "u_landscape");

		this.indexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.index), gl.STATIC_DRAW);

		this.vertexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertex), gl.STATIC_DRAW);

		const image = new Image();
		image.src = landscapeImage;
		image.addEventListener("load", () => {
			this.texture = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, this.texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		});
	}

	public render() {
		const gl = this.gl;
		gl.useProgram(this.program);

		gl.enableVertexAttribArray(this.positionLocation);
		gl.enableVertexAttribArray(this.normalLocation);
		gl.enableVertexAttribArray(this.uvLocation);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

		gl.vertexAttribPointer(this.positionLocation, 3, gl.FLOAT, false, 8 * 4, 0);
		gl.vertexAttribPointer(this.normalLocation, 3, gl.FLOAT, false, 8 * 4, 3 * 4);
		gl.vertexAttribPointer(this.uvLocation, 2, gl.FLOAT, false, 8 * 4, 6 * 4);

		const P = this.projMatrix;
		const V = this.camera.getViewMatrix();

		let M = matrix4.identity();
		M = matrix4.translate(
			M,
			this.matrixes.translation[0],
			this.matrixes.translation[1],
			this.matrixes.translation[2]
		);
		M = matrix4.rotate(
			M,
			this.matrixes.rotation[0],
			this.matrixes.rotation[1],
			this.matrixes.rotation[2]
		);
		M = matrix4.scale(M, this.matrixes.scale[0], this.matrixes.scale[1], this.matrixes.scale[2]);

		let MP = matrix4.multiply(P, M);
		let MVP = matrix4.multiply(P, V);
		MVP = matrix4.multiply(MVP, M);

		gl.uniform3fv(this.lightPosLocation, this.lightPos);
		gl.uniformMatrix4fv(this.mpLocation, false, MP);
		gl.uniformMatrix4fv(this.mvpLocation, false, MVP);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		gl.uniform1i(this.textureLocation, 0);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		gl.drawElements(gl.TRIANGLES, this.index.length, gl.UNSIGNED_SHORT, 0);
	}
}
