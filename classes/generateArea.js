import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

class generateArea {
    constructor({ ground, skyBox }, document) {

        this.fnList = new Array();

        this.document = document;
        this.skyBox = new THREE.CubeTextureLoader().load(skyBox);
        this.skyBox.name = 'sky-box'
        this.groundTexture = ground;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

        this.camera.position.y = 1
        this.camera.position.z = -1.5
        this.camera.position.x = -0.70
        this.camera.rotation.y = 3

        // Generate Renderer.
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setSize( window.innerWidth - 1, window.innerHeight - 1 );
        this.document.body.appendChild( this.renderer.domElement );

        // Set SKYBOX.
        this.scene.background = this.skyBox;
    
        this.light = new THREE.DirectionalLight(0xffffff, 4.0);
        this.light.castShadow = true;

        this.light.shadow.camera.near = 0.5;
        this.light.shadow.camera.far = 500  

        this.light.shadow.camera.left = -20;   // Left boundary
        this.light.shadow.camera.right = 20;   // Right boundary
        this.light.shadow.camera.top = 20;     // Top boundary
        this.light.shadow.camera.bottom = -20; // Bottom boundary

        this.light.shadow.mapSize.width = 1024
        this.light.shadow.mapSize.height = 1024

        this.light.position.set(10, 80, 40);
        this.light.target.position.set(0, 0, 0);

        // this.scene.add(new THREE.CameraHelper(this.light.shadow.camera));

        this.scene.add(this.light);

        // Generate groundthis.texture.
        this.texture = new THREE.TextureLoader().load(this.groundTexture);
        this.texture.wrapS = THREE.RepeatWrapping;
        this.texture.wrapT = THREE.RepeatWrapping;
        this.texture.repeat.set( 80, 80 );

        this.roughnessMap = new THREE.TextureLoader().load('../textures/ground/ground.jpg');
        this.roughnessMap.wrapS = THREE.RepeatWrapping;
        this.roughnessMap.wrapT = THREE.RepeatWrapping;
        this.roughnessMap.repeat.set( 80, 80 );

        const material = new THREE.MeshStandardMaterial({
            map: this.texture,
            roughness: 1,
            roughnessMap: this.roughnessMap
        });
        const geometry = new THREE.BoxGeometry(500, 1, 500, 1, 0.1, 1);
        const cube = new THREE.Mesh( geometry, material );
        cube.name = 'plane';
        cube.castShadow = false;
        cube.receiveShadow = true; // Enable shadow reception
        // cube.position.y = 1;
        this.scene.add(cube);

        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2);

        this.addTrees(25);
        // Add ArrowHelper
        // const arrowLength = 25; // Length of the arrow representing the ray
        // const arrowColor = 0xff0000; // Color of the arrow representing the ray
        // this.arrowHelper = new THREE.ArrowHelper(this.raycaster.ray.direction, this.raycaster.ray.origin, arrowLength, arrowColor);
        // this.scene.add(this.arrowHelper);
    }
    
    addTrees(amount) {
        if(amount > 0) {
            const loader = new OBJLoader();
            loader.load(
                '../models/environment/tree/Horse-chestnut N051218.obj',
                (tree) => {
                    amount--;
                    this.tree = tree;
                    this.tree.position.x = Math.random() * 500;
                    this.tree.position.y = 0;
                    this.tree.position.z = Math.random() * 500;
                    this.tree.scale.set(0.00024, 0.00044, 0.00024);
                    
                    this.tree.traverse( function( children ) { if ( children instanceof THREE.Mesh ) { children.castShadow = true; } } );
                    this.tree.traverse( function( children ) { if ( children instanceof THREE.Mesh ) { children.receiveShadow = true; } } );

                    const texture = new THREE.TextureLoader().load( '../models/environment/tree/COLOR.JPG' )
                    tree.traverse(( child ) => {
                        if (child.isMesh) {
                            child.material.map = texture;
                            child.geometry.computeVertexNormals();
                        }
                    });

                    
                    this.addTrees(amount);
                    this.scene.add(this.tree);
                },
                (xhr) => console.log((xhr.loaded / xhr.total * 100 ) + '% loaded'),
                (error) => console.log('An error happened', error)
            )
        }
    }

    animation = (callback) => {

        this.renderer.render(this.scene, this.camera);
        callback(this.scene, this.camera);

        this.fnList.map(fn => fn());
        requestAnimationFrame(() => this.animation(callback));
    }

    appendInAnimationLoop(fn) {
        this.fnList.push(fn);
    }

    checkForIntersection() {
        this.raycaster.setFromCamera(new THREE.Vector2(0,0),this.camera);
        this.raycaster.set(this.camera.getWorldPosition(new THREE.Vector3()), this.camera.getWorldDirection(new THREE.Vector3()));
        const intersects = this.raycaster.intersectObjects(this.scene.children, true);
        return intersects;
    }

}

export default generateArea;