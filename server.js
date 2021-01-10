const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server, {
    path:"/socket",
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    }
});

app.use(function (req, res, next) {
    res.io = io;
    next();
});
app.use(express.json());


const isValidTopic = (topic) => {
    for (const value of ["event_published","event_updated", "event_archived"]){
        if (value === topic){
            return true;
        }
    }
    return false;
}

app.post("/", async (req, res) => {
    let body = req.body;
    let key =  req.header("key");
    if (!key || key !== process.env.KEY){
        res.status(403);
        res.send({"error": "Permission denied"});
        return;
    }
    if (!body || Object.entries(body).length === 0) {
        res.status(400);
        res.send({"error": "Empty body"});
        return;
    }
    let topic = body["topic"];
    if (topic === null || topic === undefined || typeof topic !== "string"){
        res.status(400);
        res.send({"error": "Topic should be string variable"});
        return;
    }
    if (!isValidTopic(topic)){
        res.status(400);
        res.send({"error": "Topic should be valid"});
        return;
    }
    let message = body["message"];
    if (message === null || message === undefined || typeof message !== "object"){
        res.status(400);
        res.send({"error": "Message should be object variable"});
        return;
    }
    let routeKey = body["route_key"];
    if (routeKey === null || routeKey === undefined || typeof routeKey !== "string" || routeKey.length === 0){
        res.status(400);
        res.send({"error": "Route key should be not empty string variable"});
        return;
    }
    res.io.to(routeKey).emit(topic, message);
    res.status(204);
    res.send();
});

io.on('connection', (socket) => {
    const route = socket.handshake.query.routeKey;
    if (route) {
        socket.join(route);
    }
    else {
        console.log("Route should be configured");
    }
    console.log(`User connected & joined ${route}`);
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});


const port = process.env.PORT || 5556;
server.listen(port, ()=> console.log(`Server listens on PORT: ${port}`));
