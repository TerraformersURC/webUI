let battery = 100;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function simBattery() {
    while (battery > 0) {
        battery -= 0.1;
        await sleep(100);
    }
}

async function batteryColor() {
    const batteryBox = document.getElementsByClassName("batteryBox")[0];
    const batteryText = document.getElementsByClassName("batteryPercent")[0];
    while (battery > 0) {
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
        else if (battery < 15){
            batteryText.style.fontSize = "smaller";
        }
        await sleep(1000);
    }
}

function run() {
    simBattery();
    batteryColor();
}

run();