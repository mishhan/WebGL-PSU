import Camera from "../graphic/camera";
import matrix4 from "../math/matrix4";
import Vector from "../math/vector";

const OBJ = require("webgl-obj-loader");

export default class ReliefSceneObject {
	private vertex: number[];
	private index: number[];
	private normal: number[];
	private uv: number[];
	private tangent: number[];

	private matrixes: {
		translation: number[];
		rotation: number[];
		scale: number[];
	};

	private vertexBuffer: WebGLBuffer;
	private indexBuffer: WebGLBuffer;
	private normalBuffer: WebGLBuffer;
	private uvBuffer: WebGLBuffer;
	private tangentBuffer: WebGLBuffer;

	private texture: WebGLTexture;
	private reliefTexture: WebGLTexture;
	private textureLocation: WebGLUniformLocation;
	private reliefTextureLocation: WebGLUniformLocation;

	private positionLocation: number;
	private normalLocation: number;
	private uvLocation: number;
	private tangentLocation: number;
	private mpLocation: WebGLUniformLocation;

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
		imageUrl: string,
		reliefImageUrl: string
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
		this.normalLocation = gl.getAttribLocation(program, "a_normal");
		this.uvLocation = gl.getAttribLocation(program, "a_uv");
		this.tangentLocation = gl.getAttribLocation(program, "a_tangent");
		this.mpLocation = gl.getUniformLocation(program, "u_MP");
		this.textureLocation = gl.getUniformLocation(program, "u_texture");
		this.reliefTextureLocation = gl.getUniformLocation(program, "u_normalMap");

		this.indexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.index), gl.STATIC_DRAW);

		this.vertexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertex), gl.STATIC_DRAW);

		this.normalBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normal), gl.STATIC_DRAW);

		this.uvBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.uv), gl.STATIC_DRAW);

		this.tangent = this.calculateTangent();
		this.tangentBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.tangentBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.tangent), gl.STATIC_DRAW);

		const image = new Image();
		image.src = imageUrl;
		image.addEventListener("load", () => {
			this.texture = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, this.texture);

			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);

			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
		});

		const reliefImage = new Image();
		reliefImage.src = reliefImageUrl;
		reliefImage.addEventListener("load", () => {
			this.reliefTexture = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, this.reliefTexture);

			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);

			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, reliefImage);
		});
	}

	public set Matrixes(matrixes: any) {
		this.matrixes = matrixes;
	}

	public render() {
		const gl = this.gl;
		gl.useProgram(this.program);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
		gl.enableVertexAttribArray(this.positionLocation);
		gl.vertexAttribPointer(this.positionLocation, 3, gl.FLOAT, false, 3 * 4, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
		gl.enableVertexAttribArray(this.uvLocation);
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

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		gl.uniform1i(this.textureLocation, 0);

		gl.activeTexture(gl.TEXTURE0 + 1);
		gl.bindTexture(gl.TEXTURE_2D, this.reliefTexture);
		gl.uniform1i(this.reliefTextureLocation, 1);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		gl.drawElements(gl.TRIANGLES, this.index.length, gl.UNSIGNED_SHORT, 0);
	}

	private calculateTangent(): number[] {
		let buffer: number[] = [].fill(0, 0, this.index.length * 3 - 1);

		for (let i = 0; i < this.index.length; i += 3) {
			const eo1 = [
				this.vertex[this.iX(i, 1)] - this.vertex[this.iX(i, 0)],
				this.vertex[this.iY(i, 1)] - this.vertex[this.iZ(i, 0)],
				this.vertex[this.iY(i, 1)] - this.vertex[this.iZ(i, 0)]
			];

			const eo2 = [
				this.vertex[this.iX(i, 2)] - this.vertex[this.iX(i, 0)],
				this.vertex[this.iY(i, 2)] - this.vertex[this.iZ(i, 0)],
				this.vertex[this.iY(i, 2)] - this.vertex[this.iZ(i, 0)]
			];

			const et1 = [
				this.uv[this.iU(i, 1)] - this.uv[this.iU(i, 0)],
				this.uv[this.iV(i, 1)] - this.uv[this.iV(i, 0)]
			];

			const et2 = [
				this.uv[this.iU(i, 2)] - this.uv[this.iU(i, 0)],
				this.uv[this.iV(i, 2)] - this.uv[this.iV(i, 0)]
			];

			const f = 1.0 / (et1[0] * et2[1] - et2[0] * et1[1]);

			let tangent = [
				f * (et2[1] * eo1[0] - et1[1] * eo2[0]),
				f * (et2[1] * eo1[1] - et1[1] * eo2[1]),
				f * (et2[1] * eo1[2] - et1[1] * eo2[2])
			];
			tangent = Vector.normalize(tangent);

			for (let j = 0; j < 3; j++) {
				let t = [buffer[this.iX(j, 0)], buffer[this.iY(j, 0)], buffer[this.iZ(j, 0)]];

				t = Vector.add(t, tangent);
				t = Vector.normalize(t);

				buffer[this.iX(j, 0)] = t[0];
				buffer[this.iY(j, 0)] = t[1];
				buffer[this.iZ(j, 0)] = t[2];
			}
		}

		return buffer;
	}

	private iX(index: number, nmb: number): number {
		return this.index[index + nmb] * 3 + 0;
	}

	private iY(index: number, nmb: number): number {
		return this.index[index + nmb] * 3 + 1;
	}

	private iZ(index: number, nmb: number): number {
		return this.index[index + nmb] * 3 + 2;
	}

	private iU(index: number, nmb: number): number {
		return this.index[index + nmb] * 2 + 0;
	}

	private iV(index: number, nmb: number): number {
		return this.index[index + nmb] * 2 + 1;
	}
}
