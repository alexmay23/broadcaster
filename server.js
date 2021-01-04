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
    console.log("BODY", body);
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
    res.io.emit(topic, message);
    res.status(204);
    res.send();
});

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});


const port = process.env.PORT || 5556;
server.listen(port, ()=> console.log(`Server listens on PORT: ${port}`));
