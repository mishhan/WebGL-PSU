import vector from "./vector";

export default class Matrix4 {
	static projection(width: number, height: number, depth: number): number[] {
		// prettier-ignore
		return [
      2 / width, 0, 0, 0,
      0, -2 / height, 0, 0,
      0, 0, 2 / depth, 0, 
      -1, 1, 0, 1
    ];
	}

	static orthographic(
		left: number,
		right: number,
		bottom: number,
		top: number,
		near: number,
		far: number
	): number[] {
		// prettier-ignore
		return [
			2 / (right - left), 0, 0, 0,
			0, 2 / (top - bottom), 0, 0,
			0, 0, 2 / (near - far), 0,
			(left + right) / (left - right), (bottom + top) / (bottom - top), (near + far) / (near - far), 1
		];
	}

	static perspective(
		fieldOfViewInRadians: number,
		aspect: number,
		near: number,
		far: number
	): number[] {
		const f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
		const rangeInv = 1.0 / (near - far);
		// prettier-ignore
		return [
			f / aspect, 0, 0, 0,
			0, f, 0, 0,
			0, 0, (near + far) * rangeInv, -1,
			0, 0, near * far * rangeInv * 2, 0
		];
	}

	static lookAt(cameraPosition: number[], target: number[], up: number[]): number[] {
		if (up == undefined) {
			up = [0, 1, 0];
		}

		const zAxis = vector.normalize(
			vector.subtract([cameraPosition[0], cameraPosition[1], cameraPosition[2]], target)
		);
		const xAxis = vector.normalize(vector.cross(up, zAxis));
		const yAxis = vector.normalize(vector.cross(zAxis, xAxis));
		// prettier-ignore
		return [
			xAxis[0], xAxis[1], xAxis[2], 0,
			yAxis[0], yAxis[1], yAxis[2], 0,
			zAxis[0], zAxis[1], zAxis[2], 0,
			cameraPosition[0], cameraPosition[1], cameraPosition[2], 1
		];
	}

	static identity(): number[] {
		// prettier-ignore
		return [
      1, 0, 0, 0, 
      0, 1, 0, 0, 
      0, 0, 1, 0, 
      0, 0, 0, 1
    ];
	}

	static multiply(a: number[], b: number[]): number[] {
		const a00 = a[0 * 4 + 0];
		const a01 = a[0 * 4 + 1];
		const a02 = a[0 * 4 + 2];
		const a03 = a[0 * 4 + 3];
		const a10 = a[1 * 4 + 0];
		const a11 = a[1 * 4 + 1];
		const a12 = a[1 * 4 + 2];
		const a13 = a[1 * 4 + 3];
		const a20 = a[2 * 4 + 0];
		const a21 = a[2 * 4 + 1];
		const a22 = a[2 * 4 + 2];
		const a23 = a[2 * 4 + 3];
		const a30 = a[3 * 4 + 0];
		const a31 = a[3 * 4 + 1];
		const a32 = a[3 * 4 + 2];
		const a33 = a[3 * 4 + 3];
		const b00 = b[0 * 4 + 0];
		const b01 = b[0 * 4 + 1];
		const b02 = b[0 * 4 + 2];
		const b03 = b[0 * 4 + 3];
		const b10 = b[1 * 4 + 0];
		const b11 = b[1 * 4 + 1];
		const b12 = b[1 * 4 + 2];
		const b13 = b[1 * 4 + 3];
		const b20 = b[2 * 4 + 0];
		const b21 = b[2 * 4 + 1];
		const b22 = b[2 * 4 + 2];
		const b23 = b[2 * 4 + 3];
		const b30 = b[3 * 4 + 0];
		const b31 = b[3 * 4 + 1];
		const b32 = b[3 * 4 + 2];
		const b33 = b[3 * 4 + 3];

		return [
			b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
			b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
			b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
			b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
			b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
			b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
			b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
			b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
			b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
			b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
			b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
			b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
			b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
			b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
			b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
			b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33
		];
	}

