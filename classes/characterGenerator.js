import * as THREE from 'three';
import CharacterController from "./playerController";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import PeerController from './PeerController';

class characterGenerator {
    constructor(isControllable, areaHandler, color, identifier, modalLoadCallBack, msCb, kbCb, fireCb) {
        this.controller;
        this.peerController = null;
        this.isControllable = isControllable;
        this.color = color;
        this.identifier = identifier;
        this.modalLoadCallBack = modalLoadCallBack;
        this.areaHandler = areaHandler;

        this.fireCallback = fireCb;

        this.mouseCallBack = msCb;
        this.keyboardCallBack = kbCb;

        this._loadModal('../models/box_man.glb');
    }

    _loadModal = (path) => {
        this.loader = new GLTFLoader();
        this.loader.load( path, ( gltf ) => {

            gltf.scene.traverse((node) => {
                node.userData = { ...node.userData, identifier: this.identifier }
            });
            // enable model's shadows completely!
            gltf.scene.traverse( function( children ) { if ( children instanceof THREE.Mesh ) { children.castShadow = true; } } );
            gltf.scene.traverse( function( children ) { if ( children instanceof THREE.Mesh ) { children.receiveShadow = true; } } );

            if(this.isControllable) {
                let anchorPoint = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1, 0.1, 0.1, 0.1), new THREE.MeshBasicMaterial({color: 0x0000FF }));
                // a litte above the ground.
                anchorPoint.position.y = 0.5;
                anchorPoint.add(this.areaHandler.camera);
                anchorPoint.add(gltf.scene)
                anchorPoint.name = 'anchor-point';
                this.areaHandler.scene.add( anchorPoint );
                this.controller = new CharacterController(gltf, .025, anchorPoint, this.areaHandler.camera, this.mouseCallBack, this.keyboardCallBack, this.fireCallback);
            } else {
                // handle Peer Controlled logic.
                let anchorPoint = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1, 0.1, 0.1, 0.1), new THREE.MeshBasicMaterial({color: 0x0000FF }));
                anchorPoint.position.y = 0.5;
                anchorPoint.add(gltf.scene);

                // Create a sprite material
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                context.font = 'Bold 50px Arial';
                context.fillStyle = 'white';
                context.fillText('username', 0, 50); // Replace 'Hello' with your desired text

                const spriteTexture = new THREE.CanvasTexture(canvas);
                const spriteMaterial = new THREE.SpriteMaterial({ map: spriteTexture });

                // Create a sprite
                const nameTag = new THREE.Sprite(spriteMaterial);
                nameTag.scale.set(1, 0.5, 0.5); // Adjust the scale as needed
                nameTag.position.y = 1;
                // Add the sprite to the scene
                anchorPoint.add(nameTag);
                this.areaHandler.scene.add( anchorPoint );
                this.peerController = new PeerController(gltf, .025, anchorPoint);
            }
            
            // Done loading!.
            this.modalLoadCallBack();
        }, undefined, function ( error ) {
            console.error( error );
        } );
    }

    updateControls = () => {
        if(this.controller.updateControls) {
            this.controller.updateControls();
        }
    }

    updatePeerControls = () => {
        if(this.peerController && this.peerController.updateControls) {
            this.peerController.updateControls();
        }
    }

    getPeerControlledPlayer = () => {
        if(this.peerController)
        return this.peerController;
        return false;
    }

    updatePeerKeyboard = (pressedKeys, currentKey) => {
        console.log(pressedKeys, currentKey);
        this.peerController.keyboardChange(pressedKeys, currentKey);
    }

    updatePeerMouse = ({movementX, movementY}) => {
        this.peerController.mouseChange({movementX, movementY})
    }
}
export default characterGenerator;