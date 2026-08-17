/**
 * @file index.js
 * Robotics @ Maryland - Terraformers Software
 * 
 * @description This contains functions and variables to run index.html (logging, map, and camera)
 * 
 * @author Leo Abubucker
 * Sub-Team: User Interface
 * Contact: Leo Abubucker (leokumar@outlook.com)
 * 
 * Last Modified: 08-17-2026 (MM-DD-YYYY)
 */

// import to load waypoints.yaml
import { load } from "./js-yaml.js";

// import shared functions and constants
import { updateBattery, simBattery, sleep, ROVER_WEBSOCKET_URL, BASESTATION_WEBSOCKET_URL } from "./helper.js";

/**                                        
 * 
 * Section 0: Global Variable Declarations
 * 
 */

// Section 0a: ROS Connection and Topic Variables

var ros = null; // connection to rover's websocket
var localRos = null; // connection to base station's websocket

// ROS Topics
var basestationHeartbeatTopic;
var roverHeartbeatTopic;
var IMUAngleTopic;
var IMUAccelerationTopic;
var IMUGryroTopic;
var IMUMagnetTopic;
var rosoutTopic;
var cameraTopic;
var GPSTopic;
var waypointTopic;
var waypointListTopic;
var basestationStopSignalTopic;

// Topic Logging
var topicToLog = null; // current topic to show in log box
var topicsToLog = []; // list of topics that can be showed in log box
const logBox = document.getElementById('log');

// Section 0b: Heartbeat and Connection Variables

var basestationHeartbeat = 0; // incrementing count for each heartbeat published by the base station 
var lastRoverHeartbeat = 0; // counting the time since last rover heartbeat in ms
var roverConnected = false;

// Section 0c: Map and Waypoint Variables

// UMD TEST COORDS: lat: 38.968864098653256, long: -76.95230122044846   
// CIRC TEST COORDS: lat: 51.465254766478324, long: -112.70757789911389
var lat = 51.465254766478324;
var long = -112.70757789911389;
var positions = []; // stores all rover positions to render its trail
var mouseLat = -1; // lat of last mouse click on map
var mouseLong = -1; // long of last mouse click on map
var waypointMessages = []
var map;
var circle; // rover's position being visualized on the map
const waypointPopupElement = document.getElementsByClassName("popup")[0];
var trail;
var zoomMax; // max native zoom for map

/**                                        
 * 
 * Section 1: ROS Websocket Initialization
 * 
 */

/**
 * @description initialize connection to the websockets for the rover and the base station
 */
function initROSConnection() {
    // connects to the ROS architecture on the rover by connecting to the rover's websocket
    ros = new ROSLIB.Ros({
        url: ROVER_WEBSOCKET_URL
    });


    // connects to the ROS architecture on the base station by connecting to the base station's websocket
    localRos = new ROSLIB.Ros({
        url: BASESTATION_WEBSOCKET_URL
    })

    localRos.on('connection', function () {
        console.log("Connected to the base station's websocket server.");
    });

    localRos.on('error', function (error) {
        console.log("Error connecting to the base station's server: ", error);
    });

    localRos.on('close', function () {
        console.log("Connection to the base station's websocket server closed.");
    });

    ros.on('connection', function () {
        console.log("Connected to the rover's websocket server.");
    });

    ros.on('error', function (error) {
        console.log("Error connecting to the rover's websocket server: ", error);
    });

    ros.on('close', function () {
        console.log("Connection to the rover's websocket server closed.");
    });
}

/**                                        
 * 
 * Section 2: Rover Topic Subscription Initializations
 * 
*/

/**
 * @description initialize topics for each relevant ROS topic and add them to a list
 */
