export default abstract class GlElement {
	gl: WebGLRenderingContext;

	constructor(gl: WebGLRenderingContext) {
		this.gl = gl;
	}
}
