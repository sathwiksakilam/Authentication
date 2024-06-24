const mongoose = require("mongoose");
const db = "mongodb://localhost:27017/AuthUsers";

mongoose
  .connect(db)  // Added options to avoid deprecation warnings
  .then(() => {
    console.log("DB Connected");
  })
  .catch((err) => console.log(err));
