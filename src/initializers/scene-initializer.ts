import GlElement from '../base/gl-element';
import SceneObject from '../scene/scene-object';
import ReliefCubeSceneObject from '../scene/relief-cube-scene-object';
import Camera from '../graphic/camera';
import Cube from '../models/cube/cube';
import { mat4 } from 'gl-matrix';
import houseObj from '../models/house/house-obj';
import cactusObj from '../models/cactus/cactus-obj';
import corsucantObj from '../models/corsucant/corsucant-obj';
import characterObj from '../models/character/character-obj';

// @ts-ignore
import cubeImage from '../models/cube/cube.jpg';
// @ts-ignore
import cubeReliefImage from '../models/cube/cube_normal.jpg';
// @ts-ignore
import houseImage from '../models/house/house.jpg';
// @ts-ignore
import cactusImage from '../models/cactus/cactus.jpg';
// @ts-ignore
import corsucantImage from '../models/corsucant/corsucant.jpg';
// @ts-ignore
import characterImage from '../models/character/character.jpg';

export default class SceneInitializer extends GlElement {
	private sceneObjects: (SceneObject | ReliefCubeSceneObject)[];

	private projMatrix: mat4;
	private camera: Camera;

	public get SceneObjects(): any[] {
		return this.sceneObjects;
	}

	constructor(gl: WebGLRenderingContext, camera: Camera, projMatrix: mat4) {
		super(gl);

		this.camera = camera;
		this.projMatrix = projMatrix;
		this.sceneObjects = [];
		this.initSceneObjects();
	}

	private initSceneObjects() {
		const firstHouse = new SceneObject(this.gl, this.camera, this.projMatrix, houseObj, houseImage);
		firstHouse.Matrixes = {
			translation: [0.5, 0.25, 0.5],
			rotation: [0, 0, 0],
			scale: [1 / 100, 1 / 100, 1 / 100]
		};
		this.sceneObjects.push(firstHouse);

		const secondHouse = new SceneObject(
			this.gl,
			this.camera,
			this.projMatrix,
			houseObj,
			houseImage
		);
		secondHouse.Matrixes = {
			translation: [0.5, 0.25, 0.25],
			rotation: [0, 0, 0],
			scale: [1 / 100, 1 / 100, 1 / 100]
		};
		this.sceneObjects.push(secondHouse);

		for (let i = 0; i < 5; i++) {
			const cactus = new SceneObject(
				this.gl,
				this.camera,
				this.projMatrix,
				cactusObj,
				cactusImage,
				true
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

		const cube = new Cube();
		const cubeObject = new ReliefCubeSceneObject(
			this.gl,
			this.camera,
			this.projMatrix,
			cube,
			cubeImage,
			cubeReliefImage,
			true
		);
		cubeObject.Matrixes = {
			translation: [0.2, 0.2, 0.2],
			rotation: [0, 0, 0],
			scale: [1 / 10, 1 / 10, 1 / 10]
		};
		this.sceneObjects.push(cubeObject);
	}
}
