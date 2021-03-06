import GLObject from '../base/gl-object';
import Camera from '../graphic/camera';
import Sky from '../models/environment/sky';
import FragmentShader from '../models/shaders/sky/fragment-shader';
import VertexShader from '../models/shaders/sky/vertex-shader';
import { mat4 } from 'gl-matrix';
// @ts-ignore
import skyboxImage from '../assets/images/sky/skybox.jpg';

export default class SkySceneObject extends GLObject {
	private vertex: number[];
	private index: number[];

	private vertexBuffer: WebGLBuffer;
	private indexBuffer: WebGLBuffer;

	private texture: WebGLTexture;
	private textureLocation: WebGLUniformLocation;

	private positionLocation: number;
	private uViewMatrixLocation: WebGLUniformLocation;
	private uModelMatrixLocation: WebGLUniformLocation;
	private uProjectionMatrixLocation: WebGLUniformLocation;

	private camera: Camera;
	private projMatrix: mat4;

	constructor(gl: WebGLRenderingContext, camera: Camera, projMatrix: mat4, sky: Sky) {
		super(gl);
		this.camera = camera;
		this.projMatrix = projMatrix;

		this.index = sky.getIndex();
		this.vertex = sky.getVertex();
		this.init();
	}

	private init() {
		const gl = this.gl;

		this.positionLocation = gl.getAttribLocation(this.program, 'aVertexPosition');

		this.uViewMatrixLocation = gl.getUniformLocation(this.program, 'uViewMatrix');
		this.uModelMatrixLocation = gl.getUniformLocation(this.program, 'uModelMatrix');
		this.uProjectionMatrixLocation = gl.getUniformLocation(this.program, 'uProjectionMatrix');
		this.textureLocation = gl.getUniformLocation(this.program, 'uSampler');

		this.indexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.index), gl.STATIC_DRAW);

		this.vertexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertex), gl.STATIC_DRAW);

		const canvas = <HTMLCanvasElement>document.getElementById('canvas-handler');
		const context = canvas.getContext('2d');

		const image = new Image();
		image.src = skyboxImage;
		image.addEventListener('load', () => {
			const sideLength = image.width / 4;
			canvas.width = image.width;
			canvas.height = image.height;

			context.drawImage(image, 0, 0);
			this.texture = gl.createTexture();
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);

			const cubeFaces = [
				{
					target: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
					imageData: context.getImageData(sideLength * 2, sideLength, sideLength, sideLength)
				},
				{
					target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
					imageData: context.getImageData(0, sideLength, sideLength, sideLength)
				},
				{
					target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
					imageData: context.getImageData(sideLength, 0, sideLength, sideLength)
				},
				{
					target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
					imageData: context.getImageData(sideLength, sideLength * 2, sideLength, sideLength)
				},
				{
					target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
					imageData: context.getImageData(sideLength, sideLength, sideLength, sideLength)
				},
				{
					target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
					imageData: context.getImageData(sideLength * 3, sideLength, sideLength, sideLength)
				}
			];

			cubeFaces.forEach(cubeFace => {
				gl.texImage2D(cubeFace.target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cubeFace.imageData);
			});

			gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
			gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
		});
	}

	public render() {
		const gl = this.gl;
		gl.useProgram(this.program);

		gl.enableVertexAttribArray(this.positionLocation);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
		gl.vertexAttribPointer(this.positionLocation, 3, gl.FLOAT, false, 3 * 4, 0);

		const P = this.projMatrix;
		const V = this.camera.getViewMatrix();

		/* IMPORTANT */
		V[12] = 0;
		V[13] = 0;
		V[14] = 0;

		let M = mat4.create();

		gl.uniformMatrix4fv(this.uModelMatrixLocation, false, M);
		gl.uniformMatrix4fv(this.uViewMatrixLocation, false, V);
		gl.uniformMatrix4fv(this.uProjectionMatrixLocation, false, P);

		gl.uniform1i(this.textureLocation, 0);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		gl.drawElements(gl.TRIANGLES, this.index.length, gl.UNSIGNED_SHORT, 0);
	}

	getVS(): string {
		return VertexShader;
	}

	getFS(): string {
		return FragmentShader;
	}
}
