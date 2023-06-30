class modalController {
    constructor(document) {
        this.body = document.body;
    }
    displayWelcomeModal() {
        // Handle modal logic.

        // remove cursor from reaching borders.
        document.body.addEventListener("click", async () => {
            await document.body.requestPointerLock();
        });
    }
    displayCustomModal() {
        
    }
}

export default modalController;