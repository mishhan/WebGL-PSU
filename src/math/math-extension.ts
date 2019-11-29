export default class MathExtension {
	static wrap(a: number, min: number, max: number): number {
		a -= min;
		max -= min;
		if (max === 0) {
			return min;
		}
		a = MathExtension.fmod(a, max) + min;
		if (a < min) {
			a += max;
		}
		return a;
	}

	static fmod(a: number, b: number): number {
		return a - b * Math.floor(a / b);
	}
}
