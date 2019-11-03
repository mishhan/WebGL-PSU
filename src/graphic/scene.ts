import webglUtils from "../utils/webglUtils";

import Camera from "./camera";

import Landscape from "../models/landscape";
import Sky from "../models/sky";

import matrix4 from "../math/matrix4";
import angle from "../math/angle";
/* https://stackoverflow.com/questions/45432951/typescript-compiler-cannot-find-module-when-using-webpack-require-for-css-imag */
// @ts-ignore
import skybox_cubemap from "../assets/images/sky/skybox_cubemap.jpg";

export default class Scene {
	private landscape: any;
	private sky: any;

	private pMatrix: number[];
	public camera: Camera;

	private gl: WebGLRenderingContext;
	private programLandscape: WebGLProgram;
	private programSky: WebGLProgram;

	constructor(gl: WebGLRenderingContext, camera: Camera) {
		this.gl = gl;
		this.camera = camera;
		this.initObjects();
		this.initData();
		this.initGraphicData();
	}

	private initObjects() {
		this.landscape = {
			vertex: [],
			index: [],
			matrixes: {
				translation: [],
				rotation: [],
				scale: []
			},
			vertexBuffer: null,
			indexBuffer: null,

			texture: null,
			textureLocation: null,
			textureImageElement: null,

			positionLocation: null,
			normalLocation: null,
			uvLocation: null,

			mpLocation: null,
			mvpLocation: null,

			lightPos: null,
			lightPosLocation: null
		};

		this.sky = {
			vertex: [],
			index: [],

			vertexBuffer: null,
			indexBuffer: null,

			positionLocation: null,
			mvpLocation: null,

			cubeTexture: null,
			textureLocation: null,
			textureImageElement: null
		};
	}

	private initData() {
		this.pMatrix = matrix4.perspective(
			angle.degToRad(30),
			this.gl.canvas.width / this.gl.canvas.height,
			0.01,
			1000
		);

		const landscape = new Landscape();
		const sky = new Sky();

		this.camera.Landscape = landscape;
		this.camera.initPosition();

		this.landscape.vertex = landscape.getVertex();
		this.landscape.index = landscape.getIndex();
		this.landscape.matrixes = landscape.getMatrixes();
		this.landscape.lightPos = landscape.getLightPos();
		this.sky.vertex = sky.getVertex();
		this.sky.index = sky.getIndex();
	}

	private initGraphicData() {
		this.initLandscape();
		this.initSky();
	}

