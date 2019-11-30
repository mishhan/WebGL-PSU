import GlElement from '../base/gl-element';
import SceneObject from '../scene/scene-object';
import Camera from './camera';
import LandscapeSceneObject from '../scene/landscape-scene-object';
import SkySceneObject from '../scene/sky-scene-object';
import Landscape from '../models/environment/landscape';
import Sky from '../models/environment/sky';
import SceneInitializer from '../initializers/scene-initializer';
import { vec3, mat4 } from 'gl-matrix';
import { degToRad } from '../utils/utils';

export default class Scene extends GlElement {
	private camera: Camera;
	private projMatrix: mat4;
	private lightPosition: vec3;

	private landscapeSceneObject: LandscapeSceneObject;
	private skySceneObject: SkySceneObject;

	private wonderfulObject: SceneObject;
	private sceneObjects: SceneObject[];
	private colorTable: Map<number, SceneObject>;

	constructor(gl: WebGLRenderingContext, camera: Camera) {
		super(gl);
		this.camera = camera;
		this.projMatrix = mat4.create();

		this.initScene();
		//get scene-objects from initializer
		const sceneInitializer = new SceneInitializer(this.gl, this.camera, this.projMatrix);
		this.sceneObjects = sceneInitializer.SceneObjects;
		this.wonderfulObject = this.sceneObjects[7];
		this.initFakeSceneObjects();
	}

	public beginRenderLoop() {
		this.render();
		requestAnimationFrame(this.beginRenderLoop.bind(this));
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

	public get WonderfulObject(): SceneObject {
		return this.wonderfulObject;
	}

	private initScene() {
		const gl = this.gl;
		mat4.perspective(this.projMatrix, degToRad(30), gl.canvas.width / gl.canvas.height, 0.01, 1000);

		/* landscape */
		const landscape = new Landscape();
		this.landscapeSceneObject = new LandscapeSceneObject(
			gl,
			this.camera,
			this.projMatrix,
			landscape
		);

		/* sky */
		const sky = new Sky();
		this.skySceneObject = new SkySceneObject(gl, this.camera, this.projMatrix, sky);

		/* camera props */
		this.camera.Landscape = landscape;
		this.camera.initPosition();
	}

	private initFakeSceneObjects() {
		this.colorTable = new Map();
		this.sceneObjects.forEach((item, index) => {
			if (item.isTurnable) {
				//to be sure that there're no elements with key equals 0
				this.colorTable.set(index + 1, item);
			}
		});
	}
}
