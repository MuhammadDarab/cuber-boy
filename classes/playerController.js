import { AnimationMixer } from "three";

class CharacterController {
    constructor(model, speed, modelAnchor, camera, onMouseChange, onKeyboardChange) {
        this.model = model.scene;
        this.mixer = new AnimationMixer(model.scene);
        this.modelAnim = model.animations;
        this.speed = speed;
        this.pressedKeys = new Array();
        this.modelAnchor = modelAnchor;
        this.camera = camera;

        this.mixer.clipAction(this.modelAnim.filter(anim => anim.name === 'idle')[0]).play();

        // initiate Keyboard Controls.
        this.initiateKeyboardControls(onKeyboardChange);

        // initiate Mouse Controls
        this.initiateMouseControls(onMouseChange);
    }

    initiateKeyboardControls(onKeyboardChange) {
        document.addEventListener('keydown', ({key}) => {
            if(!this.pressedKeys.includes(key) && this._isWSAD(key)) {
                this.pressedKeys.push(key);
                this._playAnimation(key);
                // broadcast pressed keys on socket! 
                onKeyboardChange(this.pressedKeys, key);
            } 
        })
        document.addEventListener('keyup', ({key}) => {
            this.pressedKeys = this.pressedKeys.filter((char) => char !== key && char !== key.toUpperCase() && char !== key.toLowerCase())
            // meaning there are no keys pressed hence idle anim
            if(this.pressedKeys.length == 0) {
                this.mixer.stopAllAction();
                this.mixer.clipAction(this.modelAnim.filter(anim => anim.name === 'idle')[0]).play();
            }
            // broadcast pressed keys on socket!
            onKeyboardChange(this.pressedKeys);
        })
    }

    initiateMouseControls(onMouseChange) {
        document.addEventListener('mousemove', ({ movementX, movementY }) => {
            movementX < 0 ? this.modelAnchor.rotation.y += Math.abs(movementX / 100) : this.modelAnchor.rotation.y += -Math.abs(movementX / 100)  

            if(this.camera.rotation.x <= 0.4) {
                movementY < 0 ? this.camera.rotation.x += -Math.abs(movementY / 500) : this.camera.rotation.x += Math.abs(movementY / 500)  
            } else {
                this.camera.rotation.x = 0.39
            }
            
            if (this.camera.rotation.x >= -0.4) {
                movementY < 0 ? this.camera.rotation.x += -Math.abs(movementY / 500) : this.camera.rotation.x += Math.abs(movementY / 500)  
            } else {
                this.camera.rotation.x = -0.39
            }
            // for top-to-bottom axis, rotate the camera only
            // broadcast movement X & Y on socket.
            onMouseChange({ movementX, movementY });
        })
    }

    updateControls() {
        this.pressedKeys.map((key) => {
            switch (key) {
                case 'w':
                    this._moveForward(0);
                    break;
                case 'W':
                    this._moveForward(1);
                    break;
                case 's':
                    this._moveBackward(0);
                    break;
                case 'S':
                    this._moveBackward(0);
                    break;
                case 'A':
                    this._moveLeft(0);
                    break;
                case 'a':
                    this._moveLeft(0);
                    break;
                case 'D':
                    this._moveRight(0);
                    break;
                case 'd':
                    this._moveRight(0);
                    break;
                default:
                    break;
            }
        })
        if(this.mixer)
        this.mixer.update(1/120);
    }

    _moveForward(isSprinting) {
        this.modelAnchor.translateZ(isSprinting ? this.speed * 2: this.speed);
        this.model.rotation.y = 0    
    }

    _moveBackward() {
        this.modelAnchor.translateZ(-this.speed);
        this.model.rotation.y = 110
    }

    _moveLeft() {
        this.modelAnchor.translateX(this.speed);
        this.model.rotation.y = -55
    }

    _moveRight() {
        this.modelAnchor.translateX(-this.speed);
        this.model.rotation.y = 55
    }
    
    _playAnimation(key) {
        this.mixer.stopAllAction();
        switch (key) {
            case 'w':
                this.mixer.clipAction( this.modelAnim.filter(anim => anim.name === 'run')[0] ).play();
                break;
            case 'W':
                this.mixer.clipAction( this.modelAnim.filter(anim => anim.name === 'sprint')[0] ).play();
                break;
            case 's':
                this.mixer.clipAction( this.modelAnim.filter(anim => anim.name === 'run')[0] ).play();
                break;
            case 'S':
                this.mixer.clipAction( this.modelAnim.filter(anim => anim.name === 'sprint')[0] ).play();
                break;
            case 'a':
                this.mixer.clipAction( this.modelAnim.filter(anim => anim.name === 'run')[0] ).play();
                break;
            case 'A':
                this.mixer.clipAction( this.modelAnim.filter(anim => anim.name === 'sprint')[0] ).play();
                break;
            case 'd':
                this.mixer.clipAction( this.modelAnim.filter(anim => anim.name === 'run')[0] ).play();
                break;
            case 'D':
                this.mixer.clipAction( this.modelAnim.filter(anim => anim.name === 'sprint')[0] ).play();
                break;
            default:
                break;
        }
    }

    _isWSAD(key) {
        return key == 'W' || key == 'w' || key == 'S' ||  key == 's' || key == 'A' ||  key == 'a' || key == 'D' || key == 'd' 
    }

}

export default CharacterController;