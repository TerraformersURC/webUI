/**
 * Connects to the ZED WebRTC signaling server on the Jetson and renders
 * the incoming video stream in the #camera-feed <video> element.
 *
 * Replaces the old web_video_server / MJPEG <img> approach. GPS, drive,
 * arm control, and all other roslib.js-based functionality in this UI
 * are untouched by this file.
 */

// const SIGNALING_URL = "ws://192.168.1.20:8081";

let signalingSocket = null;
let peerConnection = null;
import {SIGNALING_URL} from "./helper.js";

function connectSignaling() {
    signalingSocket = new WebSocket(SIGNALING_URL);

    signalingSocket.onopen = () => {
        console.log("Connected to signaling server.");
    };

    signalingSocket.onmessage = async (event) => {
        const msg = JSON.parse(event.data);
        console.log("Signaling message received:", msg.type);

        if (msg.type === "offer") {
            console.log("Received offer, sdp length:", msg.sdp.length);
            try {
                await handleOffer(msg.sdp);
            } catch (e) {
                console.error("handleOffer threw:", e);
            }
        } else if (msg.type === "ice_candidate") {
            if (peerConnection) {
                try {
                    await peerConnection.addIceCandidate({
                        candidate: msg.candidate,
                        sdpMid: msg.mid
                    });
                } catch (e) {
                    console.error("Error adding remote ICE candidate:", e);
                }
            }
        } else if (msg.type === "camera_switched") {
            console.log("Camera switched to:", msg.camera);
        }
    };

    signalingSocket.onerror = (event) => {
        console.error("Signaling error:", event);
    };

    signalingSocket.onclose = (event) => {
        console.log("Signaling connection closed. Code:", event.code, "Reason:", event.reason, "Clean:", event.wasClean);
        setTimeout(connectSignaling, 3000);
    };
}

async function handleOffer(sdp) {
    peerConnection = new RTCPeerConnection();

    peerConnection.oniceconnectionstatechange = () => {
        console.log("Browser ICE state:", peerConnection.iceConnectionState);
    };
    peerConnection.onconnectionstatechange = () => {
        console.log("Browser connection state:", peerConnection.connectionState);
    };
    peerConnection.ontrack = (event) => {
        console.log("Track received:", event.track.kind, "streams:", event.streams.length);
        const el = document.getElementById("camera-feed");
        el.srcObject = (event.streams && event.streams[0]) || new MediaStream([event.track]);
        el.play().catch(e => console.warn("play() rejected:", e));
    };

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            signalingSocket.send(JSON.stringify({
                type: "ice_candidate",
                candidate: event.candidate.candidate,
                mid: event.candidate.sdpMid
            }));
        }
    };

    await peerConnection.setRemoteDescription({ type: "offer", sdp: sdp });

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    signalingSocket.send(JSON.stringify({
        type: "answer",
        sdp: peerConnection.localDescription.sdp
    }));
}

connectSignaling();