import { setIMU} from "./globalVariables.js";
var ros = null;
var topicToDisplay = "";
const channel = new BroadcastChannel('controls_channel');
var lat = -1;
var long = -1;
var mouseLat = -1;
var mouseLong = -1;
var waypointMessages = []
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


const controlStates = {
    toggle1_: 0,
    toggle2_: 0,
    toggle3_: 0,
    toggle4_: 0,
    toggle5_: 0,
    toggle6_: 0,
    drivetrain_fwd_: 0,
    drivetrain_left_: 0,
    drivetrain_right_: 0,
    drivetrain_rev_: 0,
    arm_up_: 0,
    arm_left_: 0,
    arm_right_: 0,
    arm_down_: 0,
    arm_rev_: 0,
    arm_grab_: 0,
    arm_fwd_: 0
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

function publishWaypointList(){
    var topic = new ROSLIB.Topic({
        ros: ros,
        name: '/waypoint_list',
        messageType: 'rover_interface/msg/WaypointList'
    });

    var msg = new ROSLIB.Message({
        list_waypoints: waypointMessages
    });   
    topic.publish(msg);
}

async function publishControls(){
    while (true){
// console.log("publisher sees:", controlStates.toggle1_);
        var topic = new ROSLIB.Topic({
            ros: ros,
            name: '/controls',
            messageType: 'rover_interface/msg/UI'
    });  
    var msg = new ROSLIB.Message({
        toggle1: controlStates.toggle1_, 
        toggle2: controlStates.toggle2_,
        toggle3: controlStates.toggle3_,
        toggle4: controlStates.toggle4_,
        toggle5: controlStates.toggle5_,
        toggle6: controlStates.toggle6_,
        drivetrain_fwd: controlStates.drivetrain_fwd_,
        drivetrain_left: controlStates.drivetrain_left_,
        drivetrain_right: controlStates.drivetrain_right_,
        drivetrain_rev: controlStates.drivetrain_rev_,
        arm_up: controlStates.arm_up_,
        arm_down: controlStates.arm_down_,
        arm_left: controlStates.arm_left_,
        arm_right: controlStates.arm_right_,
        arm_fwd: controlStates.arm_fwd_,
        arm_rev: controlStates.arm_rev_,
        arm_grab: controlStates.arm_grab_
    });
    topic.publish(msg);
    await sleep(100);
}
}

function publishWaypoint(name, color, latitude, longitude) {
    var topic = new ROSLIB.Topic({
        ros: ros,
        name: '/waypoints',
        messageType: 'rover_interface/msg/WaypointData'
    });

    var msg = new ROSLIB.Message({
        waypoint_name: name,
        waypoint_color: color,
        latitude: latitude,
        longitude: longitude
    });
    waypointMessages.push(msg);
    publishWaypointList();
    // var topic = new ROSLIB.Topic({
    //     ros: ros,
    //     name: topic,
    //     messageType: messageType
    // });
    topic.publish(msg);
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
        messageType: 'rover_interface/msg/IMUData'
    });

    var imuAccelerationSub = new ROSLIB.Topic({
        ros: ros,
        name: '/IMUAcceleration',
        messageType: 'rover_interface/msg/IMUData'
    });
    var imuGyroSub = new ROSLIB.Topic({
        ros: ros,
        name: '/IMUGyro',
        messageType: 'rover_interface/msg/IMUData'
    });
    var imuMagnetSub = new ROSLIB.Topic({
        ros: ros,
        name: '/IMUMagnet',
        messageType: 'rover_interface/msg/IMUData'
    });
    // var imuQuaternionSub = new ROSLIB.Topic({
    //     ros: ros,
    //     name: '/IMUQuaternion',
    //     messageType: 'imu_msgs/msg/IMUQuaternionData'
    // });

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
        messageType: 'rover_interface/msg/GPSData'
    })
    var waypoint_topic = new ROSLIB.Topic({
        ros: ros,
        name: '/waypoints',
        messageType: 'rover_interface/msg/WaypointData'
    })

    var waypoint_list_topic = new ROSLIB.Topic({
        ros: ros,
        name: '/waypoint_list',
        messageType: 'rover_interface/msg/WaypointList'
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
    var logBox;
    imuAngleSub.subscribe(function (message) {
        const imuChannel = new BroadcastChannel('imu');
        setIMU(message.x, message.y, message.z);
        imuChannel.postMessage({ x: message.x, y: message.y, z: message.z });
        if (topicToDisplay == "IMUAngle") {

            logBox = document.getElementById('log');
            if (logBox.value.length > 6500) {
                logBox.value = "";
            }
            logBox.value += (new Date()).toLocaleString() + ' Status: ' + message.status + ' X: ' + message.x + ' Y: ' + message.y + ' Z: ' + message.z + "\n";
        }
    });

    imuAccelerationSub.subscribe(function (message) {
        // const logBox = document.getElementById('log');
        if (topicToDisplay == "IMUAcceleration") {
            logBox = document.getElementById('log');
            if (logBox.value.length > 6500) {
                logBox.value = "";
            }
            logBox.value += (new Date()).toLocaleString() + ' Status: ' + message.status + ' X: ' + message.x + ' Y: ' + message.y + ' Z: ' + message.z + "\n";

        }
    });

    imuGyroSub.subscribe(function (message) {
        // const logBox = document.getElementById('log');
        if (topicToDisplay == "IMUGyro") {
            logBox = document.getElementById('log');
            if (logBox.value.length > 6500) {
                logBox.value = "";
            }
            logBox.value += (new Date()).toLocaleString() + ' Status: ' + message.status + ' X: ' + message.x + ' Y: ' + message.y + ' Z: ' + message.z + "\n";

        }
    });
    imuMagnetSub.subscribe(function (message) {
        // const logBox = document.getElementById('log');
        if (topicToDisplay == "IMUMagnet") {
            logBox = document.getElementById('log');
            if (logBox.value.length > 6500) {
                logBox.value = "";
            }
            logBox.value += (new Date()).toLocaleString() + ' Status: ' + message.status + ' X: ' + message.x + ' Y: ' + message.y + ' Z: ' + message.z + "\n";

        }
    });
    // imuQuaternionSub.subscribe(function (message) {
    //     if (topicToDisplay == "IMUQuaternion") {
    //         logBox = document.getElementById('log');
    //         if (logBox.value.length > 6500) {
    //             logBox.value = "";
    //         }
    //         logBox.value += (new Date()).toLocaleString() + ' Status: ' + message.status + ' W' + message.w + ' X: ' + message.x + ' Y: ' + message.y + ' Z: ' + message.z + "\n";

    //     }
    // });

    rosOutSub.subscribe(function (message) {
        // const logBox = document.getElementById('log');
        if (topicToDisplay == "rosout") {
            logBox = document.getElementById('log');
            if (logBox.value.length > 6500) {
                logBox.value = "";
            }
            logBox.value += (new Date()).toLocaleString() + message.name + ' (' + message.level + ') from ' + message.function + ' (line: ' + message.line + '): ' + message.msg + '\n';
        }
    });

    gps_topic.subscribe(function (message) {
        // const logBox = document.getElementById('log');
        lat = message.latitude;
        long = message.longitude;
        if (topicToDisplay == "GPSData") {
            logBox = document.getElementById('log');
            if (logBox.value.length > 6500) {
                logBox.value = "";
            }
            logBox.value += (new Date()).toLocaleString() + ' Status: ' + message.status + ' Latitude: ' + message.latitude + ' Longitude: ' + message.longitude + ' Altitude: ' + message.altitude + ' Fix Quality: ' + message.fix_quality + ' Num Satellites: ' + message.num_satellites + ' hdop: ' + message.hdop + ' GeoID Separation: ' + message.geoid_separation + '\n';
        }
    });

    waypoint_topic.subscribe(function (message) {
        // const logBox = document.getElementById('log');
        if (topicToDisplay == "waypoints") {
            logBox = document.getElementById('log');
            if (logBox.value.length > 6500) {
                logBox.value = "";
            }
            logBox.value += (new Date()).toLocaleString() + ' Name: ' + message.waypoint_name + ' Color: ' + message.waypoint_color + ' Latitude: ' + message.latitude + ' Longitude: ' + message.longitude + '\n';
        }
    });

    waypoint_list_topic.subscribe(function (message) {
        // const logBox = document.getElementById('log');
        if (topicToDisplay == "waypoint_list") {
            logBox = document.getElementById('log');
            if (logBox.value.length > 6500) {
                logBox.value = "";
            }
            console.log("LENGTH LENGTH: " + message.list_waypoints.length)
            for (var i = 0; i < message.list_waypoints.length; i++){
                logBox.value += 'Waypoint ' + (i+1) + "\n";
                logBox.value += (new Date()).toLocaleString() + ' Name: ' + message.list_waypoints[i].waypoint_name + ' Color: ' + message.list_waypoints[i].waypoint_color + ' Latitude: ' + message.list_waypoints[i].latitude + ' Longitude: ' + message.list_waypoints[i].longitude + '\n';
            }
            logBox.value += "\n";
            // logBox.value += (new Date()).toLocaleString() + ' Waypoint: ' + message.list_waypoints[0].waypoint_name + '\n';
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
            if (topic == "/GPSData" || topic == "/IMUAcceleration" || topic == "/IMUAngle" || topic == "/IMUGyro" || topic == "/IMUMagnet" || topic == "/IMUQuaternion" || topic == "/rosout" || topic == "/waypoints" || topic == "/waypoint_list") {

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
        // case "/IMUQuaternion":
        //     topicToDisplay = "IMUQuaternion";
        //     console.log("BUTTON");
        //     topicDisplay.textContent = "Selected Topic: IMUQuaternion";
        //     break;
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
        case "/waypoints":
            topicToDisplay = "waypoints";
            console.log("BUTTON");
            topicDisplay.textContent = "Selected Topic: waypoints";
            break;
        case "/waypoint_list":
            topicToDisplay = "waypoint_list";
            console.log("BUTTON");
            topicDisplay.textContent = "Selected Topic: waypoint_list";
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
var waypoints = [];
var waypointNames = [];
var waypointColors = [];
var waitForName = false;
async function addWaypointName() {
    waitForName = true;
    document.getElementsByClassName("popup")[0].style.display = "flex";
    while (waitForName) {
        await sleep(100);
    }
}
function addName() {
    waypointNames.push(document.getElementsByClassName("waypointName")[0].value);
    waypointColors.push(document.getElementsByClassName("waypointColor")[0].value);
    console.log(waypointNames.at(waypointNames.length - 1));
    console.log(waypointColors.at(waypointColors.length - 1));
    var waypoint = L.circle([mouseLat, mouseLong], {
        color: waypointColors.at(waypointColors.length - 1),
        fillColor: waypointColors.at(waypointColors.length - 1),
        fillOpacity: 0.5,
        radius: 2
    });
    waypoint.addTo(map);
    waypoints.push(waypoint);
    publishWaypoint(waypointNames.at(waypointNames.length - 1), waypointColors.at(waypointNames.length-1), mouseLat, mouseLong);
    waypoints.at(waypoints.length - 1).bindTooltip(waypointNames.at(waypoints.length - 1), {
        permanent: true,     // always visible
        direction: "right",  // position relative to marker
        offset: [10, 0]
    });
    waypoints.at(waypoints.length - 1).addTo(map);
    document.getElementsByClassName("popup")[0].style.display = "none";
    waitForName = false;
}
document.getElementById("nameBtn").addEventListener("click", addName);
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
    map.on('click', function (e) {
        mouseLat = e.latlng.lat;
        mouseLong = e.latlng.lng;
        console.log(e.latlng.lat, e.latlng.lng);
        addWaypointName();
        // var waypoint = L.circle([mouseLat, mouseLong], {
        //     color: 'blue',
        //     fillColor: '#00f',
        //     fillOpacity: 0.5,
        //     radius: 2
        // });

        // waypoint.fillColor = "#000000";
        // waypoint.color = "#000000";
        // addWaypointName();
        // waypoints.push(waypoint);
        // waypoint.bindTooltip(waypointNames.at(waypoints.length-1), {
        //     permanent: true,     // always visible
        //     direction: "right",  // position relative to marker
        //     offset: [10, 0]
        // });
        // waypoint.addTo(map);

    });
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
        // if (mouseLat != -1 || mouseLong != -1){
        //     waypoints.push
        // }
        var newLatLng = L.latLng(lat, long);
        console.log("lat: " + lat + " long: " + long);
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
    publishControls();
    channel.onmessage = (event) => {
    // state.toggle1_ = event.data.toggle1_;
    Object.assign(controlStates, event.data.state);
    console.log('index.html sees:', event.data.state.toggle1_);
};
}
run();
// publish();
// subscribe();
// publish();
// subscribe();
