import webglUtils from "../utils/webglUtils";
import SceneObject from "../models/scene-object";
import ReliefSceneObject from "../models/relief-scene-object";
import Camera from "../graphic/camera";

import houseObj from "../models/house/house-obj";
import cactusObj from "../models/cactus/cactus-obj";
import corsucantObj from "../models/corsucant/corsucant-obj";
import characterObj from "../models/character/character-obj";
// @ts-ignore
import houseImage from "../models/house/house.jpg";
// @ts-ignore
import houseReliefImage from "../models/house/house_normal.jpg";
// @ts-ignore
import cactusImage from "../models/cactus/cactus.jpg";
// @ts-ignore
import corsucantImage from "../models/corsucant/corsucant.jpg";
// @ts-ignore
import characterImage from "../models/character/character.jpg";

export default class SceneInitializer {
	private sceneObjects: (SceneObject | ReliefSceneObject)[];

	private projMatrix: number[];
	private camera: Camera;

	private gl: WebGLRenderingContext;
	private programObject: WebGLProgram;
	private programReliefObject: WebGLProgram;

	public get SceneObjects(): any[] {
		return this.sceneObjects;
	}

	constructor(gl: WebGLRenderingContext, camera: Camera, projMatrix: number[]) {
		this.gl = gl;
		this.camera = camera;
		this.projMatrix = projMatrix;

		this.programObject = webglUtils.createProgramFromScripts(gl, [
			"object-vertex-shader",
			"object-fragment-shader"
		]);

		/*
		this.programReliefObject = webglUtils.createProgramFromScripts(gl, [
			"relief-object-vertex-shader",
			"relief-object-fragment-shader"
		]);
		*/

		this.sceneObjects = [];

		this.initSceneObjects();
	}

	private initSceneObjects() {
		/*
		const house = new ReliefSceneObject(
			this.gl,
			this.programReliefObject,
			this.camera,
			this.projMatrix,
			houseObj,
			houseImage,
			houseReliefImage
		);
		*/
		const house = new SceneObject(
			this.gl,
			this.programObject,
			this.camera,
			this.projMatrix,
			houseObj,
			houseImage
		);

		house.Matrixes = {
			translation: [0.5, 0.22, 0.5],
			rotation: [0, 0, 0],
			scale: [1 / 50, 1 / 50, 1 / 50]
		};
		this.sceneObjects.push(house);

		for (let i = 0; i < 5; i++) {
			const cactus = new SceneObject(
				this.gl,
				this.programObject,
				this.camera,
				this.projMatrix,
				cactusObj,
				cactusImage
			);
			cactus.Matrixes = {
				translation: [-0.5 + i * 0.1, 0.1, -0.5],
				rotation: [0, 0, 0],
				scale: [1 / 300, 1 / 300, 1 / 300].map(item => item * (i + 1))
			};

			this.sceneObjects.push(cactus);
		}

		for (let i = 0; i < 3; i++) {
			const corsucant = new SceneObject(
				this.gl,
				this.programObject,
				this.camera,
				this.projMatrix,
				corsucantObj,
				corsucantImage,
				true
			);
			corsucant.Matrixes = {
				translation: [0.1 + i * 0.1, 0.3, -0.1],
				rotation: [0, 0, 0],
				scale: [1 / 10000, 1 / 10000, 1 / 10000].map(item => item * (i + 1))
			};
			this.sceneObjects.push(corsucant);
		}

		const character = new SceneObject(
			this.gl,
			this.programObject,
			this.camera,
			this.projMatrix,
			characterObj,
			characterImage
		);
		character.Matrixes = {
			translation: [0.8, 0.1, 0.8],
			rotation: [0, 180, 0],
			scale: [1 / 10, 1 / 10, 1 / 10]
		};
		this.sceneObjects.push(character);
	}
}
