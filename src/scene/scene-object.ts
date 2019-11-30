import GLObject from '../base/gl-object';
import Camera from '../graphic/camera';
import FragmentShader from '../models/shaders/object/fragment-shader';
import VertexShader from '../models/shaders/object/vertex-shader';
import { mat4, vec3, quat } from 'gl-matrix';

const OBJ = require('webgl-obj-loader');

export default class SceneObject extends GLObject {
	private vertex: number[];
	private index: number[];
	private normal: number[];
	private uv: number[];

	private matrixes: {
		translation: vec3;
		rotation: vec3;
		scale: vec3;
	};

	private rotationMatrix: mat4;
	private isCatched: boolean;

	private vertexBuffer: WebGLBuffer;
	private indexBuffer: WebGLBuffer;
	private normalBuffer: WebGLBuffer;
	private uvBuffer: WebGLBuffer;

	private uViewMatrixLocation: WebGLUniformLocation;
	private uModelMatrixLocation: WebGLUniformLocation;
	private uProjectionMatrixLocation: WebGLUniformLocation;
	private uNormalMatrixLocation: WebGLUniformLocation;
	private uRotationMatrixLocation: WebGLUniformLocation;

	private texture: WebGLTexture;
	private textureLocation: WebGLUniformLocation;

	private positionLocation: number;
	private normalLocation: number;
	private uvLocation: number;

	private fakeColorLocation: WebGLUniformLocation;
	private isFakeLocation: WebGLUniformLocation;

	private camera: Camera;
	private projMatrix: mat4;

	constructor(
		gl: WebGLRenderingContext,
		camera: Camera,
		projMatrix: mat4,
		obj: string,
		imageUrl: string,
		isTurnable: boolean = false
	) {
		super(gl);

		/* read data from obj */
		const mesh = new OBJ.Mesh(obj);
		this.vertex = mesh.vertices;
		this.index = mesh.indices;
		this.normal = mesh.vertexNormals;
		this.uv = mesh.textures;

		/* store variables */
		this.camera = camera;
		this.projMatrix = projMatrix;
		this.isTurnable = isTurnable;

		/* set values for rotating */
		this.rotationMatrix = mat4.create();
		this.isCatched = false;

		/* init webgl data */
		this.positionLocation = gl.getAttribLocation(this.program, 'aVertexPosition');
		this.normalLocation = gl.getAttribLocation(this.program, 'aVertexNormal');
		this.uvLocation = gl.getAttribLocation(this.program, 'aTextureCoord');

		this.uViewMatrixLocation = gl.getUniformLocation(this.program, 'uViewMatrix');
		this.uModelMatrixLocation = gl.getUniformLocation(this.program, 'uModelMatrix');
		this.uProjectionMatrixLocation = gl.getUniformLocation(this.program, 'uProjectionMatrix');
		this.uNormalMatrixLocation = gl.getUniformLocation(this.program, 'uNormalMatrix');
		this.uRotationMatrixLocation = gl.getUniformLocation(this.program, 'uRotationMatrix');
		this.textureLocation = gl.getUniformLocation(this.program, 'uSampler');
		this.isFakeLocation = gl.getUniformLocation(this.program, 'isFake');
		this.fakeColorLocation = gl.getUniformLocation(this.program, 'fakeColor');

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

	public set IsCatched(isCatched: boolean) {
		this.isCatched = isCatched;
	}

	public set Matrixes(matrixes: any) {
		this.matrixes = matrixes;
	}

	public rotate(angleX: number, angleY: number): void {
		let rotationMatrix = this.rotationMatrix;
		let fromRotationMatrix = mat4.create();
		mat4.multiply(
			rotationMatrix,
			rotationMatrix,
			mat4.fromRotation(
				fromRotationMatrix,
				angleX,
				vec3.fromValues(rotationMatrix[1], rotationMatrix[5], rotationMatrix[9])
			)
		);
		mat4.multiply(
			rotationMatrix,
			rotationMatrix,
			mat4.fromRotation(
				fromRotationMatrix,
				angleY,
				vec3.fromValues(rotationMatrix[0], rotationMatrix[4], rotationMatrix[8])
			)
		);
		this.rotationMatrix = rotationMatrix;
	}

	public rotateQ(quaternion: number[]): void {
		let r = this.rotationMatrix;
		const quatnion = quat.fromValues(quaternion[0], quaternion[1], quaternion[2], quaternion[3]);
		quat.normalize(quatnion, quatnion);
		mat4.fromQuat(r, quatnion);
		this.rotationMatrix = r;
	}

	private _render(isFake: boolean = false, fakeColor: number[] = [0, 0, 0]) {
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

		const P = this.projMatrix;
		const V = this.camera.getViewMatrix();
		let M = mat4.create();
		let N = mat4.create();
		mat4.translate(
			M,
			M,
			vec3.fromValues(
				this.matrixes.translation[0],
				this.matrixes.translation[1],
				this.matrixes.translation[2]
			)
		);

		mat4.rotateX(M, M, this.matrixes.rotation[0]);
		mat4.rotateY(M, M, this.matrixes.rotation[1]);
		mat4.rotateZ(M, M, this.matrixes.rotation[2]);

		mat4.scale(
			M,
			M,
			vec3.fromValues(this.matrixes.scale[0], this.matrixes.scale[1], this.matrixes.scale[2])
		);

		mat4.transpose(N, mat4.invert(N, N));

		gl.uniformMatrix4fv(this.uModelMatrixLocation, false, M);
		gl.uniformMatrix4fv(this.uViewMatrixLocation, false, V);
		gl.uniformMatrix4fv(this.uProjectionMatrixLocation, false, P);
		gl.uniformMatrix4fv(this.uNormalMatrixLocation, false, N);
		gl.uniformMatrix4fv(this.uRotationMatrixLocation, false, this.rotationMatrix);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.texture);

		gl.uniform1i(this.textureLocation, 0);

		/* logic fake drowing */
		gl.uniform1i(this.isFakeLocation, isFake === false ? 0 : 1);
		gl.uniform3fv(this.fakeColorLocation, fakeColor);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		gl.drawElements(this.getPrimitiveType(), this.index.length, gl.UNSIGNED_SHORT, 0);
	}

	getVS(): string {
		return VertexShader;
	}

	getFS(): string {
		return FragmentShader;
	}
}
