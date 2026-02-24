export let IMUX = -1;
export let IMUY = -1;
export let IMUZ = -1;
export function setIMU(x, y, z) {
    console.log("LOG" + x + " " + y + " " + z);
    IMUX = x;
    IMUY = y;
    IMUZ = z;
}