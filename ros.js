var ros = null;
var topicToDisplay = "";

var lat = -1;
var long = -1;
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
    // console.log('Message published');
}

async function subscribe() {
    // var listener = new ROSLIB.Topic({
    //     ros: ros,
    //     name: '/webTopic',
    //     messageType: 'std_msgs/String'
    // });

    var imuAngleSub = new ROSLIB.Topic({
        ros: ros,
        name: '/IMUAngle',
        messageType: 'imu_msgs/msg/IMUData'
    });

    var imuAccelerationSub = new ROSLIB.Topic({
        ros: ros,
        name: '/IMUAcceleration',
        messageType: 'imu_msgs/msg/IMUData'
    });
    var imuGyroSub = new ROSLIB.Topic({
        ros: ros,
        name: '/IMUGyro',
        messageType: 'imu_msgs/msg/IMUData'
    });
    var imuMagnetSub = new ROSLIB.Topic({
        ros: ros,
        name: '/IMUMagnet',
        messageType: 'imu_msgs/msg/IMUData'
    });
    var imuQuaternionSub = new ROSLIB.Topic({
        ros: ros,
        name: '/IMUQuaternion',
        messageType: 'imu_msgs/msg/IMUQuaternionData'
    });

    var rosOutSub = new ROSLIB.Topic({
        ros: ros,
        name: '/rosout',
        messageType: 'rcl_interfaces/msg/Log'
    })

    // Create a topic object for the compressed image stream
    var image_topic = new ROSLIB.Topic({
        ros: ros,
        name: '/robot/rgb_camera/image_raw', // Subscribe to the COMPRESSED topic
        messageType: 'sensor_msgs/msg/Image'
    });

    var gps_topic = new ROSLIB.Topic({
        ros: ros,
        name: '/GPSData',
        messageType: 'gps_msgs/GPSData'
    })


    // listener.subscribe(function (message) {
    //     // console.log('Received message on ' + listener.name + ': ' + message.data);
    //     const messageP = document.createElement("p");
    //     document.getElementsByClassName("publishedContent")[0].appendChild(messageP);
    //     messageP.textContent = (new Date()).toLocaleString() + ": " + message.data;
    // });

    // Subscribe to the topic
    image_topic.subscribe(function (message) {
        // Update the image source with the Base64 data received from the message
        // The 'data:image/jpeg;base64,' prefix is crucial for the browser to interpret the data URL correctly
        console.log("IMAGE LOAD");
        document.getElementById('my_image').src = "data:image/jpeg;base64," + message.data;
    });
    imuAngleSub.subscribe(function (message) {
        if (topicToDisplay == "IMUAngle") {
            logBox = document.getElementById('log');
            if (logBox.value.length > 6500) {
                logBox.value = "";
            }
            logBox.value += (new Date()).toLocaleString() + ' Status: ' + message.status + ' X: ' + message.x + ' Y: ' + message.y + ' Z: ' + message.z + "\n";

        }
    });

    imuAccelerationSub.subscribe(function (message) {
        if (topicToDisplay == "IMUAcceleration") {
            logBox = document.getElementById('log');
            if (logBox.value.length > 6500) {
                logBox.value = "";
            }
            logBox.value += (new Date()).toLocaleString() + ' Status: ' + message.status + ' X: ' + message.x + ' Y: ' + message.y + ' Z: ' + message.z + "\n";

        }
    });

    imuGyroSub.subscribe(function (message) {
        if (topicToDisplay == "IMUGyro") {
            logBox = document.getElementById('log');
            if (logBox.value.length > 6500) {
                logBox.value = "";
            }
            logBox.value += (new Date()).toLocaleString() + ' Status: ' + message.status + ' X: ' + message.x + ' Y: ' + message.y + ' Z: ' + message.z + "\n";

        }
    });
    imuMagnetSub.subscribe(function (message) {
        if (topicToDisplay == "IMUMagnet") {
            logBox = document.getElementById('log');
            if (logBox.value.length > 6500) {
                logBox.value = "";
            }
            logBox.value += (new Date()).toLocaleString() + ' Status: ' + message.status + ' X: ' + message.x + ' Y: ' + message.y + ' Z: ' + message.z + "\n";

        }
    });
    imuQuaternionSub.subscribe(function (message) {
        if (topicToDisplay == "IMUQuaternion") {
            logBox = document.getElementById('log');
            if (logBox.value.length > 6500) {
                logBox.value = "";
            }
            logBox.value += (new Date()).toLocaleString() + ' Status: ' + message.status + ' W' + message.w + ' X: ' + message.x + ' Y: ' + message.y + ' Z: ' + message.z + "\n";

        }
    });

    rosOutSub.subscribe(function (message) {
        if (topicToDisplay == "rosout") {
            logBox = document.getElementById('log');
            if (logBox.value.length > 6500) {
                logBox.value = "";
            }
            logBox.value += (new Date()).toLocaleString() + message.name + ' (' + message.level + ') from ' + message.function + ' (line: ' + message.line + '): ' + message.msg + '\n';
        }
    });

    gps_topic.subscribe(function (message) {
        lat = message.latitude;
        long = message.longitude;
        if (topicToDisplay == "GPSData") {
            logBox = document.getElementById('log');
            if (logBox.value.length > 6500) {
                logBox.value = "";
            }
            logBox.value += (new Date()).toLocaleString() + ' Status: ' + message.status + ' Latitude: ' +  message.latitude + ' Longitude: ' + message.longitude + ' Altitude: ' + message.altitude + ' Fix Quality: ' + message.fix_quality + ' Num Satellites: ' + message.num_satellites +  ' hdop: ' + message.hdop + ' GeoID Separation: ' + message.geoid_separation + '\n';
        }
    });

}

