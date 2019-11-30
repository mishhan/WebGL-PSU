const express = require('express');
const path = require('path');

const port = process.env.PORT || 8080;
const app = express();
const appFolder = `${__dirname}/dist`;

app.use(express.static(appFolder));

app.get('*', (req, res) => {
	res.sendFile(path.resolve(appFolder, 'index.html'));
});

app.listen(port);
