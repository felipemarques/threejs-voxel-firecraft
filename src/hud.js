import * as THREE from 'three';
export class HUD {
    constructor(player, settings) {
        this.player = player;
        this.settings = settings || {};
        
        // Elements
        this.healthBar = document.getElementById('health-bar');
        this.healthText = document.getElementById('health-text');
        this.shieldBar = document.getElementById('shield-bar');
        this.shieldText = document.getElementById('shield-text');
        this.staminaBar = document.getElementById('stamina-bar');
        this.staminaText = document.getElementById('stamina-text');
        this.weaponName = document.getElementById('weapon-name');
        this.ammoCount = document.getElementById('ammo-count');
        this.slots = document.querySelectorAll('.slot');
        this.timerValue = document.getElementById('timer-value');
        // Debug container for per‑object labels
        this.debugContainer = document.getElementById('debug-container');
        this.gameOverScreen = document.getElementById('game-over-screen');
        
        // Dashboard Elements
        this.fpsCounter = document.getElementById('fps-counter');
        this.enemyCount = document.getElementById('enemy-count');
        this.killCount = document.getElementById('kill-count');
        this.distanceTraveled = document.getElementById('distance-traveled');
        this.memoryUsage = document.getElementById('memory-usage');

        // Debug Elements
        this.debugInfo = document.getElementById('debug-info');
        this.debugName = document.getElementById('debug-target-name');
        this.debugId = document.getElementById('debug-target-id');

        if (this.settings.debugMode) {
            this.debugInfo.style.display = 'block';
        } else {
            this.debugInfo.style.display = 'none';
        }

        // Storm Timer
        this.timeRemaining = 30; // seconds
        this.lastTime = performance.now();
        this.frames = 0; // Used for FPS calculation
        this.fps = 0;
        this.lastFpsTime = performance.now(); // For FPS calculation

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.hoveredEnemy = null;
        this.hoverInfo = document.getElementById('hover-info');
        this.targetDistanceEl = document.getElementById('target-distance');

        // Mouse move listener for hover detection
        window.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth) * 2 - 1;
            const y = -(e.clientY / window.innerHeight) * 2 + 1;
            this.mouse.set(x, y);

