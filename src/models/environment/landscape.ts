import { vec3 } from 'gl-matrix';

export default class Landscape {
	private middleCoordinate: number;
	private xCount: number;
	private zCount: number;
	private vertexAttributeCount: number;
	private yCoordinateMultiplayer: number;
	private textureRepeatCount: number;

	private textureImageElement: string;
	private canvasHandlerElement: string;

	private vertex: number[];
	private index: number[];

	constructor() {
		this.middleCoordinate = 64;
		this.xCount = 128;
		this.zCount = 128;
		this.vertexAttributeCount = 8;
		this.yCoordinateMultiplayer = 0.2;
		this.textureRepeatCount = 32;

		this.textureImageElement = 'landscape';
		this.canvasHandlerElement = 'canvas-handler';

		this.vertex = [];
		this.index = [];

		this.createPolygon();
		this.createHeightMap();
		this.calculateNormals();
		this.calculateTextureCoordinates();
	}

	public getVertex(): number[] {
		return this.vertex;
	}

	public getIndex(): number[] {
		return this.index;
	}

	public getMatrixes() {
		return {
			translation: [-0.5, 0, -0.5],
			rotation: [0, 0, 0],
			scale: [
				2 / this.middleCoordinate,
				this.yCoordinateMultiplayer / 255,
				2 / this.middleCoordinate
			]
		};
	}

	public getSize() {
		return {
			x: this.xCount,
			y: 255 / this.yCoordinateMultiplayer,
			z: this.zCount
		};
	}

	public getLightPos(): number[] {
		return [0, 3, 0];
	}

	public constrain({ x, z }: { x: number; z: number }) {
		let xCoordinate, yCoordinate, zCoordinate;
		xCoordinate = x < 0.0 ? 0.0 : x;
		xCoordinate = x > this.xCount - 1 ? this.xCount - 1 : xCoordinate;

		zCoordinate = z < 0.0 ? 0.0 : z;
		zCoordinate = z > this.zCount - 1 ? this.zCount - 1 : zCoordinate;

		yCoordinate = this.getHeight(xCoordinate, zCoordinate);
		return {
			x: xCoordinate,
			y: yCoordinate,
			z: zCoordinate
		};
	}

	private createPolygon() {
		const xStep = Math.ceil((2 * this.middleCoordinate) / this.xCount);
		const zStep = Math.ceil((2 * this.middleCoordinate) / this.zCount);
		let i, j;
		for (i = 0; i <= this.xCount; i++) {
			for (j = 0; j <= this.zCount; j++) {
				//vertex coordinates
				this.vertex.push(i * xStep);
				this.vertex.push(0);
				this.vertex.push(j * zStep);

				//normales
				this.vertex.push(0);
				this.vertex.push(0);
				this.vertex.push(0);

				//texture coordinates
				this.vertex.push(0);
				this.vertex.push(0);
			}
		}

		for (i = 0; i < this.xCount - 1; i++) {
			for (j = 0; j < this.zCount - 1; j++) {
				this.index.push(i * (this.xCount + 1) + j);
				this.index.push(i * (this.xCount + 1) + j + 1);
				this.index.push((i + 1) * (this.xCount + 1) + j);

				this.index.push((i + 1) * (this.xCount + 1) + j);
				this.index.push(i * (this.xCount + 1) + j + 1);
				this.index.push((i + 1) * (this.xCount + 1) + j + 1);
			}
		}
	}

	private createHeightMap() {
		const canvas = <HTMLCanvasElement>document.getElementById(this.canvasHandlerElement);
		const context = canvas.getContext('2d');
		const img = <HTMLImageElement>document.getElementById(this.textureImageElement);
		canvas.width = img.width;
		canvas.height = img.height;
		context.drawImage(img, 0, 0);

		let i, yIndex, xCoordinate, zCoordinate, yCoordinate, contextData;
		for (i = 0; i < this.vertex.length / this.vertexAttributeCount; i++) {
			yIndex = this.vertexAttributeCount * i + 1;

			xCoordinate = this.vertex[yIndex - 1];
			zCoordinate = this.vertex[yIndex + 1];

			contextData = context.getImageData(xCoordinate, zCoordinate, 1, 1).data;
			yCoordinate = (contextData[0] + contextData[1] + contextData[2]) / 3;
			this.vertex[yIndex] = yCoordinate;
		}
	}

