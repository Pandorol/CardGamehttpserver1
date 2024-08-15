const http = require('http');
const HTTP_PORT = 8000;
const server = http.createServer((req, res) => {
    const url = req.url;
    console.log(url);
    const parseInfo = url.parse(req.url);
    console.log(parseInfo);

    const { pathname, query } = url.parse(req.url);
    const queryObj = qs.parse(query);
    console.log(queryObj);
    console.log(queryObj.name);
    console.log(queryObj.password);
    res.write("Hello World");
    res.write("Hello Response");
    //设置状态码常见的有两种方式：
    res.statusCode = 400;
    res.writeHead(200);
    //返回头部信息，主要有两种方式：
    res.setHeader("Content-Type", "application/json;charset=utf8");
    res.writeHead(200, {
        "Content-Type": "application/json;charset=utf8"
    })


    if (url === '/login') {
        res.end("welcome Back~");
    } else if (url === '/products') {
        res.end("products");
    } else if (req.url === '/upload') {

        if (req.method === 'POST') {
            // 图片文件必须设置为二进制的
            req.setEncoding('binary');

            // 获取content-type中的boundary的值
            var boundary = req.headers['content-type'].split('; ')[1].replace('boundary=', '');

            // 记录当前数据的信息
            const fileSize = req.headers['content-length'];
            let curSize = 0;
            let body = '';

            // 监听当前的数据
            req.on("data", (data) => {
                curSize += data.length;
                res.write(`文件上传进度: ${curSize / fileSize * 100}%\n`);
                body += data;
            });

            // 数据结构
            req.on('end', () => {
                // 切割数据
                const payload = qs.parse(body, "\r\n", ":");
                // 获取最后的类型(image/png)
                const fileType = payload["Content-Type"].substring(1);
                // 获取要截取的长度
                const fileTypePosition = body.indexOf(fileType) + fileType.length;
                let binaryData = body.substring(fileTypePosition);
                binaryData = binaryData.replace(/^\s\s*/, '');

                // binaryData = binaryData.replaceAll('\r\n', '');
                const finalData = binaryData.substring(0, binaryData.indexOf('--' + boundary + '--'));

                fs.writeFile('./boo.png', finalData, 'binary', (err) => {
                    console.log(err);
                    res.end("文件上传完成~");
                })
            })
        }
    }
    else {
        res.end("error message");
    }
    if (req.method === 'POST') {

        // 可以设置编码，也可以在下方通过 data.toString() 获取字符串格式
        req.setEncoding('utf-8');

        req.on('data', (data) => {
            const { username, password } = JSON.parse(data);
            console.log(username, password);
        });

        res.end("create user success");
    } else {
        res.end("users list");
    }

})
server.listen(HTTP_PORT, () => {
    console.log(`🚀在${HTTP_PORT}启动~`)
})
//http模块是可以在Node中直接发送网络请求的
// http.get("http://localhost:8000", (res) => {
//     res.on('data', data => {
//         console.log(data.toString());
//         console.log(JSON.parse(data.toString()));
//     })
// });
// const req = http.request({
//     method: 'POST',
//     hostname: "localhost",
//     port: 8000
// }, (res) => {
//     res.on('data', data => {
//         console.log(data.toString());
//         console.log(JSON.parse(data.toString()));
//     })
// })

// req.on('error', err => {
//     console.log(err);
// })
// // 必须调用end, 表示写入内容完成
// req.end();

// 我们都知道 JavaScript 是单线程运行的，一个线程只会在一个 CPU 核心上运行。而现代的处理都是多核心的，为了充分利用多核，就需要启用多个 Node.js 进程去处理负载任务。

// Node 提供的 cluster 模块解决了这个问题 ，我们可以使用 cluster 创建多个进程，并且同时监听同一个端口，而不会发生冲突
// const cluster = require('cluster');
// const http = require('http');

// if (cluster.isMaster) {
//     // 衍生工作进程。
//     for (let i = 0; i < 4; i++) {
//         cluster.fork();
//     }
// } else {
//     // 工作进程可以共享任何 TCP 连接。
//     // 在本例子中，共享的是 HTTP 服务器。
//     http.createServer((req, res) => {
//         res.writeHead(200);
//         res.end('你好世界\n');
//     }).listen(8000);
// }