            // Perform raycast against enemies
            if (this.player && this.player.enemyManager && this.player.enemyManager.enemies.length > 0) {
                const enemyMeshes = this.player.enemyManager.enemies.map(e => e.mesh);
                this.raycaster.setFromCamera(this.mouse, this.player.camera);
                const intersects = this.raycaster.intersectObjects(enemyMeshes, true);
                if (intersects.length > 0) {
                    const obj = intersects[0].object;
                    // Find enemy instance by traversing parents
                    let cur = obj;
                    let found = null;
                    while (cur) {
                        found = this.player.enemyManager.enemies.find(en => en.mesh === cur);
                        if (found) break;
                        cur = cur.parent;
                    }
                    // Store either the enemy instance or the mesh as fallback
                    this.hoveredEnemy = found || obj || null;
                } else {
                    this.hoveredEnemy = null;
                }
            }
        });
    }

    update() {
        // Dashboard
        this.frames++;
        const now = performance.now();
        if (now - this.lastFpsTime >= 1000) {
            this.fpsCounter.innerText = this.frames;
            this.frames = 0;
            this.lastFpsTime = now;
            
            if (performance.memory) {
                this.memoryUsage.innerText = Math.round(performance.memory.usedJSHeapSize / 1048576);
            }
        }

        if (this.player.enemyManager) {
            this.enemyCount.innerText = this.player.enemyManager.enemies.length;
            this.killCount.innerText = this.player.enemyManager.killedCount || 0;
        }

        // Distance traveled (convert meters to kilometers)
        const distanceKm = (this.player.distanceTraveled / 1000).toFixed(2);
        if (this.distanceTraveled) this.distanceTraveled.innerText = distanceKm;

        // Stats
        this.healthBar.style.width = `${this.player.health}%`;
        this.healthText.innerText = Math.ceil(this.player.health);
        
        this.shieldBar.style.width = `${this.player.shield}%`;
        this.shieldText.innerText = Math.ceil(this.player.shield);
        
        // Stamina
        this.staminaBar.style.width = `${this.player.stamina}%`;
        this.staminaText.innerText = Math.ceil(this.player.stamina);

        // Weapon
        const weapon = this.player.weapons[this.player.currentWeaponIndex];
        this.weaponName.innerText = weapon.name;
        
        if (this.player.isReloading) {
            this.ammoCount.innerText = "RELOADING...";
        } else {
            this.ammoCount.innerText = weapon.ammo === Infinity ? '∞' : `${weapon.currentMag} / ${weapon.ammo}`;
        }

        // Debug per‑object labels (controlled by showRenderedIds or debugMode)
        const showRenderedIds = !!this.settings.showRenderedIds || !!this.settings.debugMode;
        if (showRenderedIds && this.debugContainer) {
            // Clear previous labels
            this.debugContainer.innerHTML = '';
            const objects = this.player.worldObjects || [];
            objects.forEach(obj => {
                if (!obj.userData) return;
                const pos = obj.position.clone();
                pos.project(this.player.camera);
                const x = (pos.x + 1) / 2 * window.innerWidth;
                const y = (-pos.y + 1) / 2 * window.innerHeight;
                const div = document.createElement('div');
                div.className = 'debug-label';
                div.style.position = 'absolute';
                div.style.left = `${x}px`;
                div.style.top = `${y}px`;
                div.innerText = `${obj.userData.gameName}: ${obj.userData.gameId}`;
                this.debugContainer.appendChild(div);
            });
        } else if (this.debugContainer) {
            this.debugContainer.innerHTML = '';
        }

        // Update hovered enemy debug info (show ID and distance)
        if (this.debugInfo) {
            if (this.hoveredEnemy) {
                // Determine mesh and position robustly (hoveredEnemy can be enemy instance or mesh)
                const mesh = this.hoveredEnemy.mesh ? this.hoveredEnemy.mesh : (this.hoveredEnemy.isMesh ? this.hoveredEnemy : null) || this.hoveredEnemy;
                const name = (mesh && mesh.userData && mesh.userData.gameName) ? mesh.userData.gameName : 'Enemy';
                const id = (mesh && mesh.userData && (mesh.userData.gameId || mesh.userData.gameid)) ? (mesh.userData.gameId || mesh.userData.gameid) : '---';
                // Position fallback: prefer enemy.position if available, else mesh.position
                const enemyPos = (this.hoveredEnemy.position) ? this.hoveredEnemy.position : (mesh ? mesh.position : null);
                const dist = enemyPos ? this.player.position.distanceTo(enemyPos).toFixed(2) : '---';

                this.debugName.innerText = name;
                this.debugId.innerText = `${id} (${dist}m)`;
                // Ensure debug panel visible if debugMode is on
                if (this.settings.debugMode) this.debugInfo.style.display = 'block';
            } else {
                this.debugName.innerText = 'None';
                this.debugId.innerText = '---';
                if (!this.settings.debugMode) this.debugInfo.style.display = 'none';
            }
        }

        // Hover info over crosshair: always show when hovering an enemy (not tied to debugMode)
        if (this.hoverInfo) {
            if (this.hoveredEnemy) {
                const mesh = this.hoveredEnemy.mesh ? this.hoveredEnemy.mesh : (this.hoveredEnemy.isMesh ? this.hoveredEnemy : null) || this.hoveredEnemy;
                const id = (mesh && mesh.userData && (mesh.userData.gameId || mesh.userData.gameid)) ? (mesh.userData.gameId || mesh.userData.gameid) : '---';
                const enemyPos = (this.hoveredEnemy.position) ? this.hoveredEnemy.position : (mesh ? mesh.position : null);
                const distNum = enemyPos ? this.player.position.distanceTo(enemyPos) : null;
                const dist = distNum ? distNum.toFixed(2) : '---';
                this.hoverInfo.innerText = `${id} • ${dist}m`;
                // Crosshair color: red if within weapon range, yellow if visible but out of range
                const crosshair = document.getElementById('crosshair');
                if (crosshair) {
                    crosshair.classList.remove('target-red', 'target-yellow');
                    const weapon = this.player.weapons && this.player.weapons[this.player.currentWeaponIndex];
                    const weaponRange = weapon && weapon.range ? weapon.range : 1000;
                    if (distNum !== null) {
                        if (distNum <= weaponRange) {
                            crosshair.classList.add('target-red');
                        } else {
                            crosshair.classList.add('target-yellow');
                        }
                    }
                }
            } else {
                this.hoverInfo.innerText = '';
                const crosshair = document.getElementById('crosshair');
                if (crosshair) crosshair.classList.remove('target-red', 'target-yellow');
            }
        }

        // Optionally show target distance in top-left (dashboard)
        if (this.targetDistanceEl) {
            const showTarget = !!this.settings.showTargetDistance;
            if (showTarget && this.hoveredEnemy) {
                const mesh = this.hoveredEnemy.mesh ? this.hoveredEnemy.mesh : (this.hoveredEnemy.isMesh ? this.hoveredEnemy : null) || this.hoveredEnemy;
                const enemyPos = (this.hoveredEnemy.position) ? this.hoveredEnemy.position : (mesh ? mesh.position : null);
                const dist = enemyPos ? this.player.position.distanceTo(enemyPos).toFixed(2) : '---';
                this.targetDistanceEl.innerText = `${dist}`;
            } else {
                this.targetDistanceEl.innerText = '---';
            }
        }

        // Hotbar
        // Clear existing slots
        this.slots.forEach(s => s.style.display = 'none');
        
        // Update slots based on current weapons
        this.player.weapons.forEach((weapon, index) => {
            let slot = this.slots[index];
            if (!slot) {
                // Create new slot if needed (or just limit to 4)
                // For now assuming max 4 slots as per HTML
                return;
            }
            slot.style.display = 'flex';
            slot.innerText = index + 1;
            
            if (index === this.player.currentWeaponIndex) {
                slot.classList.add('active');
                // Show weapon name in slot? Or icon?
                // Just number is fine for now.
            } else {
                slot.classList.remove('active');
            }
        });

        // Timer
        const currentTime = performance.now();
        if (currentTime - this.lastTime > 1000) {
            this.timeRemaining--;
            if (this.timeRemaining < 0) this.timeRemaining = 0;
            
            const minutes = Math.floor(this.timeRemaining / 60).toString().padStart(2, '0');
            const seconds = (this.timeRemaining % 60).toString().padStart(2, '0');
            this.timerValue.innerText = `${minutes}:${seconds}`;
            
            this.lastTime = currentTime;
        }

        // Game Over
        if (this.player.isDead) {
            this.showGameOver("YOU DIED");
        }
    }

    showGameOver(message) {
        this.gameOverScreen.classList.remove('hidden');
        document.getElementById('game-over-title').innerText = message;
        
        // Simple restart logic
        document.getElementById('restart-btn').onclick = () => {
            location.reload();
        };
    }

    showVictory() {
        this.showGameOver("VICTORY ROYALE!");
        document.getElementById('game-over-title').style.color = '#f1c40f'; // Gold color
    }
}

