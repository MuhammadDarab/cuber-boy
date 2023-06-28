import { AnimationMixer } from "three";

class CharacterController {
    constructor(model, speed) {
        this.model = model.scene;
        this.mixer = new AnimationMixer(model.scene);
        this.modelAnim = model.animations;
        this.speed = speed;
        this.pressedKeys = new Array();

        // initiate Keyboard Controls.
        this.initiateKeyboardControls();

        // initiate Mouse Controls
        this.initiateMouseControls();
    }

    initiateKeyboardControls() {
        document.addEventListener('keydown', ({key}) => {
            if(!this.pressedKeys.includes(key)) {
                this.pressedKeys.push(key);
                this._playAnimation(key);
            } 
        })
        document.addEventListener('keyup', ({key}) => {
            this.pressedKeys = this.pressedKeys.filter((char) => char !== key)
            // meaning there are no keys pressed hence idle anim
            if(this.pressedKeys.length == 0) {
                this.mixer.stopAllAction();
                this.mixer.clipAction(this.modelAnim.filter(anim => anim.name === 'idle')[0]).play();
            }
        })
    }

    initiateMouseControls() {
        document.addEventListener('mousemove', ({ movementX, movementY }) => {
            movementX < 0 ? this.model.rotation.y += Math.abs(movementX / 50) : this.model.rotation.y += -Math.abs(movementX / 50)  
            // this.model.rotation.x += movementY / 75
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
        this.model.translateZ(isSprinting ? this.speed : this.speed / 4);
    }

    _moveBackward() {
        this.model.translateZ(-this.speed);
    }

    _moveLeft() {
        this.model.translateX(this.speed);
    }

    _moveRight() {
        this.model.translateX(-this.speed);
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
                this.mixer.clipAction( this.modelAnim.filter(anim => anim.name === 'idle')[0] ).play();
                break;
            case 'S':
                this.mixer.clipAction( this.modelAnim.filter(anim => anim.name === 'idle')[0] ).play();
                break;
            case 'A':
                this.mixer.clipAction( this.modelAnim.filter(anim => anim.name === 'idle')[0] ).play();
                break;
            case 'a':
                this.mixer.clipAction( this.modelAnim.filter(anim => anim.name === 'idle')[0] ).play();
                break;
            case 'D':
                this.mixer.clipAction( this.modelAnim.filter(anim => anim.name === 'idle')[0] ).play();
                break;
            case 'd':
                this.mixer.clipAction( this.modelAnim.filter(anim => anim.name === 'idle')[0] ).play();
                break;
            default:
                break;
        }
    }

}

export default CharacterController;