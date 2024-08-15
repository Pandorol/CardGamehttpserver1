var fs = require('fs');
var path = require("path")
var options = {
    key: fs.readFileSync('E:/ssl/myserver.key'),
    cert: fs.readFileSync('E:/ssl/myserver.crt'),
    passphrase: '1234'
};

var https = require('https');
var express = require('express');
var app = express();

app.get("/", function (request, response) {
    response.end("Welcome to the homepage!");
});

app.get("/about", function (request, response) {
    response.end("Welcome to the about page!");
});

app.get("/sigin", function (req, res) {
    res.setHeader("content-type", "text/plain;charset=utf-8");
    res.end("登录");
});
app.post("/sigin", function (req, res) {
    res.setHeader("content-type", "text/plain;charset=utf-8");
    res.end("post登录");
});
app.get("/", function (req, res) {
    // res.sendFile("./index.html",{root:__dirname});不能通过../查找(root是不支持的)想读取到确切的文件 用path模块进行拼接即可
    res.sendFile(path.join(__dirname, "..", "index.html"))
    res.sendFile("D:/test.xt")
    fs.readFile(path.join(__dirname, './public/chat.html'), function (err, data) {  //读取文件，readFile里传入的是文件路径和回调函数，这里用path.join()格式化了路径。
        if (err) {
            console.error("读取chat.html发生错误", err);     //错误处理
            res.send('4 0 4');           //如果发生错误，向浏览器返回404
        } else {
            res.end(data);     //这里的data就是回调函数的参数，在readFile内部已经将读取的数据传递给了回调函数的data变量。
        }         //我们将data传到浏览器，就是把html文件传给浏览器
    })
});
//all表示所有的方法，*表示所有的路径，一般放到最后
app.all("*", function (req, res) {
    res.end("404")
})

var server = https.createServer(options, app);
server.listen(8084);
console.log('Server is running on port 8084');
//中间件
// app.use(function (req, res, next) {//不调用next就不继续往下走
//     console.log("过滤石头");
//     req.stone = "too big";
//     res.end("hello");
//     next();
//     // next("错误");
// });
// app.use(function (req, res, next) {//不调用next就不继续往下走
//     console.log("过滤沙子");
//     req.sand = "too small";
//     next();
// });
// app.get("/foot", function (req, res) {
//     console.log(req.stone, req.sand);
//     res.end("foot");

// })
// app.get("/water", function (req, res) {
//     console.log(req.stone, req.sand);
//     res.end("water");

// });