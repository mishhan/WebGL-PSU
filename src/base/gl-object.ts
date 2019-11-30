import GlElement from './gl-element';
import { createProgramFromScripts } from '../utils/utils';

export default abstract class GLObject extends GlElement {
	program: WebGLProgram;

	isTurnable: boolean;
	id: number;

	constructor(gl: WebGLRenderingContext) {
		super(gl);
		this.program = createProgramFromScripts(gl, this.getVS(), this.getFS());
	}

	abstract getVS(): string;
	abstract getFS(): string;

	getPrimitiveType(): number {
		return this.gl.TRIANGLES;
	}
}
