import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import path from 'path';

// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import CharacterController from './classes/playerController';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';

// remove cursor from reaching borders.
document.body.addEventListener("click", async () => {
    await document.body.requestPointerLock();
});

const light = new THREE.AmbientLight(0xffffff, 0.6);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

scene.add(light);

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth - 1, window.innerHeight - 1 );
document.body.appendChild( renderer.domElement );

let controller;
let anchorPoint;

const loader = new GLTFLoader();
loader.load( '../models/box_man.glb', function ( gltf ) {
    var material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    gltf.scene.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
            child.material = material;
        }
    });

    anchorPoint = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1, 0.1, 0.1, 0.1), new THREE.MeshBasicMaterial({color: 0x0000FF }));
    
    anchorPoint.add(camera);

    anchorPoint.add(gltf.scene)

    scene.add( anchorPoint );

    controller = new CharacterController(gltf, .05, anchorPoint, camera);

}, undefined, function ( error ) {
	console.error( error );
} );

const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
const geometry = new THREE.BoxGeometry(15, 1, 15, 1, 0.1, 1);
const cube = new THREE.Mesh( geometry, material );
cube.position.y = -.5;
scene.add(cube);

camera.position.y = 1
camera.position.z = -1.5
camera.position.x = -0.70
camera.rotation.y = 3

function animate() {
	requestAnimationFrame(animate);
    if(controller)
    controller.updateControls();
	renderer.render(scene, camera);
}

animate();