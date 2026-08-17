/**
 * @file controls.js
 * Robotics @ Maryland - Terraformers Software
 * 
 * @description This contains functions and variables to run controls.html (controls system and 3D rendering)
 * 
 * @author Leo Abubucker
 * Sub-Team: User Interface
 * Contact: Leo Abubucker (leokumar@outlook.com)
 * 
 * Last Modified: 08-17-2026 (MM-DD-YYYY)
 */

// import shared functions and constants
import { updateBattery, simBattery, sleep, ROVER_WEBSOCKET_URL, BASESTATION_WEBSOCKET_URL } from "./helper.js";

// imports for 3D model rendering
import * as THREE from 'three';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';

/**                                        
 * 
 * Section 0: Global Variable Declarations
 * 
 */

// for rendering and animating 3D model
const scene = new THREE.Scene();
const parent = document.getElementsByClassName("sim")[0];
const camera = new THREE.PerspectiveCamera(75, parent.clientWidth / parent.clientHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
var mesh;
const loader = new STLLoader();

// to store current IMU angles to update 3D model angles
var IMUX = -1;
var IMUY = -1;
var IMUZ = -1;

// connection to ROS websocket
var ros = null;

// message 
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

/**
 * 
 * Section 1: ROS Setup and Publishing
 * 
 */

/**
 * @description initialize connection to rover's websocket
 */
function initROSConnection() {
    ros = new ROSLIB.Ros({
        url: ROVER_WEBSOCKET_URL
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

/**
 * @description onclick function for pressing a control button, window.setControl allows the html to access this function as the file is imported as a module
 * 
 * @param {int} controlID number ID correlating to button pressed
 * 
 * @todo FIX non-toggle switches as the delays currently don't align with publishing delays so inconsistencies exist
 * @todo optimize logic to reduce function size
 */
window.setControl = function setControl(controlID) {
    if (controlID == 0) {
        controlStates.toggle1_ ^= 1;
    }
    else if (controlID == 1) {
        controlStates.toggle2_ ^= 1; // flips between 0 and 1
    }
    else if (controlID == 2) {
        controlStates.toggle3_ ^= 1; // flips between 0 and 1
    }
    else if (controlID == 3) {
        controlStates.toggle4_ ^= 1; // flips between 0 and 1
    }
    else if (controlID == 4) {
        controlStates.toggle5_ ^= 1; // flips between 0 and 1
    }
    else if (controlID == 5) {
        controlStates.toggle6_ ^= 1; // flips between 0 and 1
    }
    else if (controlID == 6) {
        controlStates.drivetrain_fwd_ = 1;
        setTimeout(() => {
            controlStates.drivetrain_fwd_ = 0;
        }, 50);
    }
    else if (controlID == 7) {
        controlStates.drivetrain_left_ = 1;
        setTimeout(() => {
            controlStates.drivetrain_left_ = 0;
        }, 50);
    }
    else if (controlID == 8) {
        controlStates.drivetrain_right_ = 1;
        setTimeout(() => {
            controlStates.drivetrain_right_ = 0;
        }, 50);
    }
    else if (controlID == 9) {
        controlStates.drivetrain_rev_ = 1;
        setTimeout(() => {
            controlStates.drivetrain_rev_ = 0;
        }, 50);
    }
    else if (controlID == 10) {
        controlStates.arm_up_ = 1;
        setTimeout(() => {
            controlStates.arm_up_ = 0;
        }, 50);
    }
    else if (controlID == 11) {
        controlStates.arm_left_ = 1;
        setTimeout(() => {
            controlStates.arm_left_ = 0;
        }, 50);
    }
    else if (controlID == 12) {
        controlStates.arm_right_ = 1;
        setTimeout(() => {
            controlStates.arm_right_ = 0;
        }, 50);
    }
    else if (controlID == 13) {
        controlStates.arm_down_ = 1;
        setTimeout(() => {
            controlStates.arm_down_ = 0;
        }, 50);
    }
    else if (controlID == 14) {
        controlStates.arm_rev_ = 1;
        setTimeout(() => {
            controlStates.arm_rev_ = 0;
        }, 50);
    }
    else if (controlID == 15) {
        controlStates.arm_grab_ = 1;
        setTimeout(() => {
            controlStates.arm_grab_ = 0;
        }, 50);
    }
    else if (controlID == 16) {
        controlStates.arm_fwd_ = 1;
        setTimeout(() => {
            controlStates.arm_fwd_ = 0;
        }, 50);
    }
}

/**
 * @description publishes the current states of controls ever 100ms
 */
async function publishControls() {
    var topic = new ROSLIB.Topic({
        ros: ros,
        name: '/controls',
        messageType: 'rover_interface/msg/UI'
    });
    var msg;
    while (true) {
        msg = new ROSLIB.Message({
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

/**
 * @description creates a subscription to /IMUAngle to update the 3D model in real-time
 */
function initIMUSubscription() {
    var imuAngleSub = new ROSLIB.Topic({
        ros: ros,
        name: '/IMUAngle',
        messageType: 'rover_interface/msg/IMUData'
    });
    imuAngleSub.subscribe(function (message) {
        IMUX = message.x;
        IMUY = message.y;
        IMUZ = message.z;
    });
}

/**
 * 
 * Section 2: 3D Rendering and Animation
 * 
 */

/**
 * @description loads the model.stl file and adds it to the scene
 */
function loadMesh() {

    loader.load('./model.stl', function (geometry) {
        const material = new THREE.MeshNormalMaterial();
        mesh = new THREE.Mesh(geometry, material);
        mesh.scale.set(0.005, 0.005, 0.005);
        scene.add(mesh);
    });
}

/**
 * @description animates the model based on the current IMU angles and renders it
 */
function animate() {
    if (mesh) {
        mesh.rotation.x = -1 * IMUX * Math.PI / 180;
        mesh.rotation.y = -1 * IMUY * Math.PI / 180;
        mesh.rotation.z = IMUZ * Math.PI / 180;
        renderer.render(scene, camera);
    }
}

/**
 * @description initialize the scene and renderer, start the animation loop
 */
function initSim() {
    scene.background = new THREE.Color("#0f172a");
    renderer.setSize(parent.clientWidth, parent.clientHeight);
    parent.appendChild(renderer.domElement);
    camera.position.z = 7;
    camera.position.x = 0.8;
    camera.position.y = -1;
    loadMesh();
    renderer.setAnimationLoop(animate);
}

/**
 * 
 * Section 3: Main Execution
 * 
 */

/**
 * @description main execution function, calls above asynchronous and synchronous functions
 */
function run() {
    initROSConnection(); // synchronous function
    publishControls(); // asynchronous function
    simBattery(); // TESTING ONLY - asynchronous function
    initIMUSubscription(); // synchronous function
    initSim(); // synchronous function
}

run();