var ros = null;
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function connect() {
    ros = new ROSLIB.Ros({
        url: 'ws://localhost:9090'
    });

    ros.on('connection', function () {
        console.log('Connected to websocket server.');
    });

    ros.on('error', function (error) {
        console.log('Error connecting to websocket server: ', error);
    });

    ros.on('close', function () {
        console.log('Connection to websocket server closed.');
    });
}

function publish(topic, messageType, message) {
    // var topic = new ROSLIB.Topic({
    //     ros: ros,
    //     name: '/webTopic',
    //     messageType: 'std_msgs/String'
    // });

    // var msg = new ROSLIB.Message({
    //     data: 'test message'
    // });
    var topic = new ROSLIB.Topic({
        ros: ros,
        name: topic,
        messageType: messageType
    });
    topic.publish(message);
    console.log('Message published');
}

async function subscribe() {
    var listener = new ROSLIB.Topic({
        ros: ros,
        name: '/webTopic',
        messageType: 'std_msgs/String'
    });

    var imuAngleSub = new ROSLIB.Topic({
        ros: ros,
        name: '/IMUAngle',
        messageType: 'imu_msgs/msg/IMUData'
    });

    listener.subscribe(function (message) {
        console.log('Received message on ' + listener.name + ': ' + message.data);
        const messageP = document.createElement("p");
        document.getElementsByClassName("publishedContent")[0].appendChild(messageP);
        messageP.textContent = (new Date()).toLocaleString() + ": " + message.data;
    });

    // imuAngleSub.subscribe(function (message) {
    //     console.log('Received message on ' + imuAngleSub.name + ': ' + message.data);
    // });

}

function listTopics() {
    var topics = null;
    var getTopicsClient = new ROSLIB.Service({
        ros: ros,
        name: '/rosapi/topics',
        serviceType: 'rosapi/Topics'
    });

    var request = new ROSLIB.ServiceRequest({
    });

    getTopicsClient.callService(request, function (result) {
        var topics = "";
        console.log('Topics:', result.topics);
        var buttons = [];
        for (topic of result.topics) {
            for (var i = 0; i < buttons.length; i++){
               document.getElementsByClassName("logs")[0].removeChild(buttons.pop());                 
            }
            console.log(topic);
            topics += topic + ", "
            const button = document.createElement("button");
            buttons.push(button);
            document.getElementsByClassName("logs")[0].appendChild(button);
            button.textContent = topic;
        }
        topics = topics.substring(0, topics.length - 2);
        document.getElementById("topicList").textContent = topics;
    });

}

// function getTime() {
//     var getTimeClient = new ROSLIB.Service({
//         ros: ros,
//         name: '/rosapi/get_time',
//         serviceType: 'rosapi/GetTime'
//     });
//     var request = new ROSLIB.ServiceRequest({
//     });

//     getTimeClient.callService(request, function (result) {
//         // console.log(result);
//         console.log(result.time.secs);
//         // Convert to JavaScript Date
//         const jsDate = new Date(result.time.secs * 1000 + Math.floor(result.time.nsecs / 1e6));
//         console.log(jsDate.toString()); // Usable Date Object
//     });
// }

async function updateTopics() {
    while (true) {
        listTopics();
        await sleep(2000);
    }
}

function run() {
    connect();
    updateTopics();
    subscribe();
    console.log((new Date()).toLocaleString());
}
run();
// publish();
// subscribe();
// publish();
// subscribe();
