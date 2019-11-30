import Landscape from '../models/environment/landscape';
import { wrap } from '../utils/utils';
import { mat4, vec3 } from 'gl-matrix';

export default class Camera {
	private landscape: Landscape;

	private heightUnder: number;
	private position: {
		x: number;
		y: number;
		z: number;
	};

	private tightBrayan: {
		yaw: number;
		pitch: number;
		roll: number;
	};

	constructor() {
		this.tightBrayan = {
			yaw: 0,
			pitch: 0,
			roll: 0
		};
		this.heightUnder = 300;
	}

	public getViewMatrix(): mat4 {
		const translatedPos = mat4.create();
		mat4.translate(
			translatedPos,
			translatedPos,
			vec3.fromValues(
				-this.position.x / this.landscape.getSize().x,
				-(this.position.y + this.heightUnder) / this.landscape.getSize().y,
				-this.position.z / this.landscape.getSize().z
			)
		);

		const rotatedMatrix = mat4.create();
		mat4.rotateZ(rotatedMatrix, rotatedMatrix, this.tightBrayan.roll);
		mat4.rotateX(rotatedMatrix, rotatedMatrix, this.tightBrayan.pitch);
		mat4.rotateY(rotatedMatrix, rotatedMatrix, this.tightBrayan.yaw);

		const result = mat4.create();
		mat4.multiply(result, rotatedMatrix, translatedPos);
		return result;
		/*
		return matrix4.multiply(
			matrix4.multiply(
				matrix4.multiply(
					matrix4.zRotation(this.tightBrayan.roll),
					matrix4.xRotation(this.tightBrayan.pitch)
				),
				matrix4.yRotation(this.tightBrayan.yaw)
			),
			matrix4.translation(
				-this.position.x / this.landscape.getSize().x,
				-(this.position.y + this.heightUnder) / this.landscape.getSize().y,
				-this.position.z / this.landscape.getSize().z
			)
		);*/
	}

	public move(delta: number): void {
		this.position.x += Math.sin(this.tightBrayan.yaw) * delta;
		this.position.z -= Math.cos(this.tightBrayan.yaw) * delta;
		this.position = this.landscape.constrain(this.position);
	}

	public strafe(delta: number): void {
		const a = this.tightBrayan.yaw - Math.PI / 2.0;
		this.position.x += Math.sin(a) * delta;
		this.position.z -= Math.cos(a) * delta;
		this.position = this.landscape.constrain(this.position);
	}

	public yaw(angle: number): void {
		this.tightBrayan.yaw = wrap(this.tightBrayan.yaw - angle, 0, 2 * Math.PI);
	}

	public pitch(angle: number): void {
		this.tightBrayan.pitch = wrap(this.tightBrayan.pitch - angle, 0.0, 2.0 * Math.PI);
	}

	public set Landscape(landscape: Landscape) {
		this.landscape = landscape;
	}

	public initPosition() {
		this.position = {
			x: 0,
			y: 0,
			z: 0
		};
		this.position.x = 8;
		this.position.z = 8;
		this.position = this.landscape.constrain(this.position);
	}
}
