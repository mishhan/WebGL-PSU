import Camera from './camera';
import Scene from './scene';
import SceneObject from '../scene/scene-object';

export default class Walker {
	private gl: WebGLRenderingContext;
	private camera: Camera;
	private scene: Scene;

	private isObjectCatched: boolean;
	private catchedObject: SceneObject;

	constructor(gl: WebGLRenderingContext, camera: Camera, scene: Scene) {
		this.gl = gl;
		this.camera = camera;
		this.scene = scene;
		this.isObjectCatched = false;
	}

	public move(delta: number): void {
		this.camera.move(delta);
	}

	public strafe(delta: number): void {
		this.camera.strafe(delta);
	}

	public yaw(angle: number): void {
		this.camera.yaw(angle);
	}

	public pitch(angle: number): void {
		this.camera.pitch(angle);
	}

	public rotateCatchedObject(angleX: number, angleY: number): void {
		this.catchedObject.rotate(angleX, angleY);
	}

	public rotateWonderfulObject(quaternion: any): void {
		this.scene.WonderfulObject.IsCatched = true;
		const vrQuaternion = [quaternion[1], -quaternion[2], quaternion[0], quaternion[3]];
		this.scene.WonderfulObject.rotateQ(vrQuaternion);
	}

	public tryCatch(xCoordinate: number, yCoordinate: number): boolean {
		this.scene.fakeRender();
		const catchedColor = new Uint8Array(4);
		this.gl.readPixels(
			xCoordinate,
			yCoordinate,
			1,
			1,
			this.gl.RGBA,
			this.gl.UNSIGNED_BYTE,
			catchedColor
		);
		const key = catchedColor[0] + catchedColor[1] * 255 + catchedColor[2] * (255 * 255);
		const catchedObject = this.scene.ColorTable.get(key);
		if (catchedObject) {
			//catch uncatch logic
			catchedObject.IsCatched = !catchedObject.IsCatched;
			this.isObjectCatched = !this.isObjectCatched;
			this.catchedObject = this.isObjectCatched ? catchedObject : null;
			return this.isObjectCatched;
		}
		return false;
	}
}