	static inverse(m: number[]): number[] {
		const m00 = m[0 * 4 + 0];
		const m01 = m[0 * 4 + 1];
		const m02 = m[0 * 4 + 2];
		const m03 = m[0 * 4 + 3];
		const m10 = m[1 * 4 + 0];
		const m11 = m[1 * 4 + 1];
		const m12 = m[1 * 4 + 2];
		const m13 = m[1 * 4 + 3];
		const m20 = m[2 * 4 + 0];
		const m21 = m[2 * 4 + 1];
		const m22 = m[2 * 4 + 2];
		const m23 = m[2 * 4 + 3];
		const m30 = m[3 * 4 + 0];
		const m31 = m[3 * 4 + 1];
		const m32 = m[3 * 4 + 2];
		const m33 = m[3 * 4 + 3];
		const tmp_0 = m22 * m33;
		const tmp_1 = m32 * m23;
		const tmp_2 = m12 * m33;
		const tmp_3 = m32 * m13;
		const tmp_4 = m12 * m23;
		const tmp_5 = m22 * m13;
		const tmp_6 = m02 * m33;
		const tmp_7 = m32 * m03;
		const tmp_8 = m02 * m23;
		const tmp_9 = m22 * m03;
		const tmp_10 = m02 * m13;
		const tmp_11 = m12 * m03;
		const tmp_12 = m20 * m31;
		const tmp_13 = m30 * m21;
		const tmp_14 = m10 * m31;
		const tmp_15 = m30 * m11;
		const tmp_16 = m10 * m21;
		const tmp_17 = m20 * m11;
		const tmp_18 = m00 * m31;
		const tmp_19 = m30 * m01;
		const tmp_20 = m00 * m21;
		const tmp_21 = m20 * m01;
		const tmp_22 = m00 * m11;
		const tmp_23 = m10 * m01;

		const t0 = tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31 - (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
		const t1 = tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31 - (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
		const t2 =
			tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31 - (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
		const t3 =
			tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21 - (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);

		const d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);

		return [
			d * t0,
			d * t1,
			d * t2,
			d * t3,
			d * (tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30 - (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30)),
			d * (tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30 - (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30)),
			d * (tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30 - (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30)),
			d * (tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20 - (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20)),
			d *
				(tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33 - (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33)),
			d *
				(tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33 - (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33)),
			d *
				(tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33 - (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33)),
			d *
				(tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23 - (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23)),
			d *
				(tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12 - (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22)),
			d *
				(tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22 - (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02)),
			d *
				(tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02 - (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12)),
			d *
				(tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12 - (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02))
		];
	}

	static transpose(m: number[]): number[] {
		const res = m;
		for (let i = 0; i < 4; i++) {
			for (let j = i + 1; j < 4; j++) {
				let temp = m[j * 4 + i];
				m[j * 4 + i] = m[i * 4 + j];
				m[i * 4 + j] = temp;
			}
		}
		return res;
	}

	static vectorMultiply(v: number[], m: number[]): number[] {
		let dst = [];
		for (let i = 0; i < 4; ++i) {
			dst[i] = 0.0;
			for (let j = 0; j < 4; ++j) {
				dst[i] += v[j] * m[j * 4 + i];
			}
		}
		return dst;
	}

	static translation(tx: number, ty: number, tz: number): number[] {
		// prettier-ignore
		return [
      1, 0, 0, 0, 
      0, 1, 0, 0, 
      0, 0, 1, 0, 
      tx, ty, tz, 1
    ];
	}

	static xRotation(angleInRadians: number): number[] {
		const c = Math.cos(angleInRadians);
		const s = Math.sin(angleInRadians);
		// prettier-ignore
		return [
      1, 0, 0, 0, 
      0, c, s, 0, 
      0, -s, c, 0, 
      0, 0, 0, 1
    ];
	}

	static yRotation(angleInRadians: number): number[] {
		const c = Math.cos(angleInRadians);
		const s = Math.sin(angleInRadians);
		// prettier-ignore
		return [
      c, 0, -s, 0, 
      0, 1, 0, 0, 
      s, 0, c, 0, 
      0, 0, 0, 1
    ];
	}

	static zRotation(angleInRadians: number): number[] {
		const c = Math.cos(angleInRadians);
		const s = Math.sin(angleInRadians);
		// prettier-ignore
		return [
      c, s, 0, 0, 
      -s, c, 0, 0, 
      0, 0, 1, 0, 
      0, 0, 0, 1
    ];
	}

	static rotation(
		angleInRadiansX: number,
		angleInRadiansY: number,
		angleInRadiansZ: number
	): number[] {
		let m = Matrix4.multiply(
			Matrix4.xRotation(angleInRadiansX),
			Matrix4.yRotation(angleInRadiansY)
		);
		return Matrix4.multiply(m, Matrix4.zRotation(angleInRadiansZ));
	}

	static fromRotation(rad: number, axis: number[]): number[] {
		let x = axis[0],
			y = axis[1],
			z = axis[2];
		let len = Math.hypot(x, y, z);
		let s, c, t;
		let out: number[] = [].fill(0, 0, 15);
		len = 1 / len;
		x *= len;
		y *= len;
		z *= len;
		s = Math.sin(rad);
		c = Math.cos(rad);
		t = 1 - c;
		// Perform rotation-specific matrix multiplication
		out[0] = x * x * t + c;
		out[1] = y * x * t + z * s;
		out[2] = z * x * t - y * s;
		out[3] = 0;
		out[4] = x * y * t - z * s;
		out[5] = y * y * t + c;
		out[6] = z * y * t + x * s;
		out[7] = 0;
		out[8] = x * z * t + y * s;
		out[9] = y * z * t - x * s;
		out[10] = z * z * t + c;
		out[11] = 0;
		out[12] = 0;
		out[13] = 0;
		out[14] = 0;
		out[15] = 1;
		return out;
	}

	static fromQuat(q: number[]): number[] {
		let out: number[] = [].fill(0, 0, 15);
		let x = q[0],
			y = q[1],
			z = q[2],
			w = q[3];
		let x2 = x + x;
		let y2 = y + y;
		let z2 = z + z;
		let xx = x * x2;
		let yx = y * x2;
		let yy = y * y2;
		let zx = z * x2;
		let zy = z * y2;
		let zz = z * z2;
		let wx = w * x2;
		let wy = w * y2;
		let wz = w * z2;
		out[0] = 1 - yy - zz;
		out[1] = yx + wz;
		out[2] = zx - wy;
		out[3] = 0;
		out[4] = yx - wz;
		out[5] = 1 - xx - zz;
		out[6] = zy + wx;
		out[7] = 0;
		out[8] = zx + wy;
		out[9] = zy - wx;
		out[10] = 1 - xx - yy;
		out[11] = 0;
		out[12] = 0;
		out[13] = 0;
		out[14] = 0;
		out[15] = 1;
		return out;
	}

	static scaling(sx: number, sy: number, sz: number): number[] {
		// prettier-ignore
		return [
      sx, 0, 0, 0, 
      0, sy, 0, 0, 
      0, 0, sz, 0, 
      0, 0, 0, 1
    ];
	}

	static translate(m: number[], tx: number, ty: number, tz: number): number[] {
		return Matrix4.multiply(m, Matrix4.translation(tx, ty, tz));
	}

	static xRotate(m: number[], angleInRadians: number): number[] {
		return Matrix4.multiply(m, Matrix4.xRotation(angleInRadians));
	}

	static yRotate(m: number[], angleInRadians: number): number[] {
		return Matrix4.multiply(m, Matrix4.yRotation(angleInRadians));
	}

	static zRotate(m: number[], angleInRadians: number): number[] {
		return Matrix4.multiply(m, Matrix4.zRotation(angleInRadians));
	}

	static rotate(
		m: number[],
		angleInRadiansX: number,
		angleInRadiansY: number,
		angleInRadiansZ: number
	): number[] {
		let temp = m;
		temp = Matrix4.xRotate(temp, angleInRadiansX);
		temp = Matrix4.yRotate(temp, angleInRadiansY);
		temp = Matrix4.zRotate(temp, angleInRadiansZ);
		return temp;
	}

	static scale(m: number[], sx: number, sy: number, sz: number): number[] {
		return Matrix4.multiply(m, Matrix4.scaling(sx, sy, sz));
	}
}
