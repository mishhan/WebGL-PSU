import webglUtils from "../utils/webglUtils";
import matrix4 from "../math/matrix4";
import angle from "../math/angle";
import Camera from "./camera";
import SceneObject from "../models/scene-object";
import SceneInitializer from "../initializers/scene-initializer";

import Landscape from "../models/environment/landscape";
import LandscapeSceneObject from "../models/landscape-scene-object";
import Sky from "../models/environment/sky";
import SkySceneObject from "../models/sky-scene-object";

export default class Scene {
	private landscape: Landscape;
	private landscapeSceneObject: LandscapeSceneObject;

	private sky: Sky;
	private skySceneObject: SkySceneObject;

	private sceneObjects: SceneObject[];
	private colorTable: Map<number, SceneObject>;

	private projMatrix: number[];
	private camera: Camera;

	private gl: WebGLRenderingContext;
	private programLandscape: WebGLProgram;
	private programSky: WebGLProgram;

	constructor(gl: WebGLRenderingContext, camera: Camera) {
		this.gl = gl;
		this.camera = camera;
		this.initScene();
		//get scene-objects from initializer
		const sceneInitializer = new SceneInitializer(this.gl, this.camera, this.projMatrix);
		this.sceneObjects = sceneInitializer.SceneObjects;

		this.initFakeSceneObjects();
	}

	public render() {
		const gl = this.gl;
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.enable(gl.CULL_FACE);

		gl.disable(gl.DEPTH_TEST);
		this.skySceneObject.render();
		//enable after drawing box
		gl.enable(gl.DEPTH_TEST);
		this.landscapeSceneObject.render();
		this.sceneObjects.forEach(sceneObject => sceneObject.render());
	}

	public fakeRender() {
		const gl = this.gl;
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.enable(gl.CULL_FACE);
		gl.enable(gl.DEPTH_TEST);

		this.colorTable.forEach((sceneObject, index) => {
			const r = index % 255;
			const g = Math.round((index % (255 * 255)) / 255);
			const b = Math.round(index / (255 * 255));
			sceneObject.fakeRender([r / 255, g / 255, b / 255]);
		});
	}

	public get ColorTable(): Map<number, SceneObject> {
		return this.colorTable;
	}

	private initScene() {
		const gl = this.gl;
		this.projMatrix = matrix4.perspective(
			angle.degToRad(30),
			gl.canvas.width / gl.canvas.height,
			0.01,
			1000
		);

		/* landscape */
		this.landscape = new Landscape();
		this.programLandscape = webglUtils.createProgramFromScripts(gl, [
			"landscape-vertex-shader",
			"landscape-fragment-shader"
		]);
		this.landscapeSceneObject = new LandscapeSceneObject(
			gl,
			this.programLandscape,
			this.camera,
			this.projMatrix,
			this.landscape
		);

		/* sky */
		this.sky = new Sky();
		this.programSky = webglUtils.createProgramFromScripts(gl, [
			"sky-vertex-shader",
			"sky-fragment-shader"
		]);
		this.skySceneObject = new SkySceneObject(
			gl,
			this.programSky,
			this.camera,
			this.projMatrix,
			this.sky
		);

		/* camera props */
		this.camera.Landscape = this.landscape;
		this.camera.initPosition();
	}

	private initFakeSceneObjects() {
		this.colorTable = new Map();
		this.sceneObjects.forEach((item, index) => {
			if (item.IsTurnable) {
				//to be sure that there're no elements with key equals 0
				this.colorTable.set(index + 1, item);
			}
		});
	}
}
