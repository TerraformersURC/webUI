import * as THREE from 'three';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
// import {IMUX, IMUY, IMUZ, setIMU} from './globalVariables.js';
const scene = new THREE.Scene();
scene.background = new THREE.Color("#0f172a");
// const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const parent = document.getElementsByClassName("sim")[0];
const camera = new THREE.PerspectiveCamera(75, parent.clientWidth / parent.clientHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
// renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setSize(parent.clientWidth, parent.clientHeight);

parent.appendChild(renderer.domElement);

// const geometry = new THREE.BoxGeometry(1, 1, 1);
// const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
// const cube = new THREE.Mesh(geometry, material);
// scene.add(cube);

camera.position.z = 7;
camera.position.x = 0.8;
camera.position.y = -1;

var mesh;
const loader = new STLLoader();
var IMUX = -1;
var IMUY = -1;
var IMUZ = -1;
function loadMesh(){

    loader.load('./model.stl', function (geometry) {
        const material = new THREE.MeshNormalMaterial();
        // const color = new THREE.Color("rgb(128,128,128)");
        // material.color.set(color);
        mesh = new THREE.Mesh(geometry, material);
        mesh.scale.set(0.005, 0.005, 0.005); 
        scene.add(mesh);
    });
}
var x = -90;
var y = 0;
var z = 0;
// const imuChannel = new BroadcastChannel('imu');
// imuChannel.onmessage = e => {
//     setIMU(e.data.x, e.data.y, e.data.z);
// };

function animate(time) {
    if (mesh){
        mesh.rotation.x =  -1*IMUX * Math.PI/180;
        mesh.rotation.y = -1*IMUY * Math.PI/180;
        mesh.rotation.z = IMUZ * Math.PI/180;
        // mesh.rotation.y = time / 2000;
        // mesh.rotation.z = time / 2000;
        renderer.render(scene, camera);
    }

}

function main(){
    loadMesh();
    renderer.setAnimationLoop(animate);

}

var ros;
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


function subscribeIMU(){
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

connect();
subscribeIMU();
main();