function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
var ros;
function connect() {
    // url: 'ws://localhost:9090'
    ros = new ROSLIB.Ros({
        url: 'ws://192.168.1.4:9090'
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


// function subscribeIMU(){
//     var imuAngleSub = new ROSLIB.Topic({
//         ros: ros,
//         name: '/IMUAngle',
//         messageType: 'rover_interface/msg/IMUData'
//     });
//     imuAngleSub.subscribe(function (message) {
//         IMUX = message.x;
//         IMUY = message.y;
//         IMUZ = message.z;

//     });
// }
// window.setControl = setControl;
// const channel = new BroadcastChannel('controls_channel');
function setControl(controlID){
    if (controlID == 0){
        controlStates.toggle1_ ^= 1;
    }
    else if (controlID == 1){
        controlStates.toggle2_ ^= 1; // flips between 0 and 1
    }
    else if (controlID == 2){
        controlStates.toggle3_ ^= 1; // flips between 0 and 1
    }
    else if (controlID == 3){
        controlStates.toggle4_ ^= 1; // flips between 0 and 1
    }
    else if (controlID == 4){
        controlStates.toggle5_ ^= 1; // flips between 0 and 1
    }
    else if (controlID == 5){
        controlStates.toggle6_ ^= 1; // flips between 0 and 1
    }
    else if (controlID == 6){
        controlStates.drivetrain_fwd_ = 1;
        setTimeout(() => {
            controlStates.drivetrain_fwd_ = 0;
        }, 50);
    }
    else if (controlID == 7){
        controlStates.drivetrain_left_ = 1;
        setTimeout(() => {
            controlStates.drivetrain_left_ = 0;
        }, 50);
    }
    else if (controlID == 8){
        controlStates.drivetrain_right_ = 1;
        setTimeout(() => {
            controlStates.drivetrain_right_ = 0;
        }, 50);
    }
    else if (controlID == 9){
        controlStates.drivetrain_rev_ = 1;
        setTimeout(() => {
            controlStates.drivetrain_rev_ = 0;
        }, 50);
    }
    else if (controlID == 10){
        controlStates.arm_up_ = 1;
        setTimeout(() => {
            controlStates.arm_up_ = 0;
        }, 50);
    }
    else if (controlID == 11){
        controlStates.arm_left_ = 1;
        setTimeout(() => {
            controlStates.arm_left_ = 0;
        }, 50);
    }
    else if (controlID == 12){
        console.log("ARM RIGHT");
        controlStates.arm_right_ = 1;
        setTimeout(() => {
            controlStates.arm_right_ = 0;
        }, 50);
    }
    else if (controlID == 13){
        controlStates.arm_down_ = 1;
        setTimeout(() => {
            controlStates.arm_down_ = 0;
        }, 50);
    }
    else if (controlID == 14){
        controlStates.arm_rev_ = 1;
        setTimeout(() => {
            controlStates.arm_rev_ = 0;
        }, 50);
    }
    else if (controlID == 15){
        controlStates.arm_grab_ = 1;
        setTimeout(() => {
            controlStates.arm_grab_ = 0;
        }, 50);
    }
    else if (controlID == 16){
        controlStates.arm_fwd_ = 1;
        setTimeout(() => {
            controlStates.arm_fwd_ = 0;
        }, 50);
    }
}
async function publishControls(){
    while (true){
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
connect();
publishControls();
// subscribeIMU();