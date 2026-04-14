// import {setControl} from "./globalVariables.js";
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

// window.setControl = setControl;
const channel = new BroadcastChannel('controls_channel');
function setControl(controlID){
    if (controlID == 0){
        controlStates.toggle1_ ^= 1;
        // console.log("on ", controlStates.toggle1_);
        channel.postMessage({state: controlStates})
        // setTimeout(() => {
        //     controlStates.toggle1_ = 0;
        //     // console.log("off     ", controlStates.toggle1_);
        // }, 50);
    }
    else if (controlID == 1){
        controlStates.toggle2_ ^= 1; // flips between 0 and 1
        channel.postMessage({state: controlStates})
    }
    else if (controlID == 2){
        controlStates.toggle3_ ^= 1; // flips between 0 and 1
        channel.postMessage({state: controlStates})
    }
    else if (controlID == 3){
        controlStates.toggle4_ ^= 1; // flips between 0 and 1
        channel.postMessage({state: controlStates})
    }
    else if (controlID == 4){
        controlStates.toggle5_ ^= 1; // flips between 0 and 1
        channel.postMessage({state: controlStates})
    }
    else if (controlID == 5){
        controlStates.toggle6_ ^= 1; // flips between 0 and 1
        channel.postMessage({state: controlStates})
    }
    else if (controlID == 6){
        controlStates.drivetrain_fwd_ = 1; // flips between 0 and 1
        channel.postMessage({state: controlStates})
        setTimeout(() => {
            controlStates.drivetrain_fwd_ = 0;
        }, 50);
    }
    else if (controlID == 7){
        controlStates.drivetrain_left_ = 1; // flips between 0 and 1
        channel.postMessage({state: controlStates})
        setTimeout(() => {
            controlStates.drivetrain_left_ = 0;
        }, 50);
    }
    else if (controlID == 8){
        controlStates.drivetrain_right_ = 1; // flips between 0 and 1
        channel.postMessage({state: controlStates})
        setTimeout(() => {
            controlStates.drivetrain_right_ = 0;
        }, 50);
    }
    else if (controlID == 9){
        controlStates.drivetrain_rev_ = 1; // flips between 0 and 1
        channel.postMessage({state: controlStates})
        setTimeout(() => {
            controlStates.drivetrain_rev_ = 0;
        }, 50);
    }
    else if (controlID == 10){
        controlStates.arm_up_ = 1; // flips between 0 and 1
        channel.postMessage({state: controlStates})
        setTimeout(() => {
            controlStates.arm_up_ = 0;
        }, 50);
    }
    else if (controlID == 11){
        controlStates.arm_left_ = 1; // flips between 0 and 1
        channel.postMessage({state: controlStates})
        setTimeout(() => {
            controlStates.arm_left_ = 0;
        }, 50);
    }
    else if (controlID == 12){
        console.log("ARM RIGHT");
        controlStates.arm_right_ = 1; // flips between 0 and 1
        channel.postMessage({state: controlStates})
        setTimeout(() => {
            controlStates.arm_right_ = 0;
        }, 50);
    }
    else if (controlID == 13){
        controlStates.arm_down_ = 1; // flips between 0 and 1
        channel.postMessage({state: controlStates})
        setTimeout(() => {
            controlStates.arm_down_ = 0;
        }, 50);
    }
    else if (controlID == 14){
        controlStates.arm_rev_ = 1; // flips between 0 and 1
        channel.postMessage({state: controlStates})
        setTimeout(() => {
            controlStates.arm_rev_ = 0;
        }, 50);
    }
    else if (controlID == 15){
        controlStates.arm_grab_ = 1; // flips between 0 and 1
        channel.postMessage({state: controlStates})
        setTimeout(() => {
            controlStates.arm_grab_ = 0;
        }, 50);
    }
    else if (controlID == 16){
        controlStates.arm_fwd_ = 1; // flips between 0 and 1
        channel.postMessage({state: controlStates})
        setTimeout(() => {
            controlStates.arm_fwd_ = 0;
        }, 50);
    }
}

async function updateStates(){
    while (true){
        channel.postMessage({state: controlStates})
        await(sleep(100));
        // resetStates();
    }
}
async function resetStates() {
    // await(sleep())
    Object.keys(controlStates).forEach(key => controlStates[key] = 0);
}
updateStates();
    // controlStates.toggle1_ = 1;
