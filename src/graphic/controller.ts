import angle from "../math/angle";
import Walker from "./walker";

export default class Controller {
	private walker: Walker;
	private canvas: HTMLCanvasElement;

	constructor(canvas: HTMLCanvasElement, walker: Walker) {
		this.canvas = canvas;
		this.walker = walker;

		this.initListeners();
	}

	private initListeners() {
		/* keyboard */
		this.canvas.addEventListener("keydown", (event: KeyboardEvent) => {
			switch (event.code) {
				case "KeyW":
					this.walker.move(1);
					break;
				case "KeyS":
					this.walker.move(-1);
					break;
				case "KeyA":
					this.walker.strafe(1);
					break;
				case "KeyD":
					this.walker.strafe(-1);
					break;
			}
		});

		/* mouse */
		let oldX: number, oldY: number, isDown: boolean, isCatched: Boolean;
		this.canvas.addEventListener("mousedown", (event: MouseEvent) => {
			oldX = event.offsetX;
			oldY = event.offsetY;
			isDown = true;

			isCatched = this.walker.tryCatch(event.clientX, event.clientY);
		});

		this.canvas.addEventListener("mousemove", (event: MouseEvent) => {
			if (isDown) {
				this.walker.yaw(angle.degToRad((oldX - event.offsetX) * 2));
				this.walker.pitch(angle.degToRad((oldY - event.offsetY) * 2));
			}
			if (isCatched) {
				this.walker.rotateCatchedObject(
					angle.degToRad((oldX - event.offsetX) * 2),
					angle.degToRad((oldY - event.offsetY) * 2)
				);
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
