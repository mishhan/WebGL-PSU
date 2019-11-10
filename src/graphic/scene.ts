import webglUtils from "../utils/webglUtils";
import matrix4 from "../math/matrix4";
import angle from "../math/angle";
import Camera from "./camera";
import SceneObject from "../models/scene-object";
import Landscape from "../models/environment/landscape";
import LandscapeSceneObject from "../models/landscape-scene-object";
import Sky from "../models/environment/sky";
import SkySceneObject from "../models/sky-scene-object";
import houseObj from "../models/house/house-obj";
import cactusObj from "../models/cactus/cactus-obj";
import corsucantObj from "../models/corsucant/corsucant-obj";
// @ts-ignore
import houseImage from "../models/house/house.jpg";
// @ts-ignore
import cactusImage from "../models/cactus/cactus.jpg";
// @ts-ignore
import corsucantImage from "../models/corsucant/corsucant.jpg";

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
	private programObject: WebGLProgram;

	constructor(gl: WebGLRenderingContext, camera: Camera) {
		this.gl = gl;
		this.camera = camera;
		this.initScene();
		this.initSceneObjects();
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

	private initSceneObjects() {
		const gl = this.gl;
		this.programObject = webglUtils.createProgramFromScripts(gl, [
			"object-vertex-shader",
			"object-fragment-shader"
		]);

		this.sceneObjects = [];
		// prettier-ignore
		const house = new SceneObject(gl, 
			this.programObject, 
			this.camera, 
			this.projMatrix, 
			houseObj, 
			houseImage);

		house.Matrixes = {
			translation: [0.5, 0.1, 0.5],
			rotation: [0, 0, 0],
			scale: [1 / 50, 1 / 50, 1 / 50]
		};
		this.sceneObjects.push(house);

		const cactus = new SceneObject(
			gl,
			this.programObject,
			this.camera,
			this.projMatrix,
			cactusObj,
			cactusImage
		);

		cactus.Matrixes = {
			translation: [-0.5, 0.1, -0.5],
			rotation: [200, 0, 0],
			scale: [1 / 500, 1 / 500, 1 / 500]
		};
		this.sceneObjects.push(cactus);

		const corsucant = new SceneObject(
			gl,
			this.programObject,
			this.camera,
			this.projMatrix,
			corsucantObj,
			corsucantImage,
			true
		);

		corsucant.Matrixes = {
			translation: [0.3, 0.3, -0.3],
			rotation: [0, 0, 0],
			scale: [1 / 10000, 1 / 10000, 1 / 10000]
		};
		this.sceneObjects.push(corsucant);

		const secondCorcusant = new SceneObject(
			gl,
			this.programObject,
			this.camera,
			this.projMatrix,
			corsucantObj,
			corsucantImage
		);
		secondCorcusant.Matrixes = {
			translation: [0.3, 0.3, -0.2],
			rotation: [0, 0, 0],
			scale: [1 / 20000, 1 / 20000, 1 / 20000]
		};
		this.sceneObjects.push(secondCorcusant);
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
