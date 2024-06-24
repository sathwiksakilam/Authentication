const express = require("express");
const app = express();
const port = 8000;
require("./db/conn"); 
const router = require("./routes/router");
const cors = require("cors");
const cookieParser= require("cookie-parser");

app.use(express.json());
app.use(cors());
app.use(router);
app.use(cookieParser);
app.listen(port, () => {
    console.log(`Server started at port no: ${port}`);
});
