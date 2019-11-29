import Camera from '../graphic/camera';
import matrix4 from '../math/matrix4';
import Vector from '../math/vector';

const OBJ = require('webgl-obj-loader');

export default class ReliefSceneObject {
	private vertex: number[];
	private index: number[];
	private normal: number[];
	private uv: number[];
	private tangent: number[];
	private bitangent: number[];

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
	private bitangentBuffer: WebGLBuffer;

	private texture: WebGLTexture;
	private reliefTexture: WebGLTexture;
	private textureLocation: WebGLUniformLocation;
	private reliefTextureLocation: WebGLUniformLocation;

	private positionLocation: number;
	private normalLocation: number;
	private uvLocation: number;
	private tangentLocation: number;
	private biTangentLocation: number;

	private uViewMatrixLocation: WebGLUniformLocation;
	private uModelMatrixLocation: WebGLUniformLocation;
	private uProjectionMatrixLocation: WebGLUniformLocation;
	private uNormalMatrixLocation: WebGLUniformLocation;

	private lightPosLocation: WebGLUniformLocation;
	private viewPosLocation: WebGLUniformLocation;

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
		this.normal = mesh.vertexNormals;
		this.index = mesh.indices;
		this.uv = mesh.textures;

		/* store variables */
		this.gl = gl;
		this.program = program;
		this.camera = camera;
		this.projMatrix = projMatrix;

		/* init webgl data */
		this.positionLocation = gl.getAttribLocation(program, 'a_position');
		this.normalLocation = gl.getAttribLocation(program, 'a_normal');
		this.uvLocation = gl.getAttribLocation(program, 'a_uv');
		this.tangentLocation = gl.getAttribLocation(program, 'a_tangent');
		this.biTangentLocation = gl.getAttribLocation(program, 'a_bitangent');

		this.uViewMatrixLocation = gl.getUniformLocation(program, 'uViewMatrix');
		this.uModelMatrixLocation = gl.getUniformLocation(program, 'uModelMatrix');
		this.uProjectionMatrixLocation = gl.getUniformLocation(program, 'uProjectionMatrix');
		this.uNormalMatrixLocation = gl.getUniformLocation(program, 'uNormalMatrix');

		this.textureLocation = gl.getUniformLocation(program, 'uSampler');
		this.reliefTextureLocation = gl.getUniformLocation(program, 'uNormals');

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

		this.calculateTangent();

		this.tangentBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.tangentBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.tangent), gl.STATIC_DRAW);

		this.bitangentBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.bitangentBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.bitangent), gl.STATIC_DRAW);

		const image = new Image();
		image.src = imageUrl;
		image.addEventListener('load', () => {
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
		reliefImage.addEventListener('load', () => {
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

		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
		gl.enableVertexAttribArray(this.normalLocation);
		gl.vertexAttribPointer(this.normalLocation, 3, gl.FLOAT, false, 3 * 4, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
		gl.enableVertexAttribArray(this.uvLocation);
		gl.vertexAttribPointer(this.uvLocation, 2, gl.FLOAT, false, 2 * 4, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.tangentBuffer);
		gl.enableVertexAttribArray(this.tangentLocation);
		gl.vertexAttribPointer(this.tangentLocation, 3, gl.FLOAT, false, 3 * 4, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.bitangentBuffer);
		gl.enableVertexAttribArray(this.biTangentLocation);
		gl.vertexAttribPointer(this.biTangentLocation, 3, gl.FLOAT, false, 3 * 4, 0);

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

		let N = matrix4.transpose(matrix4.inverse(M));

		gl.uniformMatrix4fv(this.uModelMatrixLocation, false, M);
		gl.uniformMatrix4fv(this.uViewMatrixLocation, false, V);
		gl.uniformMatrix4fv(this.uProjectionMatrixLocation, false, P);
		gl.uniformMatrix4fv(this.uNormalMatrixLocation, false, N);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		gl.uniform1i(this.textureLocation, 0);

		gl.activeTexture(gl.TEXTURE0 + 1);
		gl.bindTexture(gl.TEXTURE_2D, this.reliefTexture);
		gl.uniform1i(this.reliefTextureLocation, 1);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		gl.drawElements(gl.TRIANGLES, this.index.length, gl.UNSIGNED_SHORT, 0);
	}

	private calculateTangent(): void {
		this.tangent = [];
		this.bitangent = [];
		for (let i = 0; i < this.index.length; i += 3) {
			const { tangent, bitangent } = this.calcTangentBitangent(
				this.iX(i, 0),
				this.iY(i, 0),
				this.iZ(i, 0),
				this.iX(i, 1),
				this.iY(i, 1),
				this.iZ(i, 1),
				this.iX(i, 2),
				this.iY(i, 2),
				this.iZ(i, 2),
				this.iU(i, 0),
				this.iV(i, 0),
				this.iU(i, 1),
				this.iV(i, 1),
				this.iU(i, 2),
				this.iV(i, 2)
			);
			this.tangent.push(tangent[0]);
			this.tangent.push(tangent[1]);
			this.tangent.push(tangent[2]);

			this.bitangent.push(bitangent[0]);
			this.bitangent.push(bitangent[1]);
			this.bitangent.push(bitangent[2]);
		}
	}

	private iX(index: number, nmb: number): number {
		return this.vertex[this.index[index + nmb] * 3 + 0];
	}

	private iY(index: number, nmb: number): number {
		return this.vertex[this.index[index + nmb] * 3 + 1];
	}

	private iZ(index: number, nmb: number): number {
		return this.vertex[this.index[index + nmb] * 3 + 2];
	}

	private iU(index: number, nmb: number): number {
		return this.uv[this.index[index + nmb] * 2 + 0];
	}

	private iV(index: number, nmb: number): number {
		return this.uv[this.index[index + nmb] * 2 + 1];
	}

	private calcTangentBitangent(
		x1: number,
		y1: number,
		z1: number,
		x2: number,
		y2: number,
		z2: number,
		x3: number,
		y3: number,
		z3: number,
		u1: number,
		v1: number,
		u2: number,
		v2: number,
		u3: number,
		v3: number
	): { tangent: number[]; bitangent: number[] } {
		const pos1 = [x1, y1, z1];
		const pos2 = [x2, y2, z2];
		const pos3 = [x3, y3, z3];

		const uv1 = [u1, v1];
		const uv2 = [u2, v2];
		const uv3 = [u3, v3];

		const edge1 = Vector.subtract(pos2, pos1);
		const edge2 = Vector.subtract(pos3, pos1);
		const deltaUV1 = Vector.subtract2(uv2, uv1);
		const deltaUV2 = Vector.subtract2(uv3, uv1);

		const f = 1.0 / (deltaUV1[0] * deltaUV2[1] - deltaUV2[0] * deltaUV1[1]);

		let tangent = [
			f * (deltaUV2[1] * edge1[0] - deltaUV1[1] * edge2[0]),
			f * (deltaUV2[1] * edge1[1] - deltaUV1[1] * edge2[1]),
			f * (deltaUV2[1] * edge1[2] - deltaUV1[1] * edge2[2])
		];
		tangent = Vector.normalize(tangent);

		let bitangent = [
			f * (-deltaUV2[0] * edge1[0] + deltaUV1[0] * edge2[0]),
			f * (-deltaUV2[0] * edge1[1] + deltaUV1[0] * edge2[1]),
			f * (-deltaUV2[0] * edge1[2] + deltaUV1[0] * edge2[2])
		];
		bitangent = Vector.normalize(bitangent);
		return {
			tangent: tangent,
			bitangent: bitangent
		};
	}
}