function initTopics() {

    basestationHeartbeatTopic = new ROSLIB.Topic({
        ros: ros,
        name: '/base_station_heartbeat',
        messageType: 'std_msgs/msg/String'
    });

    roverHeartbeatTopic = new ROSLIB.Topic({
        ros: ros,
        name: '/rover_heartbeat',
        messageType: 'std_msgs/String'
    });

    IMUAngleTopic = new ROSLIB.Topic({
        ros: ros,
        name: '/IMUAngle',
        messageType: 'rover_interface/msg/IMUData'
    });

    IMUAccelerationTopic = new ROSLIB.Topic({
        ros: ros,
        name: '/IMUAcceleration',
        messageType: 'rover_interface/msg/IMUData'
    });
    IMUGryroTopic = new ROSLIB.Topic({
        ros: ros,
        name: '/IMUGyro',
        messageType: 'rover_interface/msg/IMUData'
    });
    IMUMagnetTopic = new ROSLIB.Topic({
        ros: ros,
        name: '/IMUMagnet',
        messageType: 'rover_interface/msg/IMUData'
    });

    rosoutTopic = new ROSLIB.Topic({
        ros: ros,
        name: '/rosout',
        messageType: 'rcl_interfaces/msg/Log'
    })

    cameraTopic = new ROSLIB.Topic({
        ros: ros,
        name: '/zed0/zed_node/rgb/color/rect/image',
        messageType: 'sensor_msgs/msg/Image'
    });

    GPSTopic = new ROSLIB.Topic({
        ros: ros,
        name: '/GPSData',
        messageType: 'rover_interface/msg/GPSData'
    })
    waypointTopic = new ROSLIB.Topic({
        ros: ros,
        name: '/waypoints',
        messageType: 'rover_interface/msg/WaypointData'
    })

    waypointListTopic = new ROSLIB.Topic({
        ros: ros,
        name: '/waypoint_list',
        messageType: 'rover_interface/msg/WaypointList'
    })

    basestationStopSignalTopic = new ROSLIB.Topic({
        ros: localRos,
        name: '/base_station/stop_signal',
        messageType: 'std_msgs/Bool'
    });
    topicsToLog = [basestationHeartbeatTopic.name, roverHeartbeatTopic.name, IMUAngleTopic.name, IMUAccelerationTopic.name, IMUGryroTopic.name, IMUMagnetTopic.name, rosoutTopic.name, cameraTopic.name, GPSTopic.name, waypointTopic.name, waypointListTopic.name, basestationStopSignalTopic.name];
}

/**
 * @description intialize callback functions for when each topic receives a message
 */
function initRoverTopicSubscriptions() {
    basestationHeartbeatTopic.subscribe(function (message) {
        if (topicToLog == basestationHeartbeatTopic.name) {
            logMessage(message.data);
        }
    });

    roverHeartbeatTopic.subscribe(function (message) {
        if (!roverConnected) {
            window.alert("SUCCESS: Rover connected!");
        }
        roverConnected = true;
        lastRoverHeartbeat = 0;
        if (topicToLog == roverHeartbeatTopic.name) {
            logMessage(message.data);
        }
    });

    IMUAngleTopic.subscribe(function (message) {
        if (topicToLog == IMUAngleTopic.name) {
            logMessage('Status: ' + message.status + ' X: ' + message.x + ' Y: ' + message.y + ' Z: ' + message.z);
        }
    });

    IMUAccelerationTopic.subscribe(function (message) {
        if (topicToLog == IMUAccelerationTopic.name) {
            logMessage('Status: ' + message.status + ' X: ' + message.x + ' Y: ' + message.y + ' Z: ' + message.z);
        }
    });

    IMUGryroTopic.subscribe(function (message) {
        if (topicToLog == IMUGryroTopic.name) {
            logMessage('Status: ' + message.status + ' X: ' + message.x + ' Y: ' + message.y + ' Z: ' + message.z);
        }
    });
    IMUMagnetTopic.subscribe(function (message) {
        if (topicToLog == IMUMagnetTopic.name) {
            logMessage('Status: ' + message.status + ' X: ' + message.x + ' Y: ' + message.y + ' Z: ' + message.z);
        }
    });

    rosoutTopic.subscribe(function (message) {
        if (topicToLog == rosoutTopic.name) {
            logMessage(message.name + ' (' + message.level + ') from ' + message.function + ' (line: ' + message.line + '): ' + message.msg);
        }
    });

    GPSTopic.subscribe(function (message) {
        lat = message.latitude;
        long = message.longitude;
        positions.push([lat, long]);
        if (topicToLog == GPSTopic.name) {
            logMessage('Status: ' + message.status + ' Latitude: ' + message.latitude + ' Longitude: ' + message.longitude + ' Altitude: ' + message.altitude + ' Fix Quality: ' + message.fix_quality + ' Num Satellites: ' + message.num_satellites + ' hdop: ' + message.hdop + ' GeoID Separation: ' + message.geoid_separation);
        }
    });

    waypointTopic.subscribe(function (message) {
        if (topicToLog == waypointTopic.name) {
            logMessage('Name: ' + message.waypoint_name + ' Color: ' + message.waypoint_color + ' Latitude: ' + message.latitude + ' Longitude: ' + message.longitude);
        }
    });

    waypointListTopic.subscribe(function (message) {
        if (topicToLog == waypointListTopic.name) {
            var messageToLog = "";
            for (var i = 0; i < message.list_waypoints.length; i++) {
                messageToLog += 'Waypoint ' + (i + 1) + "\n" + 'Name: ' + message.list_waypoints[i].waypoint_name + ' Color: ' + message.list_waypoints[i].waypoint_color + ' Latitude: ' + message.list_waypoints[i].latitude + ' Longitude: ' + message.list_waypoints[i].longitude + '\n';
            }
            logMessage(messageToLog);
        }
    });
}

