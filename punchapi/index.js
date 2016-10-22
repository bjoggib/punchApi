const express = require("express");
const myDb = "localhost/app";
const mongoose = require("mongoose");
const api = require('./api');
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:false }));
app.use("/api", api);

mongoose.connect(myDb);
mongoose.connection.once("open", function() {
	app.listen(5000);
	console.log("we have a connection");
});

 app.use(function (err,req, res,next) {
 	return res.status(412).send("payload is on the incorrect form!");
 });



