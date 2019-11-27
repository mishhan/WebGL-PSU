import Camera from '../graphic/camera';
import matrix4 from '../math/matrix4';
import Vector from '../math/vector';
import Cube from './cube/cube';

export default class SimpleSceneObject {
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
		cube: Cube,
		imageUrl: string,
		reliefImageUrl: string
	) {
		const data = cube.getData();
		this.vertex = data.vertex;
		this.index = data.index;
		this.normal = data.normal;
		this.uv = data.uv;
		this.tangent = data.tangent;
		this.bitangent = data.bitangent;

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
		this.viewPosLocation = gl.getUniformLocation(program, 'viewPos');
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
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);

			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		});

		const reliefImage = new Image();
		reliefImage.src = reliefImageUrl;
		reliefImage.addEventListener('load', () => {
			this.reliefTexture = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, this.reliefTexture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, reliefImage);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);

			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
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

		let N = matrix4.transpose(matrix4.inverse(matrix4.multiply(M, V)));

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
}
