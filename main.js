import * as THREE from "three";
import overlayController from "./classes/overlayController";
import generateArea from "./classes/generateArea";
import characterGenerator from "./classes/characterGenerator";
import { io } from "socket.io-client";
import { v4 as uuid } from "uuid";

// list of all the connected players!
const peerControllerPlayers = new Array();

// socket connection!
// const socket = io.connect("https://4c63-2407-d000-403-51f9-408d-6f08-3121-6cda.ngrok-free.app/", {
  const socket = io.connect("http://localhost:8000/", {
  withCredentials: true,
  extraHeaders: {
    "my-custom-header": "abcd",
  },
});

// overlay handler, i.e modals, popups, etc.
const overlayHandler = new overlayController(window, socket);

// to control modals etc.. globally.
// Must be changed to something better.
window.overlayHandler = overlayHandler;

// setting your game id globally!
// must be converted to a better solution.
window.yourId = uuid();
// Initially needs to be null,
// populates after user sets a name!
window.yourName = null;

// tells the server that you have left
// before the page refreshes or quits.
// Must be handled in a class.
window.onbeforeunload = () => {
  socket.emit("player:leave", window.yourId);
};

// the area handler.
// i.e the ground plane, skybox, trees, ammo boxes etc..
const areaHandler = new generateArea(
  {
    ground: "../textures/ground/ground.jpg",
    skyBox: [
      "../skybox/sunny/back.jpg",
      "../skybox/sunny/front.jpg",
      "../skybox/sunny/top.jpg",
      "../skybox/sunny/bottom.jpg",
      "../skybox/sunny/right.jpg",
      "../skybox/sunny/left.jpg",
    ],
  },
  document
);

// initial Join room screen, ONLY player should load AFTER that
// the reset of the screen must be loaded before!
overlayHandler.displayWelcomeModal((playerName, selectedColor) => {
  window.yourName = playerName;
  overlayHandler.displaySuccessToastToAllUsers(playerName + " has joined!");
  // Initialize.
  // your game boy, i.e the one you control.
  const controllableCharacter = new characterGenerator(
    true,
    areaHandler,
    selectedColor,
    window.yourId,
    window.yourName,
    // on player's modal load.
    () => {
      // Since it was your character, you need to update its controls..
      areaHandler.appendInAnimationLoop(controllableCharacter.updateControls);
      // Once modal's and all are loaded, go for the emission that you have joined!
      socket.emit("player:joined", {
        id: window.yourId,
        playerName: window.yourName,
        color: selectedColor,
      });
    },
    // on mouse move by the player
    ({ movementX, movementY }) => {
      socket.emit("player:mouse-move", {
        id: window.yourId,
        movementX,
        movementY,
      });
    },
    // on keys change by the player
    (pressedKeys, currentKey) => {
      socket.emit("player:keys-move", {
        id: window.yourId,
        pressedKeys,
        currentKey,
      });
    },
    // on click by the player
    (ev) => {
      const intersectedObjects = areaHandler.checkForIntersection();
      if (intersectedObjects.length > 0) {
        intersectedObjects.map((ints) => {
          const victim = peerControllerPlayers.filter(
            (peerPlayer) =>
              ints.object.userData.identifier === peerPlayer.identifier
          )[0];
          if (victim && victim.identifier) {
            socket.emit("player:shot", {
              id: window.yourId,
              playerName: window.yourName,
              shotUser: victim.identifier,
            });
          }
        });
      }
    }
    // ---------------------------------------------------
    // Todo: instead of different callbacks,             |
    // one single callback must be fired, i.e.           |
    // if click is pressed -> { event: 'click' }         |
    // if mouse is moved -> { event: 'mouse-move' }, etc.|
    // ---------------------------------------------------
  );
});

// Emitted once a connected player has shot!
socket.on("player:shot", ({ shotUser, playerName, id }) => {
  // play gun sound!
  if (shotUser == window.yourId) {
    overlayHandler.displayWarnToastToAllUsers(
        playerName + " was shot by " + "xyz"
    );
    overlayHandler.displayDeathOverlay("a ray", 10000, () => {
      window.location.reload();
    });
    areaHandler.appendInAnimationLoop(() => {
      let killerPos = peerControllerPlayers
        .find((player) => player.identifier === id)
        .getPeerControlledPlayer().modelAnchor.position;
      areaHandler.camera.lookAt(killerPos);
    });
  }
});

// Generate Already existing players in the room!
socket.on("players:list", ({ list, identity }) => {

  console.log('players:list', list, peerControllerPlayers);

  if (window.yourId === identity) {
    list.map(({ id, color, playerName, coordsX, coordsY }) => {

      // CHeck if id exists in already created players
      const searchForAlreadyExisting = peerControllerPlayers.filter(pcPlayer => pcPlayer.id === id);
      if(searchForAlreadyExisting.length > 0) { // i.e. if the search for already existing player resulted that this player already exists. (Greater than 0 length)
        const targetNPC = new characterGenerator(
          false,
          areaHandler,
          color,
          id,
          playerName,
          () => {},
          // We should not emit events from npc.
          () => {},
          () => {},
          () => {}
        );
        areaHandler.appendInAnimationLoop(targetNPC.updatePeerControls);
        peerControllerPlayers.push(targetNPC);
      }
    });
  }
});

// Emitted once a new user joins the room!
socket.on("player:joined", ({ id, color, playerName }) => {
  const targetNPC = new characterGenerator(
    false,
    areaHandler,
    color,
    id,
    playerName,
    () => {},
    // We should not emit events from npc.
    () => {},
    () => {},
    () => {}
  );
  areaHandler.appendInAnimationLoop(targetNPC.updatePeerControls);
  peerControllerPlayers.push(targetNPC);
});

// Emiited once a player leaves the room
// IMPLEMENTATION still required.
socket.on("player:leave", ({ userLeftId }) => {
  peerControllerPlayers
    .find((player) => player.identifier == userLeftId)
    .getPeerControlledPlayer()
    .removeUser();
});

// Emiited once a player moves their mouse
socket.on("player:mouse-move", ({ movementX, movementY, id }) => {
  const targetedNPC = peerControllerPlayers.filter(
    (player) => player.identifier == id
  )[0];
  if (targetedNPC) targetedNPC.updatePeerMouse({ movementX, movementY });
});

// Emiited once a player press their keys.
socket.on("player:keys-move", ({ pressedKeys, currentKey, id }) => {
  const targetedNPC = peerControllerPlayers.filter(
    (player) => player.identifier == id
  )[0];
  if (targetedNPC) targetedNPC.updatePeerKeyboard(pressedKeys, currentKey);
  else console.log(peerControllerPlayers);
});

// The heart of the loop.
// try adding static functions here
// otherwise use areaHandlers.appendInAnimationLoop()
// for dynamic changes.
areaHandler.animation(() => {
  // Optionally put anything in the loop
});
