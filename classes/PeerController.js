// Purpose of this class is to create a controller for the
// peer connection i.e. other player on the WebSocket connection
import { AnimationMixer } from "three";

class PeerController {

    constructor(model, speed, modelAnchor) {
        this.modelGroup = model;
        this.model = model.scene;
        this.modelAnchor = modelAnchor;
        this.modelAnim = model.animations;
        this.speed = speed;
        this.mixer = new AnimationMixer(model.scene);
        this.pressedKeys = new Array();

        this.mixer.clipAction( this.modelAnim.filter(anim => anim.name === 'idle')[0] ).play();
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
    
    keyboardChange(pressedKeys, currentKey) {
        this.pressedKeys = pressedKeys;
        this._playAnimation(currentKey);
    }

    mouseChange({movementX, movementY}) {
        movementX < 0 ? this.modelAnchor.rotation.y += Math.abs(movementX / 50) : this.modelAnchor.rotation.y += -Math.abs(movementX / 50)
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
                this.mixer.clipAction( this.modelAnim.filter(anim => anim.name === 'idle')[0] ).play();
                break;
        }
    }
    
    removeUser() {
        
    }
}
export default PeerController;