import * as THREE from 'three';

export class TouchControls {
    constructor(player, options = {}) {
        this.player = player;
        this.container = document.getElementById('touch-controls');
        this.enabled = true;

        // Create joystick (left)
        this.joystick = document.createElement('div');
        this.joystick.className = 'tc-joystick';
        this.joystick.style.zIndex = '210'; // Ensure above look area

        this.stick = document.createElement('div');
        this.stick.className = 'tc-stick';
        this.joystick.appendChild(this.stick);

        // Buttons (right)
        this.buttons = document.createElement('div');
        this.buttons.className = 'tc-buttons';
        this.buttons.style.zIndex = '210'; // Ensure above look area

        this.fireBtn = document.createElement('button');
        this.fireBtn.className = 'tc-btn';
        this.fireBtn.innerText = 'FIRE';

        this.jumpBtn = document.createElement('button');
        this.jumpBtn.className = 'tc-btn';
        this.jumpBtn.innerText = 'JUMP';

        this.sprintBtn = document.createElement('button');
        this.sprintBtn.className = 'tc-btn';
        this.sprintBtn.innerText = 'SPRINT';

        this.buttons.appendChild(this.fireBtn);
        this.buttons.appendChild(this.jumpBtn);
        this.buttons.appendChild(this.sprintBtn);

        // Add to container
        this.container.appendChild(this.joystick);
        this.container.appendChild(this.buttons);
        this.container.classList.remove('hidden');

        // State
        this.active = false;
        this.startPos = null;
        this.currentPos = { x: 0, y: 0 };

        // Bind events
        this._bindJoystick();
        this._bindButtons();
        this._bindLookArea();

        // Default sensitivity
        this.deadZone = 10; // px
        this.maxRadius = 50; // px

        // Keep pointer actions from scrolling page
        document.body.style.touchAction = 'none';

        // Notify player that touch movement is available
        try { if (this.player) this.player.allowTouchMovement = true; } catch (e) {}
    }

    // Dispatch a global touch-look event for camera rotation (dx, dy in pixels)
    _dispatchTouchLook(dx, dy) {
        try {
            window.dispatchEvent(new CustomEvent('game-touch-look', { detail: { dx, dy } }));
        } catch (e) {}
    }

    destroy() {
        try {
            this.container.classList.add('hidden');
            this.container.removeChild(this.joystick);
            this.container.removeChild(this.buttons);
            document.body.style.touchAction = '';
            if (this.player) this.player.allowTouchMovement = false;
        } catch (e) {}
    }

    _bindJoystick() {
        this.joystick.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const t = e.changedTouches[0];
            const rect = this.joystick.getBoundingClientRect();
            this.startPos = { x: t.clientX, y: t.clientY };
            this.active = true;
        });

        this.joystick.addEventListener('touchmove', (e) => {
            if (!this.active) return;
            e.preventDefault();
            const t = e.changedTouches[0];
            const dx = t.clientX - this.startPos.x;
            const dy = t.clientY - this.startPos.y;

            const dist = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);
            const r = Math.min(this.maxRadius, dist);
            const nx = Math.cos(angle) * r;
            const ny = Math.sin(angle) * r;
            this.stick.style.transform = `translate(${nx}px, ${ny}px)`;

            // Map to movement booleans on player
            const normX = dx / this.maxRadius;
            const normY = dy / this.maxRadius;

            // Up is negative Y in screen coordinates - map accordingly
            this.player.moveForward = normY < -0.3;
            this.player.moveBackward = normY > 0.3;
            this.player.moveLeft = normX < -0.3;
            this.player.moveRight = normX > 0.3;

            // optional analog speed/sprint handling
            // this.player.isSprinting = Math.abs(normY) > 0.9;
        });

        const release = (e) => {
            if (!this.active) return;
            e.preventDefault();
            this.active = false;
            this.startPos = null;
            this.stick.style.transform = `translate(0,0)`;
            this.player.moveForward = false;
            this.player.moveBackward = false;
            this.player.moveLeft = false;
            this.player.moveRight = false;
        };

        this.joystick.addEventListener('touchend', release);
        this.joystick.addEventListener('touchcancel', release);
    }

    _bindButtons() {
        // Fire: continuous touch = continuous shooting
        let fireInterval = null;
        this.fireBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.player && typeof this.player.shoot === 'function') {
                this.player.shoot();
                // Start auto-fire interval for hold
                fireInterval = setInterval(() => {
                    if (this.player && typeof this.player.shoot === 'function') this.player.shoot();
                }, 150);
            }
        });
        this.fireBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (fireInterval) { clearInterval(fireInterval); fireInterval = null; }
        });

        // Jump
        this.jumpBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.player) {
                if (this.player.canJump === true) {
                    this.player.velocity.y += this.player.jumpHeight;
                    this.player.canJump = false;
                }
            }
        });

        // Sprint (toggle while pressed)
        this.sprintBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.player) this.player.isSprinting = true;
        });
        this.sprintBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (this.player) this.player.isSprinting = false;
        });
    }

    _bindLookArea() {
        try {
            // Create an invisible touch area on the right side for camera look control
            this.lookArea = document.createElement('div');
            this.lookArea.className = 'tc-look-area';
            // inline styles to ensure it doesn't block buttons (lower z-index)
            this.lookArea.style.position = 'absolute';
            this.lookArea.style.top = '0';
            this.lookArea.style.bottom = '0';
            this.lookArea.style.right = '0';
            this.lookArea.style.left = '0'; // Full width
            this.lookArea.style.width = '100%';
            this.lookArea.style.zIndex = '190'; // Below controls
            this.lookArea.style.background = 'transparent';
            this.lookArea.style.touchAction = 'none';
            this.container.appendChild(this.lookArea);

            let active = false;
            let lastX = 0, lastY = 0;

            this.lookArea.addEventListener('pointerdown', (e) => {
                e.preventDefault();
                active = true;
                lastX = e.clientX; lastY = e.clientY;
                try { this.lookArea.setPointerCapture && this.lookArea.setPointerCapture(e.pointerId); } catch (err) {}
            }, { passive: false });

            this.lookArea.addEventListener('pointermove', (e) => {
                if (!active) return;
                e.preventDefault();
                const dx = e.clientX - lastX;
                const dy = e.clientY - lastY;
                lastX = e.clientX; lastY = e.clientY;
                // Dispatch normalized delta so game can apply sensitivity
                this._dispatchTouchLook(dx, dy);
            }, { passive: false });

            const release = (e) => { active = false; try { this.lookArea.releasePointerCapture && this.lookArea.releasePointerCapture(e && e.pointerId); } catch (err) {} };
            this.lookArea.addEventListener('pointerup', release);
            this.lookArea.addEventListener('pointercancel', release);

        } catch (e) {}
    }
}