	private initLandscape() {
		const gl = this.gl;
		this.programLandscape = webglUtils.createProgramFromScripts(gl, [
			"landscape-vertex-shader",
			"landscape-fragment-shader"
		]);

		this.landscape.textureImageElement = "landscape_texture";
		this.landscape.positionLocation = gl.getAttribLocation(this.programLandscape, "a_position");
		this.landscape.normalLocation = gl.getAttribLocation(this.programLandscape, "a_normal");
		this.landscape.uvLocation = gl.getAttribLocation(this.programLandscape, "a_uv");
		this.landscape.mpLocation = gl.getUniformLocation(this.programLandscape, "u_MV");
		this.landscape.mvpLocation = gl.getUniformLocation(this.programLandscape, "u_MVP");
		this.landscape.lightPosLocation = gl.getUniformLocation(this.programLandscape, "u_lightPos");
		this.landscape.textureLocation = gl.getUniformLocation(this.programLandscape, "u_landscape");

		this.landscape.indexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.landscape.indexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.landscape.index), gl.STATIC_DRAW);

		this.landscape.vertexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.landscape.vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.landscape.vertex), gl.STATIC_DRAW);

		this.landscape.texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, this.landscape.texture);

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, <HTMLImageElement>(
			document.getElementById(this.landscape.textureImageElement)
		));
	}

	private initSky() {
		const gl = this.gl;
		this.programSky = webglUtils.createProgramFromScripts(gl, [
			"sky-vertex-shader",
			"sky-fragment-shader"
		]);

		this.sky.textureImageElement = "sky_texture";
		this.sky.positionLocation = gl.getAttribLocation(this.programSky, "a_position");
		this.sky.mvpLocation = gl.getUniformLocation(this.programSky, "u_MVP");
		this.sky.textureLocation = gl.getUniformLocation(this.programSky, "u_skybox");

		this.sky.indexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.sky.indexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.sky.index), gl.STATIC_DRAW);

		this.sky.vertexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.sky.vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.sky.vertex), gl.STATIC_DRAW);

		this.sky.cubeTexture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.sky.cubeTexture);

		const canvas = <HTMLCanvasElement>document.getElementById("canvas-handler");
		const context = canvas.getContext("2d");

		const image = new Image();
		image.src = skybox_cubemap;
		image.addEventListener("load", () => {
			const sideLength = image.width / 4;
			canvas.width = image.width;
			canvas.height = image.height;

			context.drawImage(image, 0, 0);

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

	public drawScene() {
		const gl = this.gl;

		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.enable(gl.CULL_FACE);

		this.drawSky();
		this.drawLandscape();
	}

	private drawLandscape() {
		const gl = this.gl;

		gl.useProgram(this.programLandscape);
		gl.enable(gl.DEPTH_TEST);

		gl.enableVertexAttribArray(this.landscape.positionLocation);
		gl.enableVertexAttribArray(this.landscape.normalLocation);
		gl.enableVertexAttribArray(this.landscape.uvLocation);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.landscape.vertexBuffer);

		const size3 = 3;
		const size2 = 2;
		const floatBytes = 4;
		const type = gl.FLOAT;
		const normalize = false;
		const stride = 8 * floatBytes;
		const offsetPosition = 0;
		const offsetNormal = 3 * floatBytes;
		const offsetTexture = 6 * floatBytes;

		gl.vertexAttribPointer(
			this.landscape.positionLocation,
			size3,
			type,
			normalize,
			stride,
			offsetPosition
		);
		gl.vertexAttribPointer(
			this.landscape.normalLocation,
			size3,
			type,
			normalize,
			stride,
			offsetNormal
		);
		gl.vertexAttribPointer(
			this.landscape.uvLocation,
			size2,
			type,
			normalize,
			stride,
			offsetTexture
		);

		const P = this.pMatrix;

		let V = this.camera.getViewMatrix();

		let M = matrix4.identity();
		M = matrix4.translate(
			M,
			this.landscape.matrixes.translation[0],
			this.landscape.matrixes.translation[1],
			this.landscape.matrixes.translation[2]
		);
		M = matrix4.rotate(
			M,
			this.landscape.matrixes.rotation[0],
			this.landscape.matrixes.rotation[1],
			this.landscape.matrixes.rotation[2]
		);
		M = matrix4.scale(
			M,
			this.landscape.matrixes.scale[0],
			this.landscape.matrixes.scale[1],
			this.landscape.matrixes.scale[2]
		);

		let MP = matrix4.multiply(P, M);
		let MVP = matrix4.multiply(P, V);
		MVP = matrix4.multiply(MVP, M);

		gl.uniform3fv(this.landscape.lightPosLocation, this.landscape.lightPos);
		gl.uniformMatrix4fv(this.landscape.mpLocation, false, MP);
		gl.uniformMatrix4fv(this.landscape.mvpLocation, false, MVP);
		gl.uniform1i(this.landscape.textureLocation, 0);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.landscape.indexBuffer);

		gl.drawElements(gl.TRIANGLES, this.landscape.index.length, gl.UNSIGNED_SHORT, 0);
	}

	private drawSky() {
		const gl = this.gl;

		gl.useProgram(this.programSky);
		gl.disable(gl.DEPTH_TEST);

		gl.enableVertexAttribArray(this.sky.positionLocation);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.sky.vertexBuffer);

		const size3 = 3;
		const floatBytes = 4;
		const type = gl.FLOAT;
		const normalize = false;
		const stride = 3 * floatBytes;
		const offset = 0;
		gl.vertexAttribPointer(this.sky.positionLocation, size3, type, normalize, stride, offset);

		const P = this.pMatrix;

		let V = this.camera.getViewMatrix();
		//important
		V[12] = 0;
		V[13] = 0;
		V[14] = 0;

		let M = matrix4.identity();
		let MVP = matrix4.multiply(P, V);
		MVP = matrix4.multiply(MVP, M);

		gl.uniformMatrix4fv(this.sky.mvpLocation, false, MVP);
		gl.uniform1i(this.sky.textureLocation, 0);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.sky.indexBuffer);
		gl.drawElements(gl.TRIANGLES, this.sky.index.length, gl.UNSIGNED_SHORT, 0);
	}
}
