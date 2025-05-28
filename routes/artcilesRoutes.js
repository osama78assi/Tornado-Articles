const { Router } = require("express");
const isAuthenticated = require("../middlewares/isAuthenticated");

const articleRouter = Router();

articleRouter.all("/", isAuthenticated, (req, res) => res.status(200).json("hello"));

module.exports = articleRouter;
