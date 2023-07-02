import * as THREE from 'three';

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

        // this.light.shadow.camera.left = -20;   // Left boundary
        // this.light.shadow.camera.right = 20;   // Right boundary
        // this.light.shadow.camera.top = 20;     // Top boundary
        // this.light.shadow.camera.bottom = -20; // Bottom boundary

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
        
        this.testCube = new THREE.Mesh(new THREE.BoxGeometry(4, 4, 4), new THREE.MeshBasicMaterial({ color:0xffffff }));
        this.testCube.userData = { name: 'test-cube' };
        this.testCube.position.x = 4;
        this.testCube.position.y = 4;
        this.testCube.position.z = 4;
        this.scene.add(this.testCube);

        // Add ArrowHelper
        const arrowLength = 25; // Length of the arrow representing the ray
        const arrowColor = 0xff0000; // Color of the arrow representing the ray
        this.arrowHelper = new THREE.ArrowHelper(this.raycaster.ray.direction, this.raycaster.ray.origin, arrowLength, arrowColor);
        // this.scene.add(this.arrowHelper);
    }
    
    animation = (callback) => {

        this.testCube.material.color.setHex(0xffffff)
        this.raycaster.set(this.camera.getWorldPosition(new THREE.Vector3()), this.camera.getWorldDirection(new THREE.Vector3()));

        const intersects = this.raycaster.intersectObject(this.testCube, true);
        this.arrowHelper.position.copy(this.camera.getWorldPosition(new THREE.Vector3()))
        this.arrowHelper.setDirection(this.camera.getWorldDirection(new THREE.Vector3()));

        for ( let i = 0; i < intersects.length; i ++ ) {
            intersects[ i ].object.material.color.set( 0xff0000 );
        }

        this.renderer.render(this.scene, this.camera);
        callback(this.scene, this.camera);

        this.fnList.map(fn => fn());
        requestAnimationFrame(() => this.animation(callback));
    }

    appendInAnimationLoop(fn) {
        this.fnList.push(fn);
    }

    addShadowLight(container) {
        container.add(this.light);
    }

}

export default generateArea;