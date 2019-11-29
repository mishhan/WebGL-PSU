import Scene from "./scene";
import Controller from "./controller";
import Camera from "./camera";
import Walker from "./walker";

export default class Render {
	private scene: Scene;
	private camera: Camera;
	private walker: Walker;

	private canvas: HTMLCanvasElement;
	private gl: WebGLRenderingContext;

	constructor() {
		this.init();

		this.camera = new Camera();
		this.scene = new Scene(this.gl, this.camera);
		this.walker = new Walker(this.gl, this.camera, this.scene);
		new Controller(this.canvas, this.walker);
	}

	private init() {
		this.canvas = <HTMLCanvasElement>document.getElementById("canvas");

		this.canvas.width = document.getElementById("body").clientWidth;
		this.canvas.height = document.getElementById("body").clientHeight;

		this.gl = this.canvas.getContext("webgl");
		if (!this.gl) {
			throw Error(`Browser doesn't support WebGL`);
		}
	}

	public render() {
		this.scene.render();
		requestAnimationFrame(this.render.bind(this));
	}
}
