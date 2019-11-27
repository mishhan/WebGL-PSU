export default class Vector {
	static subtract(a: number[], b: number[]): number[] {
		return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
	}

	static subtract2(a: number[], b: number[]): number[] {
		return [a[0] - b[0], a[1] - b[1]];
	}

	static add(a: number[], b: number[]): number[] {
		return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
	}

	static normalize(v: number[]): number[] {
		const length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
		if (length > 0.00001) {
			return [v[0] / length, v[1] / length, v[2] / length];
		} else {
			return [0, 0, 0];
		}
	}

	static cross(a: number[], b: number[]): number[] {
		return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
	}

	static dot(a: number[], b: number[]) {
		return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
	}

	static lengthVector(v: number[]): number {
		return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
	}

	static multiply(v: number[], c: number) {
		return [v[0] * c, v[1] * c, v[2] * c];
	}
}
