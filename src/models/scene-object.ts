import Camera from '../graphic/camera';
import matrix4 from '../math/matrix4';

const OBJ = require('webgl-obj-loader');

export default class SceneObject {
	private vertex: number[];
	private index: number[];
	private uv: number[];

	private matrixes: {
		translation: number[];
		rotation: number[];
		scale: number[];
	};

	private rotationMatrix: number[];
	private isCatched: boolean;
	private isTurnable: boolean;

	private vertexBuffer: WebGLBuffer;
	private indexBuffer: WebGLBuffer;
	private uvBuffer: WebGLBuffer;

	private texture: WebGLTexture;
	private textureLocation: WebGLUniformLocation;

	private positionLocation: number;
	private uvLocation: number;
	private mpLocation: WebGLUniformLocation;

	private fakeColorLocation: WebGLUniformLocation;
	private isFakeLocation: WebGLUniformLocation;

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
		isTurnable: boolean = false
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
		this.isTurnable = isTurnable;

		/* set values for rotating */
		this.rotationMatrix = matrix4.identity();
		this.isCatched = false;

		/* init webgl data */
		this.positionLocation = gl.getAttribLocation(program, 'a_position');
		this.uvLocation = gl.getAttribLocation(program, 'a_uv');
		this.mpLocation = gl.getUniformLocation(program, 'u_MP');
		this.textureLocation = gl.getUniformLocation(program, 'u_texture');

		this.isFakeLocation = gl.getUniformLocation(program, 'is_fake');
		this.fakeColorLocation = gl.getUniformLocation(program, 'fake_color');

		this.indexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.index), gl.STATIC_DRAW);

		this.vertexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertex), gl.STATIC_DRAW);

		this.uvBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.uv), gl.STATIC_DRAW);

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
	}

	public render() {
		this._render();
	}

	public fakeRender(color: number[]) {
		this._render(true, color);
	}

	public get IsTurnable(): boolean {
		return this.isTurnable;
	}

	public set IsCatched(isCatched: boolean) {
		this.isCatched = isCatched;
	}

	public get RotationMatrix(): number[] {
		return this.rotationMatrix;
	}

	public set RotationMatrix(matrix: number[]) {
		this.rotationMatrix = matrix;
	}

	public set Matrixes(matrixes: any) {
		this.matrixes = matrixes;
	}

	public rotate(angleX: number, angleY: number): void {
		let r = this.rotationMatrix;
		r = matrix4.multiply(r, matrix4.fromRotation(angleX, [r[1], r[5], r[9]]));
		r = matrix4.multiply(r, matrix4.fromRotation(angleY, [r[0], r[4], r[8]]));
		//r = matrix4.normalize(r);
		this.rotationMatrix = r;
	}

	private _render(isFake: boolean = false, fakeColor: number[] = [0, 0, 0]) {
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

		if (this.isCatched) {
			MVP = matrix4.multiply(MVP, this.rotationMatrix);
		}

		gl.uniformMatrix4fv(this.mpLocation, false, MVP);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.texture);

		gl.uniform1i(this.textureLocation, 0);

		/* logic fake drowing */
		gl.uniform1i(this.isFakeLocation, isFake === false ? 0 : 1);
		gl.uniform3fv(this.fakeColorLocation, fakeColor);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		gl.drawElements(gl.TRIANGLES, this.index.length, gl.UNSIGNED_SHORT, 0);
	}
}
