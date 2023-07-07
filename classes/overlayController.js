import Toastify from 'toastify-js';
import "toastify-js/src/toastify.css";

class overlayController {
    constructor(window) {
        this.body = window.document.body;
        this.document = window.document;
    }
    async displayWelcomeModal(callback) {
        // not supported in dev mode.
        if(navigator.getBattery) {
            const isCharging = await navigator.getBattery().charging
            if(isCharging) {
                Toastify({
                    text: "Plug in charger before playing!",
                    duration: 5000,
                    newWindow: true,
                    close: true,
                    gravity: "top", // `top` or `bottom`
                    position: "left", // `left`, `center` or `right`
                    stopOnFocus: true, // Prevents dismissing of toast on hover
                    style: {
                      background: "linear-gradient(to right, #00b09b, #96c93d)",
                    },
                    onClick: function(){} // Callback after click
                }).showToast();
            }
        }

        // Handle modal logic.
        this.showJoinModal(callback);
    }

    showJoinModal(callback) {
        this.modalOverlay = `
            <section style="
                box-shadow: 0 3px 6px -1px rgba(0, 0, 0, 0.12), 0 10px 36px -4px rgba(77, 96, 232, 0.3);
                border-radius: 12px;
            ">
                <style>
                    .modal {
                        background-color: white;
                        border-radius: 12px;
                        padding: 24px;
                    }
                    .modal-title {
                        font-size: 12px;
                        color: black;
                        background-color: transparent;
                        border: 0;
                        font-weight: 900;
                    }    
                    .modal-btn {
                        background: linear-gradient(to right, rgb(0, 176, 155), rgb(150, 201, 61));
                        color: white;
                        font-weight: 900;
                        padding: 12px;
                        border-radius: 12px;
                        cursor: pointer;
                    }            
                </style>
                <div class="modal">
                    <div class="modal">
                        Your name: <input class="modal-title" placeholder="gamer-cube etc.."/>
                        <br />
                        Character color:
                        <input type="color" class="modal-color" />
                        <div class="modal-btn">Join Room!</div>
                    </div>     
                </div>
            </section>
        `
        this.overlay = this.document.createElement('div');
        this.overlay.style.position = 'absolute';
        this.overlay.style.top = '50%';
        this.overlay.style.right = '50%';
        this.overlay.style.bottom = '50%';
        this.overlay.style.left = '50%';
        this.overlay.style.width = '40%';
        this.overlay.innerHTML = this.modalOverlay;
        this.body.appendChild(this.overlay);

        this.handleWelcomeModal(callback);
    }

    handleWelcomeModal(callback) {
        const playerNameField = document.querySelector(".modal-title");
        const playerColorField = document.querySelector(".modal-color");
        this.document.querySelector(".modal-btn").addEventListener("click", async () => {
            if(playerNameField.value != '') {
                this.playerName = playerNameField.value;
                this.playerColor = playerColorField.value;
                callback(this.playerName, this.playerColor)
                await document.body.requestPointerLock();
                this.body.removeChild(this.overlay);
            }
            else {
                playerNameField.style.border = '2px red solid';
            }
        });
    }

    displaySuccessToastToAllUsers(message) {
        Toastify({
            text: message,
            duration: 2000,
            newWindow: true,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: "left", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            style: {
              background: "linear-gradient(to right, #00b09b, #96c93d)",
            }
        }).showToast();
    }

    displayWarnToastToAllUsers(message) {
        Toastify({
            text: message,
            duration: 2000,
            newWindow: true,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: "left", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            style: {
              background: "linear-gradient(to right, rgb(255, 95, 109), rgb(255, 195, 113))",
            }
        }).showToast();
    }

    displayDeathOverlay(killedBy, removeAfter, afterRemovalCallback) {
        this.deathOverlay = `
            <div>
            <style>
                .header-overlay {
                    width: 100vw;
                    position: absolute;
                    top: 0;
                    padding: 40px;
                    background: linear-gradient(0deg, rgba(255,0,0,0.01) 0%, rgba(255,0,0,1) 100%);
                    text-align: center;
                    font-size: 100px;
                    color: white;
                }

                .footer-overlay {
                    position: absolute;
                    bottom: 0;
                    width: 100vw;
                    padding: 40px;
                    background: linear-gradient(180deg, rgba(255,0,0,0.001) 0%, rgba(255,0,0,1) 100%);
                    text-align: center;
                    font-size: 80px;
                    color: white;
                }
            </style>
                <div class="header-overlay">
                    <div>You died</div>
                </div>

                <div class="footer-overlay">
                    <div>killed by ${killedBy}</div>
                </div>
            </div>

        `
        this.overlay = this.document.createElement('div');
        this.overlay.innerHTML = this.deathOverlay;

        this.body.appendChild(this.overlay);

        this.removeOverlay(removeAfter, afterRemovalCallback)
    }

    removeOverlay(ms, afterRemovalCallback) {
        setTimeout(() => {
            this.body.removeChild(this.overlay);
            afterRemovalCallback();
        },ms)
    }
}

export default overlayController;