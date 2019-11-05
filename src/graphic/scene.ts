import webglUtils from "../utils/webglUtils";
import matrix4 from "../math/matrix4";
import angle from "../math/angle";
import Camera from "./camera";
import SceneObject from "../models/scene-object";
import Landscape from "../models/landscape";
import LandscapeSceneObject from "../models/landscape-scene-object";
import Sky from "../models/sky";
import SkySceneObject from "../models/sky-scene-object";
import houseObj from "../models/house/house-obj";
import cactusObj from "../models/cactus/cactus-obj";
import corsucantObj from "../models/corsucant/corsucant-obj";

export default class Scene {
	private landscape: Landscape;
	private landscapeSceneObject: LandscapeSceneObject;

	private sky: Sky;
	private skySceneObject: SkySceneObject;

	private sceneObjects: SceneObject[];

	private projMatrix: number[];
	public camera: Camera;

	private gl: WebGLRenderingContext;
	private programLandscape: WebGLProgram;
	private programSky: WebGLProgram;
	private programObject: WebGLProgram;

	constructor(gl: WebGLRenderingContext, camera: Camera) {
		this.gl = gl;
		this.camera = camera;
		this.initScene();
		this.initSceneObjects();
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
			houseObj, <HTMLImageElement>document.getElementById("house_texture"));

		house.matrixes = {
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
			<HTMLImageElement>document.getElementById("cactus_texture")
		);

		cactus.matrixes = {
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
			<HTMLImageElement>document.getElementById("corsucant_texture")
		);

		corsucant.matrixes = {
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
			<HTMLImageElement>document.getElementById("corsucant_texture")
		);
		secondCorcusant.matrixes = {
			translation: [0.3, 0.3, -0.2],
			rotation: [0, 0, 0],
			scale: [1 / 20000, 1 / 20000, 1 / 20000]
		};
		this.sceneObjects.push(secondCorcusant);
	}

	public render() {
		const gl = this.gl;
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.enable(gl.CULL_FACE);

		this.skySceneObject.render();
		this.landscapeSceneObject.render();
		this.sceneObjects.forEach(sceneObject => sceneObject.render());
	}
}
