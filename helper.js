/**
 * @file helper.js
 * Robotics @ Maryland - Terraformers Software
 * 
 * @description This contains functions and variables shared between multiple html files
 * 
 * @author Leo Abubucker
 * Sub-Team: User Interface
 * Contact: Leo Abubucker (leokumar@outlook.com)
 * 
 * Last Modified: 08-17-2026 (MM-DD-YYYY)
 */

/**                                        
 * 
 * Section 0: Global Variable Declarations
 * 
 */

export const ROVER_WEBSOCKET_URL = 'ws://localhost:9090'; // when rover ROS is running on jetson: ws://192.168.1.4:9090, when rover ROS is running locally: ws://localhost:9090
export const BASESTATION_WEBSOCKET_URL = 'ws://localhost:9090'; // always: ws://localhost:9090

/**                                        
 * 
 * Section 1: Battery Display
 * 
 */

/**
 * @description updates the identified html elements in text content, text size, width, and color based on the parameter battery
 * 
 * @param {float} battery battery level to update html elements based off of
 */
export function updateBattery(battery) {
    const batteryText = document.getElementsByClassName("batteryPercent")[0];
    const batteryBox = document.getElementsByClassName("batteryBox")[0];
    batteryBox.style.width = (battery / 100) * 10 + "vw";
    batteryText.textContent = Math.round((battery + Number.EPSILON) * 100) / 100 + "%";
    if (battery > 80) {
        batteryBox.style.backgroundColor = "lime";
    } else if (battery > 40) {
        batteryBox.style.backgroundColor = "orange";
    } else {
        batteryBox.style.backgroundColor = "red";
        batteryText.style.fontSize = "x-large";
    }
    if (battery < 25) {
        batteryText.style.fontSize = "medium";
    }
    else if (battery < 15) {
        batteryText.style.fontSize = "smaller";
    }
}

/**
 * @description a TESTING function to simulate battery level that will be replaced by a subscription to a rover battery topic
 */
export async function simBattery() {
    var battery = 100;
    while (battery > 0) {
        battery -= 0.1;
        updateBattery(battery);
        await sleep(100);
    }
}

/**                                        
 * 
 * Section 2: Miscellaneous Functions
 * 
 */

/**
 * @description sleeps for the provided time
 * 
 * @param {int} ms miliseconds to sleep (1s = 1000ms)
 * 
 * @returns a Promise that times out for the parameter ms and can be awaited on
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

