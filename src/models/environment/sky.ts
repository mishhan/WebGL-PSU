export default class Sky {
	private vertex: number[];
	private index: number[];

	public getVertex(): number[] {
		return this.vertex;
	}

	public getIndex(): number[] {
		return this.index;
	}

	constructor() {
		// prettier-ignore
		this.vertex = [
			-1.0, -1.0, 1.0,
			1.0, -1.0, 1.0,
			1.0, 1.0, 1.0,
			-1.0, 1.0, 1.0,
			-1.0, -1.0, -1.0,
			1.0, -1.0, -1.0,
			1.0, 1.0, -1.0,
			-1.0, 1.0, -1.0
		];
		// prettier-ignore
		this.index = [
			0, 3, 1,
			1, 3, 2,
			0, 4, 7,
			7, 3, 0,
			1, 2, 6,
			6, 5, 1,
			5, 6, 7,
			7, 4, 5,
			3, 7, 6,
			6, 2, 3,
			0, 1, 5,
			5, 4, 0
		];
	}
}
