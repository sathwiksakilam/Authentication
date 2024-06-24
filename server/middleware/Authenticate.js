const jwt = require("jsonwebtoken");
const userdb = require("../models/UserSchema");
const secretkey = "asdsaasunglwlwldltnternuigshwrtw";

const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization; // Ensure the header is correct

        if (!authHeader) {
            return res.status(401).json({ status: 401, message: "Authorization header not found" });
        }

        const token = authHeader.split(" ")[1]; // Extract the token from the header

        if (!token) {
            return res.status(401).json({ status: 401, message: "Token not provided" });
        }

        const verifytoken = jwt.verify(token, secretkey);
        const rootUser = await userdb.findOne({ _id: verifytoken._id });

        if (!rootUser) {
            throw new Error("User not found");
        }

        req.token = token;
        req.rootUser = rootUser;
        req.userId = rootUser._id;
        next();
    } catch (err) {
        res.status(401).json({ status: 401, message: "Unauthorized, token verification failed" });
    }
}

module.exports = authenticate;
