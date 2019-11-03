import Camera from "./graphic/camera";
import angle from "./math/angle";

export default class Controller {
	private camera: Camera;
	private canvas: HTMLCanvasElement;

	constructor(camera: Camera, canvas: HTMLCanvasElement) {
		this.camera = camera;
		this.canvas = canvas;

		this.initListeners();
	}

	private initListeners() {
		/* keyboard */
		this.canvas.addEventListener("keydown", (event: KeyboardEvent) => {
			if (event.code === "KeyW") {
				this.camera.move(1);
			}
			if (event.code === "KeyS") {
				this.camera.move(-1);
			}
			if (event.code === "KeyA") {
				this.camera.strafe(1);
			}
			if (event.code === "KeyD") {
				this.camera.strafe(-1);
			}
		});

		/* mouse */
		let oldX: number, oldY: number, isDown: boolean;
		this.canvas.addEventListener("mousedown", (event: MouseEvent) => {
			oldX = event.offsetX;
			oldY = event.offsetY;
			isDown = true;
		});

		this.canvas.addEventListener("mousemove", (event: MouseEvent) => {
			if (isDown) {
				this.camera.yaw(angle.degToRad((oldX - event.offsetX) * 2));
				this.camera.pitch(angle.degToRad((oldY - event.offsetY) * 2));
			}
			oldX = event.offsetX;
			oldY = event.offsetY;
		});

		this.canvas.addEventListener("mouseup", () => {
			isDown = false;
		});

		/* resize */
		window.addEventListener("resize", (event: UIEvent) => {
			this.canvas.width = document.getElementById("body").clientWidth;
			this.canvas.height = document.getElementById("body").clientHeight;
		});
	}
}
