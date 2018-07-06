const  port = process.env.PORT || 8080,
    child_process = require('child_process'),
    express = require('express'),
    app = express(),
    path = require("path");


    /* 挂载静态页面 */
app.use(express.static(path.resolve(__dirname, './example')));

app.listen(port, () => {
    console.log("Server is now running in localhost: " + port);
    child_process.exec(`start http://localhost:${port}`);
});