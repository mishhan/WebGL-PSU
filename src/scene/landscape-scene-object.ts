import GLObject from '../base/gl-object';
import Camera from '../graphic/camera';
import Landscape from '../models/environment/landscape';
import FragmentShader from '../models/shaders/landscape/fragment-shader';
import VertexShader from '../models/shaders/landscape/vertex-shader';
import { mat4, vec3 } from 'gl-matrix';
// @ts-ignore
import landscapeImage from '../assets/images/landscape/landscape.jpg';

export default class LandscapeSceneObject extends GLObject {
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

	private uViewMatrixLocation: WebGLUniformLocation;
	private uModelMatrixLocation: WebGLUniformLocation;
	private uProjectionMatrixLocation: WebGLUniformLocation;

	private lightPos: number[];
	private lightPosLocation: WebGLUniformLocation;

	private camera: Camera;
	private projMatrix: mat4;

	constructor(gl: WebGLRenderingContext, camera: Camera, projMatrix: mat4, landscape: Landscape) {
		super(gl);

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
		this.positionLocation = gl.getAttribLocation(this.program, 'aVertexPosition');
		this.normalLocation = gl.getAttribLocation(this.program, 'aVertexNormal');
		this.uvLocation = gl.getAttribLocation(this.program, 'aTextureCoord');

		this.uViewMatrixLocation = gl.getUniformLocation(this.program, 'uViewMatrix');
		this.uModelMatrixLocation = gl.getUniformLocation(this.program, 'uModelMatrix');
		this.uProjectionMatrixLocation = gl.getUniformLocation(this.program, 'uProjectionMatrix');

		this.lightPosLocation = gl.getUniformLocation(this.program, 'uLightPos');
		this.textureLocation = gl.getUniformLocation(this.program, 'uSampler');

		this.indexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.index), gl.STATIC_DRAW);

		this.vertexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertex), gl.STATIC_DRAW);

		const image = new Image();
		image.src = landscapeImage;
		image.addEventListener('load', () => {
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

		let M = mat4.create();
		let N = mat4.create();
		mat4.identity(M);
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
		mat4.rotateX(M, M, this.matrixes.rotation[1]);
		mat4.rotateX(M, M, this.matrixes.rotation[2]);

		mat4.scale(
			M,
			M,
			vec3.fromValues(this.matrixes.scale[0], this.matrixes.scale[1], this.matrixes.scale[2])
		);

		gl.uniform3fv(this.lightPosLocation, this.lightPos);
		gl.uniformMatrix4fv(this.uModelMatrixLocation, false, M);
		gl.uniformMatrix4fv(this.uViewMatrixLocation, false, V);
		gl.uniformMatrix4fv(this.uProjectionMatrixLocation, false, P);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		gl.uniform1i(this.textureLocation, 0);

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