	private calculateNormals() {
		let i,
			indexVertice1,
			indexVertice2,
			indexVertice3,
			indexVertice1Vertice,
			indexVertice2Vertice,
			indexVertice3Vertice,
			vec1,
			vec2;

		const vertexAttributeCount = this.vertexAttributeCount;

		for (i = 0; i < this.index.length / 3; i++) {
			indexVertice1 = this.index[i * 3];
			indexVertice2 = this.index[i * 3 + 1];
			indexVertice3 = this.index[i * 3 + 2];

			indexVertice1Vertice = indexVertice1 * vertexAttributeCount;
			indexVertice2Vertice = indexVertice2 * vertexAttributeCount;
			indexVertice3Vertice = indexVertice3 * vertexAttributeCount;

			const vertice1 = vec3.fromValues(
				this.vertex[indexVertice1Vertice],
				this.vertex[indexVertice1Vertice + 1],
				this.vertex[indexVertice1Vertice + 2]
			);
			const vertice2 = vec3.fromValues(
				this.vertex[indexVertice2Vertice],
				this.vertex[indexVertice2Vertice + 1],
				this.vertex[indexVertice2Vertice + 2]
			);
			const vertice3 = vec3.fromValues(
				this.vertex[indexVertice3Vertice],
				this.vertex[indexVertice3Vertice + 1],
				this.vertex[indexVertice3Vertice + 2]
			);

			vec1 = vec3.create();
			vec3.subtract(vec1, vertice2, vertice1);

			vec2 = vec3.create();
			vec3.subtract(vec2, vertice3, vertice2);

			const c = vec3.create();
			vec3.cross(c, vec1, vec2);

			const normalizedC = vec3.create();
			vec3.normalize(normalizedC, c);

			this.vertex[indexVertice1 * vertexAttributeCount + 3] += normalizedC[0];
			this.vertex[indexVertice1 * vertexAttributeCount + 4] += normalizedC[1];
			this.vertex[indexVertice1 * vertexAttributeCount + 5] += normalizedC[2];

			this.vertex[indexVertice2 * vertexAttributeCount + 3] += normalizedC[0];
			this.vertex[indexVertice2 * vertexAttributeCount + 4] += normalizedC[1];
			this.vertex[indexVertice2 * vertexAttributeCount + 5] += normalizedC[2];

			this.vertex[indexVertice3 * vertexAttributeCount + 3] += normalizedC[0];
			this.vertex[indexVertice3 * vertexAttributeCount + 4] += normalizedC[1];
			this.vertex[indexVertice3 * vertexAttributeCount + 5] += normalizedC[2];
		}
	}

	private calculateTextureCoordinates() {
		let i, u, v, yIndex, xCoordinate, zCoordinate;
		for (i = 0; i < this.vertex.length / this.vertexAttributeCount; i++) {
			yIndex = this.vertexAttributeCount * i + 1;

			xCoordinate = this.vertex[yIndex - 1];
			zCoordinate = this.vertex[yIndex + 1];

			u = (this.textureRepeatCount * xCoordinate) / this.xCount;
			v = (this.textureRepeatCount * zCoordinate) / this.zCount;

			this.vertex[yIndex + 5] = u;
			this.vertex[yIndex + 6] = v;
		}
	}

	private getHeight(xCoordinate: number, zCoordinate: number) {
		let i = Math.trunc(zCoordinate);
		let j = Math.trunc(xCoordinate);
		let fi = zCoordinate - i;
		let fj = xCoordinate - j;
		let nfi = 1.0 - fi;
		let nfj = 1.0 - fj;
		let height =
			(this.heightAt(i, j) * nfi + this.heightAt(i + 1, j) * fi) * nfj +
			(this.heightAt(i, j + 1) * nfi + this.heightAt(i + 1, j + 1) * fi) * fj;
		return height;
	}

	private heightAt(xCoordinate: number, zCoordinate: number) {
		let yIndex;
		for (let i = 0; i < this.vertex.length / this.vertexAttributeCount; i++) {
			yIndex = this.vertexAttributeCount * i + 1;
			if (xCoordinate === this.vertex[yIndex - 1] && zCoordinate === this.vertex[yIndex + 1]) {
				return this.vertex[yIndex];
			}
		}
		return 0;
	}
}