var buttons = [];
function listTopics() {
    var topics = null;
    var getTopicsClient = new ROSLIB.Service({
        ros: ros,
        name: '/rosapi/topics',
        serviceType: 'rosapi/Topics'
    });

    var request = new ROSLIB.ServiceRequest({
    });

    for (let btn of buttons) btn.remove();
    buttons = [];
    getTopicsClient.callService(request, function (result) {
        var topics = "";
        // console.log('Topics:', result.topics);
        for (let topic of result.topics) {
            topics += topic + ", ";
            if (topic == "/GPSData" || topic == "/IMUAcceleration" || topic == "/IMUAngle" || topic == "/IMUGyro" || topic == "/IMUMagnet" || topic == "/IMUQuaternion" || topic == "/rosout"){

                const button = document.createElement("button");
                button.onclick = () => topicClick(topic);
                button.textContent = topic;
                buttons.push(button);
                document.getElementsByClassName("btns")[0].appendChild(button);
            }
        }

        // for (topic of result.topics) {
        //     // console.log(topic);
        //     topics += topic + ", ";
        //     const button = document.createElement("button");
        //     button.onclick = function () {
        //         topicClick(topic);
        //     };
        //     button.textContent = topic;
        //     buttons.push(button);
        //     document.getElementsByClassName("btns")[0].appendChild(button);
        // }
        topics = topics.substring(0, topics.length - 2);
        document.getElementById("topicList").textContent = topics;
    });
    // console.log(buttons);
    // console.log("TOPIC" + topicToDisplay);

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

function topicClick(topic) {
    const topicDisplay = document.getElementById('topicDisplay');
    topicDisplay.textContent = "Selected Topic: ";
    // console.log("TOPIC: " + topic);
    document.getElementById('log').value = "";
    switch (topic) {
        case "/IMUAngle":
            topicToDisplay = "IMUAngle";
            console.log("BUTTON");
            topicDisplay.textContent = "Selected Topic: IMUAngle";
            break;
        case "/IMUAcceleration":
            topicToDisplay = "IMUAcceleration";
            console.log("BUTTON");
            topicDisplay.textContent = "Selected Topic: IMUAccleration";
            break;
        case "/IMUGyro":
            topicToDisplay = "IMUGyro";
            console.log("BUTTON");
            topicDisplay.textContent = "Selected Topic: IMUGyro";
            break;
        case "/IMUMagnet":
            topicToDisplay = "IMUMagnet";
            console.log("BUTTON");
            topicDisplay.textContent = "Selected Topic: IMUMagnet";
            break;
        case "/IMUQuaternion":
            topicToDisplay = "IMUQuaternion";
            console.log("BUTTON");
            topicDisplay.textContent = "Selected Topic: IMUQuaternion";
            break;
        case "/rosout":
            topicToDisplay = "rosout";
            console.log("BUTTON");
            topicDisplay.textContent = "Selected Topic: rosout";
            break;
        case "/GPSData":
            topicToDisplay = "GPSData";
            console.log("BUTTON");
            topicDisplay.textContent = "Selected Topic: GPSData";
            break;
    }
}

async function updateTopics() {
    while (true) {
        listTopics();
        await sleep(5000);
    }
}
var map;
var circle;
// var lat = 38.9903971;
// var long = -76.9378520;
function initGPS() {
    circle = L.circle([lat, long], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: 2
    });
    map = L.map('map').setView([lat, long], 50);
    // L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //     maxZoom: 50,
    //     attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    // }).addTo(map);
    var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    })
    Esri_WorldImagery.addTo(map);
    circle.addTo(map);
}

async function focusMap() {
    while (true) {
        map.setView([lat, long]);
        await sleep(100);
    }
}

async function testMovement() {
    while (true) {
        // lat += 0.00001;
        // long += 0.00001;
        var newLatLng = L.latLng(lat, long);
        circle.setLatLng(newLatLng);
        await sleep(100);
    }
}

function run() {
    connect();
    updateTopics();
    // listTopics();
    subscribe();
    // console.log((new Date()).toLocaleString());
    // listTopics();
    initGPS();
    focusMap();
    testMovement();
}
run();
// publish();
// subscribe();
// publish();
// subscribe();
