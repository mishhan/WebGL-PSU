import Landscape from "../models/landscape";
import math from "../math/math-extension";
import matrix4 from "../math/matrix4";

export default class Camera {
	private landscape: Landscape;
	private useQuaternion: boolean;

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
	private quaternionOrientation: {
		x: number;
		y: number;
		z: number;
		w: number;
	};

	constructor() {
		this.useQuaternion = false;
		this.tightBrayan = {
			yaw: 0,
			pitch: 0,
			roll: 0
		};
		this.heightUnder = 300;
		this.quaternionOrientation = {
			x: 0,
			y: 0,
			z: 0,
			w: 0
		};
	}

	public getViewMatrix(): number[] {
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
		);
	}

	public move(delta: number): void {
		if (!this.useQuaternion) {
			this.position.x += Math.sin(this.tightBrayan.yaw) * delta;
			this.position.z -= Math.cos(this.tightBrayan.yaw) * delta;
			this.position = this.landscape.constrain(this.position);
		}
	}

	public strafe(delta: number): void {
		if (!this.useQuaternion) {
			const a = this.tightBrayan.yaw - Math.PI / 2.0;
			this.position.x += Math.sin(a) * delta;
			this.position.z -= Math.cos(a) * delta;
			this.position = this.landscape.constrain(this.position);
		}
	}

	public yaw(angle: number): void {
		this.tightBrayan.yaw = math.wrap(this.tightBrayan.yaw - angle, 0, 2 * Math.PI);
	}

	public pitch(angle: number): void {
		this.tightBrayan.pitch = math.wrap(this.tightBrayan.pitch - angle, 0.0, 2.0 * Math.PI);
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
