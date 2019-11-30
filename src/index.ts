import './assets/style/style.css';
import Camera from './graphic/camera';
import Scene from './graphic/scene';
import Walker from './graphic/walker';
import Controller from './graphic/controller';

document.addEventListener('DOMContentLoaded', () => {
	/** webgl canvas */
	const canvas = document.createElement('canvas') as HTMLCanvasElement;
	document.body.appendChild(canvas);
	canvas.width = document.body.clientWidth;
	canvas.height = document.body.clientHeight;
	canvas.tabIndex = 1;

	const gl = canvas.getContext('webgl');
	if (!gl) {
		throw new Error('Unnable to initialize WebGL. Please try to use another browser');
	}

	const camera = new Camera();
	const scene = new Scene(gl, camera);
	const walker = new Walker(gl, camera, scene);
	const controller = new Controller(canvas, walker);

	scene.beginRenderLoop();
});
