import * as THREE from 'three';
import modalController from './classes/modalsController';
import generateArea from './classes/generateArea';
import characterGenerator from './classes/characterGenerator';
import { io } from 'socket.io-client';
import { v4 as uuid } from 'uuid';

const peerControllerPlayers = new Array();

const socket = io.connect("http://192.168.100.14:8000", {
  withCredentials: true,
  extraHeaders: {
    "my-custom-header": "abcd",
  },
});

const modalHandler = new modalController(document);
modalHandler.displayWelcomeModal();

const areaHandler = new generateArea({
    ground: '../textures/ground/ground.jpg',
    skyBox: [
        '../skybox/sunny/back.jpg',
        '../skybox/sunny/front.jpg',
        '../skybox/sunny/top.jpg',
        '../skybox/sunny/bottom.jpg',
        '../skybox/sunny/right.jpg',
        '../skybox/sunny/left.jpg'
    ]
}, document)

const colors = [
    0x00ff00,
    0x0000ff,
    0xff0000
]
const selectedColor = colors[Math.trunc(Math.random()*colors.length)];
window.yourId = uuid();
const controllableCharacter = new characterGenerator(true,
    areaHandler,
    selectedColor,
    window.yourId,
    () => {
        // Since it was your character, you need to update its controls..
        areaHandler.appendInAnimationLoop(controllableCharacter.updateControls);
        // Once modal's and all are loaded, go for the emission that you have joined!
        socket.emit('player:joined', {
            id: window.yourId,
            color: selectedColor
        })
    },
    ({movementX, movementY}) => {
        socket.emit('player:mouse-move', {
            id: window.yourId,
            movementX,
            movementY
        })
    },
    (pressedKeys, currentKey) => {
        socket.emit('player:keys-move', {
            id: window.yourId,
            pressedKeys,
            currentKey
        })
    }
);

// Generate Already existing players in the room! 
socket.on('players:list', ({list, identity}) => {
    if(window.yourId === identity) {
        list.map(({id, color}) => {
            const targetNPC = new characterGenerator(
                false,
                areaHandler,
                color,
                id, 
                () => {},
                // We should not emit events from npc.
                () => {},
                () => {}
            );
            areaHandler.appendInAnimationLoop(targetNPC.updatePeerControls);
            peerControllerPlayers.push(targetNPC);
        })
    }
})

socket.on('player:joined', ({ id, color }) => {
    const targetNPC = new characterGenerator(
        false,
        areaHandler,
        color,
        id, 
        () => {},
        // We should not emit events from npc.
        () => {},
        () => {}
    );
    areaHandler.appendInAnimationLoop(targetNPC.updatePeerControls);
    peerControllerPlayers.push(targetNPC);
})
 
window.onbeforeunload = () => {
    socket.emit('player:leave', window.yourId)
}

socket.on('player:mouse-move', ({movementX, movementY, id}) => {
    const targetedNPC = peerControllerPlayers.filter((player) => player.identifier == id)[0]
    if(targetedNPC)
    targetedNPC.updatePeerMouse({movementX, movementY});
})

socket.on('player:keys-move', ({pressedKeys, currentKey, id}) => {
    const targetedNPC = peerControllerPlayers.filter((player) => player.identifier == id)[0]
    if(targetedNPC)
    targetedNPC.updatePeerKeyboard(pressedKeys, currentKey);
    else console.log(peerControllerPlayers);
})

areaHandler.animation(() => {
    // Optionally put anything in the loop
})