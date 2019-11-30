import Camera from '../graphic/camera';
import Cube from '../models/cube/cube';
import GLObject from '../base/gl-object';
import { mat4, vec3 } from 'gl-matrix';
import FragmentShader from '../models/shaders/relief-object/fragment-shader';
import VertexShader from '../models/shaders/relief-object/vertex-shader';

export default class ReliefCubeSceneObject extends GLObject {
	private vertex: number[];
	private index: number[];
	private normal: number[];
	private uv: number[];
	private tangent: number[];
	private bitangent: number[];

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
	private uRotationMatrixLocation: WebGLUniformLocation;

	private fakeColorLocation: WebGLUniformLocation;
	private isFakeLocation: WebGLUniformLocation;

	private viewPosLocation: WebGLUniformLocation;

	private camera: Camera;
	private projMatrix: mat4;

	constructor(
		gl: WebGLRenderingContext,
		camera: Camera,
		projMatrix: mat4,
		cube: Cube,
		imageUrl: string,
		reliefImageUrl: string,
		isTurnable: boolean = false
	) {
		super(gl);

		const data = cube.getData();
		this.vertex = data.vertex;
		this.index = data.index;
		this.normal = data.normal;
		this.uv = data.uv;
		this.tangent = data.tangent;
		this.bitangent = data.bitangent;

		/* store variables */
		this.camera = camera;
		this.projMatrix = projMatrix;
		this.isTurnable = isTurnable;
		this.rotationMatrix = mat4.create();

		/* init webgl data */
		this.positionLocation = gl.getAttribLocation(this.program, 'aVertexPosition');
		this.normalLocation = gl.getAttribLocation(this.program, 'aVertexNormal');
		this.uvLocation = gl.getAttribLocation(this.program, 'aTextureCoord');
		this.tangentLocation = gl.getAttribLocation(this.program, 'aTangent');
		this.biTangentLocation = gl.getAttribLocation(this.program, 'aBitangent');

		this.uViewMatrixLocation = gl.getUniformLocation(this.program, 'uViewMatrix');
		this.uModelMatrixLocation = gl.getUniformLocation(this.program, 'uModelMatrix');
		this.uProjectionMatrixLocation = gl.getUniformLocation(this.program, 'uProjectionMatrix');
		this.uRotationMatrixLocation = gl.getUniformLocation(this.program, 'uRotationMatrix');
		this.uNormalMatrixLocation = gl.getUniformLocation(this.program, 'uNormalMatrix');
		this.viewPosLocation = gl.getUniformLocation(this.program, 'viewPos');
		this.textureLocation = gl.getUniformLocation(this.program, 'uSampler');
		this.reliefTextureLocation = gl.getUniformLocation(this.program, 'uNormals');

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

	public set IsCatched(isCatched: boolean) {
		this.isCatched = isCatched;
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

	public render() {
		this._render();
	}

	public fakeRender(color: number[]) {
		this._render(true, color);
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

		gl.bindBuffer(gl.ARRAY_BUFFER, this.tangentBuffer);
		gl.enableVertexAttribArray(this.tangentLocation);
		gl.vertexAttribPointer(this.tangentLocation, 3, gl.FLOAT, false, 3 * 4, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.bitangentBuffer);
		gl.enableVertexAttribArray(this.biTangentLocation);
		gl.vertexAttribPointer(this.biTangentLocation, 3, gl.FLOAT, false, 3 * 4, 0);

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
		mat4.multiply(N, M, mat4.transpose(N, mat4.invert(N, N)));

		gl.uniformMatrix4fv(this.uModelMatrixLocation, false, M);
		gl.uniformMatrix4fv(this.uViewMatrixLocation, false, V);
		gl.uniformMatrix4fv(this.uProjectionMatrixLocation, false, P);
		gl.uniformMatrix4fv(this.uNormalMatrixLocation, false, N);
		gl.uniformMatrix4fv(this.uRotationMatrixLocation, false, this.rotationMatrix);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		gl.uniform1i(this.textureLocation, 0);

		gl.activeTexture(gl.TEXTURE0 + 1);
		gl.bindTexture(gl.TEXTURE_2D, this.reliefTexture);
		gl.uniform1i(this.reliefTextureLocation, 1);

		/* logic fake drowing */
		gl.uniform1i(this.isFakeLocation, isFake === false ? 0 : 1);
		gl.uniform3fv(this.fakeColorLocation, fakeColor);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		gl.drawElements(this.getPrimitiveType(), this.index.length, gl.UNSIGNED_SHORT, 0);
	}

	getFS(): string {
		return FragmentShader;
	}

	getVS(): string {
		return VertexShader;
	}
}
