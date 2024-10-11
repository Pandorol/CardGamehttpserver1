var http = require('http');
var express = require('express');
var bodyParser = require('body-parser'); // 导入 body-parser 模块
var mysql = require('mysql');
var cors = require('cors');
var app = express();
var { createClient } = require('redis'); // 导入 redis 模块
// 创建 Redis 客户端并连接
var redisClient = createClient({
    url: 'redis://8.138.172.203:6379' // 你可以根据你的 Redis 服务器配置调整 URL
});

redisClient.connect().catch(err => {
    console.error('Redis 连接失败: ', err);
});
var db = mysql.createPool({
    host: '8.138.172.203',
    user: 'poster',
    password: 'w8ecc7BLfAfX6ZCK',
    database: 'poster'
});

// 连接到数据库
// db.connect(function (err) {
//     if (err) {
//         console.error('数据库连接失败: ' + err.stack);
//         return;
//     }
//     console.log('已连接到数据库');
// });

app.use(cors({
    origin: true, // Allows all origins
    methods: ['GET', 'POST'], // Allow specific methods
    allowedHeaders: ['Content-Type'], // Allow specific headers
}));

// 中间件解析 JSON 格式的请求体
app.use(bodyParser.json());
// 中间件解析 URL 编码的请求体
app.use(bodyParser.urlencoded({ extended: true }));


// 用户注册接口
app.post("/register", function (req, res) {
    //console.log(req.body)
    var useraccount = req.body.useraccount;
    var userpassword = req.body.userpassword;
    var usernickname = req.body.usernickname || req.body.useraccount;
    // 插入新用户数据到数据库
    var sql = 'INSERT INTO users (useraccount, userpassword,usernickname) VALUES (?, ?,?)';
    db.query(sql, [useraccount, userpassword, usernickname], function (err, result) {
        if (err) {
            errmsg = err.sqlMessage
            if (err.errno == 1062) { errmsg = "账号已存在" }
            res.status(200).send({ msg: '注册失败,' + errmsg });
            return;
        }
        let userid = result.insertId
        let desks = JSON.stringify([[0, 0, 0, 1, 2, 2, 1, 0, 0, 0]])
        let cards = JSON.stringify([1, 2])
        var sql2 = 'INSERT INTO logindatas (userid, desks,cards) VALUES (?, ?,?)';
        db.query(sql2, [userid, desks, cards], function (err, result) {
            if (err) {

                res.status(200).send({ msg: '注册成功，但初始化数据失败' });
                return;
            }
            res.status(200).send({ msg: '注册成功' });
        })


    });
});
// 用户登录接口
app.post("/login", function (req, res) {
    var useraccount = req.body.useraccount;
    var userpassword = req.body.userpassword;
    //console.log(req.body)
    // 查找用户
    var sql = 'SELECT * FROM users WHERE useraccount = ?';
    let ret = {}
    ret.msg = '登录成功'
    ret.sucess = 1

    db.query(sql, [useraccount], function (err, results) {
        if (err) {
            res.status(200).send({ msg: '查询错误' });
            return;
        }

        if (results.length === 0) {
            res.status(200).send({ msg: '用户不存在' });
            return;
        }

        var user = results[0];

        if (userpassword == user.userpassword) {
            ret.userid = user.userid
            res.status(200).json(ret)
            res.end();

        } else {
            res.status(200).send({ msg: '密码错误' });
        }

    });

});
app.post("/getpostermorebefore", function (req, res) {

    var id = parseInt(req.body.id) || 0;

    if (!id) {
        res.status(400).send({ data: [] });
        return;
    }
    // 构建 SQL 查询
    var sql = 'SELECT * FROM postertable WHERE id <= ? ORDER BY id DESC LIMIT 10';

    // 执行查询，使用参数化查询防止 SQL 注入
    db.query(sql, [id], function (err, results) {
        if (err) {
            console.error({ msg: '查询失败: ' + err.stack });
            res.status(500).send({ msg: '查询失败' });
            return;
        }

        // 返回查询结果作为 JSON 响应
        res.status(200).json({
            data: results
        });
    });
});
app.post("/getpostermorenew", function (req, res) {

    var id = parseInt(req.body.id) || 0;

    if (!id) {
        res.status(400).send({ data: [] });
        return;
    }
    // 构建 SQL 查询
    var sql = 'SELECT * FROM postertable WHERE id >= ? ORDER BY id LIMIT 10';
    // 构建获取总记录数的 SQL 查询
    var countSql = 'SELECT COUNT(*) AS total FROM postertable';
    db.query(countSql, function (err, countResult) {
        if (err) {
            console.error({ msg: '获取总记录数失败: ' + err.stack });
            res.status(500).send({ msg: '数据库错误' });
            return;
        }

        // 总记录数
        var totalCount = countResult[0].total;
        // 执行查询，使用参数化查询防止 SQL 注入
        db.query(sql, [id], function (err, results) {
            if (err) {
                console.error({ msg: '查询失败: ' + err.stack });
                res.status(500).send({ msg: '查询失败' });
                return;
            }

            // 返回查询结果作为 JSON 响应
            res.status(200).json({
                total: totalCount,
                data: results
            });
        });
    })
});
app.post("/getposterlist", function (req, res) {
    // 获取请求体中的分页参数
    var page = parseInt(req.body.page) || 0; // 当前页码，默认值为0
    var limit = parseInt(req.body.pagenum) || 10; // 每页记录数，默认值为10

    // 计算 OFFSET
    var offset = page * limit;

    // 构建 SQL 查询
    var sql = 'SELECT * FROM postertable ORDER BY id DESC LIMIT ? OFFSET ?';
    // 构建获取总记录数的 SQL 查询
    var countSql = 'SELECT COUNT(*) AS total FROM postertable';
    // 执行查询，使用参数化查询防止 SQL 注入
    // 先执行获取总记录数的查询
    db.query(countSql, function (err, countResult) {
        if (err) {
            console.error({ msg: '获取总记录数失败: ' + err.stack });
            res.status(500).send({ msg: '数据库错误' });
            return;
        }

        // 总记录数
        var totalCount = countResult[0].total;

        // 执行分页查询，使用参数化查询防止 SQL 注入
        db.query(sql, [limit, offset], function (err, results) {
            if (err) {
                console.error({ msg: '查询失败: ' + err.stack });
                res.status(500).send({ msg: '数据库错误' });
                return;
            }

            // 返回查询结果和总记录数作为 JSON 响应
            res.status(200).json({
                total: totalCount,
                data: results
            });
        });
    });
});