/**                                        
 * 
 * Section 3: Topic Logging
 * 
 */

/**
 * @description clears the logbox if full and then adds the message to the logbox with the time pre-ppended
 * 
 * @param {string} message message to add to the logbox
 */
function logMessage(message) {
    if (logBox.value.length > 6500) {
        logBox.value = "";
    }
    logBox.value += (new Date()).toLocaleString() + " " + message + "\n";
}

/**
 * @description queries a ROS service ever 5 seconds that gets all active topics, lists them, and adds buttons for existing topics that are in topicsToLog
 */
async function listTopics() {
    var buttons = [];
    var topics = "";

    // creates a service that queries the topics existing
    var getTopicsClient = new ROSLIB.Service({
        ros: ros,
        name: '/rosapi/topics',
        serviceType: 'rosapi/Topics'
    });
    var request;
    const topicListElement = document.getElementById("topicList");
    var button;
    const buttonsElement = document.getElementsByClassName("btns")[0];
    while (true) {

        request = new ROSLIB.ServiceRequest({}); // creates a new request for that service

        // removes all topic buttons from past service call and clears list
        for (let btn of buttons) btn.remove();
        buttons = [];

        // calls service and executes the function with the call's result
        getTopicsClient.callService(request, function (result) {
            topics = "";
            for (let topic of result.topics) {
                topics += topic + ", ";
                // creates a button for each topic that exists and should be logged, adding a callback that enables logging for that topic
                if (topicsToLog.includes(topic)) {
                    button = document.createElement("button");
                    button.onclick = () => topicClick(topic);
                    button.textContent = topic;
                    buttons.push(button);
                    buttonsElement.appendChild(button);
                }
            }
            topicListElement.textContent = topics.substring(0, topics.length - 2); // lists all topics comma-separated
        });
        await sleep(5000);
    }
}

/**
 * @description updates the selected topic display and updates topicToLog to allow logging for that topic
 * 
 * @param {string} topic name of topic to start logging for
 */
function topicClick(topic) {
    const topicDisplay = document.getElementById('topicDisplay');
    topicDisplay.textContent = "Selected Topic: ";
    logBox.value = "";
    topicToLog = topic;
    topicDisplay.textContent += topic;
}

/**                                        
 * 
 * Section 4: Heartbeat and Stop Signal Publishing
 * 
 */

/**
 * @description the base station publishing a stop signal on the base station's ROS websocket.
 * 
 * Stop Signal Values:
 * - True: the base station last got a heartbeat from the rover >= 2s ago -> popup alert and if rover can somehow still see the basestation it will safely stop
 * - False: the base station last got a heartbeat from the rover < 2s ago -> GOOD -> rover gets the go-ahead to not stop operations
 */
async function publishBasestationStopSignal() {
    while (true) {
        var msg;

        // the rover's last received heartbeat was >= 2s ago -> BAD (publish stop signal and popup alert)
        if (lastRoverHeartbeat >= 2000) {
            msg = new ROSLIB.Message({
                data: true
            });
            basestationStopSignalTopic.publish(msg);
            if (roverConnected) {
                roverConnected = false;
                window.alert("ERROR: Lost connection to rover!");
            }
        }
        // the rover's last received was < 2s ago -> GOOD (publish all clear)
        else {
            msg = new ROSLIB.Message({
                data: false
            });
            basestationStopSignalTopic.publish(msg);
        }
        lastRoverHeartbeat += 100;
        await sleep(100);
    }
}

