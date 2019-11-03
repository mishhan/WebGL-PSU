import Camera from "../graphic/camera";
import matrix4 from "../math/matrix4";

const OBJ = require("webgl-obj-loader");

export default class SceneObject {
	public vertex: number[];
	public index: number[];
	public uv: number[];

	public matrixes: {
		translation: number[];
		rotation: number[];
		scale: number[];
	};

	public vertexBuffer: WebGLBuffer;
	public indexBuffer: WebGLBuffer;
	public uvBuffer: WebGLBuffer;

	public texture: WebGLTexture;
	public textureLocation: WebGLUniformLocation;

	public positionLocation: number;
	public uvLocation: number;
	public mpLocation: WebGLUniformLocation;

	private gl: WebGLRenderingContext;
	private program: WebGLProgram;
	private camera: Camera;
	private projMatrix: number[];

	constructor(
		gl: WebGLRenderingContext,
		program: WebGLProgram,
		camera: Camera,
		projMatrix: number[],
		obj: string,
		imageUrl: string
	) {
		/* read data from obj */
		const mesh = new OBJ.Mesh(obj);
		this.vertex = mesh.vertices;
		this.index = mesh.indices;
		this.uv = mesh.textures;

		/* store variables */
		this.gl = gl;
		this.program = program;
		this.camera = camera;
		this.projMatrix = projMatrix;

		/* init webgl data */
		this.positionLocation = gl.getAttribLocation(program, "a_position");
		this.uvLocation = gl.getAttribLocation(program, "a_uv");
		this.mpLocation = gl.getUniformLocation(program, "u_MP");

		this.indexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.index), gl.STATIC_DRAW);

		this.vertexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertex), gl.STATIC_DRAW);

		this.uvBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.uv), gl.STATIC_DRAW);

		const canvas = <HTMLCanvasElement>document.getElementById("canvas-handler");
		const context = canvas.getContext("2d");
		const image = new Image();
		image.src = imageUrl;

		image.addEventListener("load", () => {
			this.texture = gl.createTexture();
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, this.texture);

			context.drawImage(image, 0, 0);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);

			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texImage2D(
				gl.TEXTURE_2D,
				0,
				gl.RGBA,
				gl.RGBA,
				gl.UNSIGNED_BYTE,
				context.getImageData(0, 0, image.width, image.height)
			);
		});
	}

	public render() {
		const gl = this.gl;
		gl.useProgram(this.program);

		gl.enableVertexAttribArray(this.positionLocation);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
		gl.vertexAttribPointer(this.positionLocation, 3, gl.FLOAT, false, 3 * 4, 0);

		gl.enableVertexAttribArray(this.uvLocation);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
		gl.vertexAttribPointer(this.uvLocation, 2, gl.FLOAT, false, 2 * 4, 0);

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

		gl.uniformMatrix4fv(this.mpLocation, false, MVP);
		gl.uniform1i(this.textureLocation, 0);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		gl.drawElements(gl.TRIANGLES, this.index.length, gl.UNSIGNED_SHORT, 0);
	}
}
