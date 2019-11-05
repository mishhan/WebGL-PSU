import Scene from "./scene";
import Controller from "../controller";
import Camera from "./camera";

export default class Render {
	private scene: Scene;
	private controller: Controller;
	private camera: Camera;

	canvasContainer: string;
	canvasElement: string;
	canvas: HTMLCanvasElement;
	gl: WebGLRenderingContext;

	constructor() {
		this.init();

		this.camera = new Camera();
		this.controller = new Controller(this.camera, this.canvas);
		this.scene = new Scene(this.gl, this.camera);
	}

	private init() {
		this.canvasElement = "canvas";
		this.canvasContainer = "body";
		this.canvas = <HTMLCanvasElement>document.getElementById(this.canvasElement);

		this.canvas.width = document.getElementById("body").clientWidth;
		this.canvas.height = document.getElementById("body").clientHeight;

		this.gl = this.canvas.getContext("webgl");
		if (!this.gl) {
			throw Error(`Browser doesn't support WebGL`);
		}
		const gl = this.gl;
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	}

	public render() {
		this.scene.render();
		requestAnimationFrame(this.render.bind(this));
	}
}