/**
 * @description the base station publishing a heartbeat (a number that starts at 0 and increments by 1) on the rover's ROS websocket every 100ms.
 */
async function publishBasestationHeartbeat() {
    while (true) {
        var messageContent = "Base Station: " + basestationHeartbeat.toString();
        var msg = new ROSLIB.Message({
            data: messageContent
        });
        basestationHeartbeat++;
        basestationHeartbeatTopic.publish(msg);
        await sleep(100);
    }
}

/**                                        
 * 
 * Section 5: Map and Waypoints
 * 
 */

/**
 * @description create the map and its elements: tile-layer, rover circle, rover path; load stored waypoints, intialize callbacks and asynchronous functions to add waypoints and update the map
 */
function initMap() {
    // represents the rover's path
    trail = L.polyline([], {
        color: "blue"
    });

    // representing the rover's position
    circle = L.circle([lat, long], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: 2
    });
    // create the map
    map = L.map('map').setView([lat, long], 15);
    L.control.attribution({ prefix: false }).addTo(map);


    loadWaypoints().catch(console.error); // load waypoints from waypoints.yaml

    document.getElementById("nameBtn").addEventListener("click", addName); // add event listener to the submit button of the waypoint creation popup

    /**
     * START - Options for tile-layer, pick one and comment out others
     */

    // LOCAL UMD TESTING (COMMENT OUT OTHER OPTIONS)
    // zoomMax = 18;
    // L.tileLayer('./tile-layers/local_tiles_umd/{z}/{x}/{y}.png', { 
    //     minZoom: 14, 
    //     maxZoom: 18, 
    //     tms: false, 
    //     attribution: 'Created by QGIS' 
    // }).addTo(map);
    ////////////////////////////////////////////////////////////////

    // OPTION 1 FOR CIRC (COMMENT OUT OTHER OPTION)- My Recommendation, Higher Native Zoom (Slightly more blurry on all zooms), Large Area Coverage
    zoomMax = 18;
    L.tileLayer('./tile-layers/offline_world_imagery_circ/{z}/{x}/{y}.png', {
        minZoom: 15,
        maxNativeZoom: 18,
        maxZoom: 30,
        attribution: 'Esri World Imagery | Offline Cache',
        tms: false // Standard XYZ tile scheme
    }).addTo(map);
    ////////////////////////////////////////////////////////////////

    // OPTION 2 FOR CIRC (COMMENT OUT OTHER OPTION) - Lower Max Native Zoom (Slightly less blurry on all zooms), Smaller Area Coverage
    // zoomMax = 17;
    // L.tileLayer('./tile-layers/local_tiles_circ_zoom20/{z}/{x}/{y}.jpg', {
    //     minZoom: 15,
    //     maxNativeZoom: 17,
    //     maxZoom: 30,
    //     attribution: 'Esri World Imagery | Offline Cache',
    //     tms: false // Standard XYZ tile scheme
    // }).addTo(map);
    ///////////////////////////////////////////////////////////////

    // OPTION 3 FOR CIRC (COMMENT OUT OTHER OPTION) - Lower Max Native Zoom (Slightly less blurry on all zooms), Lowest Min Native Zoom, Largest Area Coverage
    // zoomMax = 17;
    // L.tileLayer('./tile-layers/local_tiles_circ/{z}/{x}/{y}.jpg', {
    //     minZoom: 10,
    //     maxNativeZoom: 17,
    //     maxZoom: 30,
    //     attribution: 'Esri World Imagery | Offline Cache',
    //     tms: false // Standard XYZ tile scheme
    // }).addTo(map);
    //////////////////////////////////////////////////////////////

    /**
     * END - Options for tile-layer, pick one and comment out others
     */

    map.on('zoomend', updateZoomLevel); // create callback for when the map's zoom is changed

    // Set the initial zoom level
    updateZoomLevel();

    // add rover position and trail to map
    circle.addTo(map);
    trail.addTo(map);
    circle.bringToFront();

    // create onclick callback to store the lat,long of the click and open the waypoint creation popup
    map.on('click', function (e) {
        mouseLat = e.latlng.lat;
        mouseLong = e.latlng.lng;
        waypointPopupElement.style.display = "flex";
    });

    // start asynchronous function to update the map every 100ms
    updateMap();
}

