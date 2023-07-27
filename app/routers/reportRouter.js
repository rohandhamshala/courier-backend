module.exports = (app) => {
    const Report = require("../controllers/reportController.js");
    var router = require("express").Router();
    router.get("/report/", Report.getReport);
    router.get("/lastWeekReport/", Report.lastWeekReport);
    app.use(router);
}