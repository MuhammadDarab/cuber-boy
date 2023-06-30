import * as THREE from 'three';
import CharacterController from "./playerController";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import PeerController from './PeerController';

class characterGenerator {
    constructor(isControllable, areaHandler, color, identifier, modalLoadCallBack, msCb, kbCb) {
        this.controller;
        this.peerController = null;
        this.isControllable = isControllable;
        this.color = color;
        this.identifier = identifier;
        this.modalLoadCallBack = modalLoadCallBack;
        this.areaHandler = areaHandler;

        this.mouseCallBack = msCb;
        this.keyboardCallBack = kbCb;

        this._loadModal('../models/box_man.glb');
    }

    _loadModal = (path) => {
        this.loader = new GLTFLoader();
        this.loader.load( path, ( gltf ) => {
            const material = new THREE.MeshBasicMaterial({ color: this.color });
            // gltf.scene.traverse(function (child) {
            //     if (child instanceof THREE.Mesh) {
            //         child.material = material;
            //     }
            // });

            // enable model's shadows completely!
            gltf.scene.traverse( function( children ) { if ( children instanceof THREE.Mesh ) { children.castShadow = true; } } );
            gltf.scene.traverse( function( children ) { if ( children instanceof THREE.Mesh ) { children.receiveShadow = true; } } );
            
            gltf.castShadow = true;
            gltf.receiveShadow = true;

            if(this.isControllable) {
                let anchorPoint = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1, 0.1, 0.1, 0.1), new THREE.MeshBasicMaterial({color: 0x0000FF }));
                anchorPoint.add(this.areaHandler.camera);
                anchorPoint.add(gltf.scene)
                this.areaHandler.scene.add( anchorPoint );
                this.controller = new CharacterController(gltf, .025, anchorPoint, this.areaHandler.camera, this.mouseCallBack, this.keyboardCallBack);
            } else {
                // handle Peer Controlled logic.
                let anchorPoint = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1, 0.1, 0.1, 0.1), new THREE.MeshBasicMaterial({color: 0x0000FF }));
                anchorPoint.add(gltf.scene);
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