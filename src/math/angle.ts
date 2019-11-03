export default class Angle {
	static degToRad(degree: number) {
		return (degree * Math.PI) / 180;
	}

	static radToDeg(radian: number) {
		return (radian * 180) / Math.PI;
	}
}