app.post("/uploadposter", function (req, res) {

    var postData = {
        userid: req.body.userid,
        username: req.body.username,
        title: req.body.title,
        description: req.body.description
    };

    // 使用参数化查询防止 SQL 注入
    var sql = 'INSERT INTO postertable (userid,username,title, description) VALUES (?,?,?,?)';
    // 执行插入操作
    db.query(sql, [postData.userid, postData.username, postData.title, postData.description], function (err, result) {
        if (err) {
            console.error('数据插入失败: ' + err.stack);
            res.status(500).send({ msg: '数据库错误' });
            return;
        }
        //console.log(postData)
        //console.log('数据已插入, ID: ' + result.insertId);
        res.status(200).send({ msg: "发布成功" });
    });

});
// 获取房间列表接口
app.post("/getroomlist", async function (req, res) {
    try {
        const rooms = await redisClient.hGetAll("rooms"); // 获取所有房间数据
        const roomList = Object.keys(rooms).map(roomId => JSON.parse(rooms[roomId])); // 解析房间数据
        res.status(200).json({
            msg: '获取成功',
            data: roomList
        });
    } catch (err) {
        console.error('获取房间列表失败: ', err);
        res.status(500).send({ msg: '获取房间列表失败' });
    }
});
var server = http.createServer(app);
server.listen(8084);
console.log('Server is running on port 8084');