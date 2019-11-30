/* eslint-disable no-use-before-define */
/* eslint-disable no-console */
/* eslint-disable no-constant-condition */
const http = require("http");
const ws = require("ws");

const wss = new ws.Server({ noServer: true });

function accept(req) {
	wss.handleUpgrade(req, req.socket, Buffer.alloc(0), onConnect);
}

function onConnect(ws) {
	setInterval(() => {
		const quaternion = [Math.random(), Math.random(), Math.random(), Math.random()];
		const strQuaternion = JSON.stringify(quaternion);
		console.log(`sendind ${strQuaternion} to client`);
		ws.send(strQuaternion);
	}, 200);
}

http.createServer(accept).listen(8080);