/**
 * @description callback function that is called everytime the map zoom changes and updates the text description
 */
function updateZoomLevel() {
    if (map.getZoom() > zoomMax) {
        // beyond native zoom means that the quality will be degraded (blurry) and will degrade further with each subsequent zoom
        document.getElementById("map-zoom").textContent = `Zoom: ${map.getZoom()} (Beyond Native)`;
    }
    else {
        // native zoom means there should be no quality degradation at this zoom level
        document.getElementById("map-zoom").textContent = `Zoom: ${map.getZoom()} (Native)`;
    }
}

/**
 * @description every 100ms: updates the rover's position and trail with current GPS data, focuses the map view to the rover's position
 */
async function updateMap() {
    while (true) {
        var newLatLng = L.latLng(lat, long);
        circle.setLatLng(newLatLng);
        map.setView([lat, long]); // Comment out to disable auto-focusing
        trail.setLatLngs(positions);
        await sleep(100);
    }
}

/**
 * @description loads and parses waypoints.yaml, creating, adding to map, and publishing the waypoint information inside
 * 
 * @throws Error('Failed to load YAML: ${response.status}) to initMap() (caller) which logs the error to console and continues
 */
async function loadWaypoints() {
    const response = await fetch("./waypoints.yaml");

    if (!response.ok) {
        throw new Error(`Failed to load YAML: ${response.status}`);
    }

    const text = await response.text();
    const doc = load(text); // load the yaml into a parseable doc using js-yaml's load()

    for (const waypoint of doc.waypoints) {
        addWaypoint(waypoint.waypoint_name, waypoint.waypoint_color, waypoint.waypoint_lat, waypoint.waypoint_long);
    }
}

/**
 * @description creates a waypoint and its label, adds both to the map, and publishes the waypoint info
 * 
 * @param {string} name name describing waypoint
 * @param {string} color hex code of color (with #) of waypoint
 * @param {float} latitude latitude of where waypoint is
 * @param {float} longitude longitude of where waypoint is
 */
function addWaypoint(name, color, lat, long) {
    // create the waypoint and add it to the map
    var waypointMapItem = L.circle([lat, long], {
        color: color,
        fillColor: color,
        fillOpacity: 0.5,
        radius: 4
    });
    waypointMapItem.addTo(map);

    // create the waypoint's label
    waypointMapItem.bindTooltip(name, {
        permanent: true,     // always visible
        direction: "right",  // position relative to marker
        offset: [10, 0]
    });

    // publish the waypoint
    publishWaypoint(name, color, lat, long);

}

/**
 * @description onclick callback method of the waypoint creation popup's submit button. creates the waypoint, adds it to map, and publishes its information.
 */
function addName() {
    addWaypoint(document.getElementsByClassName("waypointName")[0].value, document.getElementsByClassName("waypointColor")[0].value, mouseLat, mouseLong);
    document.getElementsByClassName("popup")[0].style.display = "none";
}

/**
 * @description publishes the current list of all waypoints, called each time a new waypoint is published
 */
function publishWaypointList() {
    var msg = new ROSLIB.Message({
        list_waypoints: waypointMessages
    });
    waypointListTopic.publish(msg);
}

/**
 * @description publishes the provided waypoint information to the waypoint topic
 * 
 * @param {string} name name describing waypoint
 * @param {string} color hex code of color (with #) of waypoint
 * @param {float} latitude latitude of where waypoint is
 * @param {float} longitude longitude of where waypoint is
 */
function publishWaypoint(name, color, latitude, longitude) {
    var msg = new ROSLIB.Message({
        waypoint_name: name,
        waypoint_color: color,
        latitude: latitude,
        longitude: longitude
    });
    waypointMessages.push(msg);
    publishWaypointList();
    waypointTopic.publish(msg);
}

/**
 * 
 * Section 7: Main Execution
 * 
 */

/**
 * @description main execution function, calls above asynchronous and synchronous functions
 */
function run() {
    initROSConnection(); // synchronous function
    initTopics(); // synchronous function
    initRoverTopicSubscriptions(); // synchronous function
    listTopics(); // asynchronous function
    publishBasestationStopSignal(); // asynchronous function
    publishBasestationHeartbeat(); // asynchronous function
    initMap(); // synchronous function
    simBattery(); // TESTING ONLY - asynchronous function
}

run();