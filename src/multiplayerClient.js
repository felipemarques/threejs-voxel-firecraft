import * as THREE from 'three';

export class MultiplayerClient {
    constructor({ player, scene, url, nick = 'Player', color = '#29b6f6' }) {
        this.player = player;
        this.scene = scene;
        this.url = url;
        this.nick = nick;
        this.color = color;
        this.socket = null;
        this.id = null;
        this.others = new Map(); // id -> mesh
        this.lastSend = 0;
        this.sendInterval = 0.1; // seconds
        this.connect();
    }

    connect() {
        if (!this.url) {
            console.warn('Multiplayer URL not configured.');
            const log = document.getElementById('ai-log');
            if (log) {
                const div = document.createElement('div');
                div.textContent = 'Multiplayer URL not set in settings.';
                div.style.color = '#ff9b9b';
                log.appendChild(div);
            }
            return;
        }
        try {
            this.socket = new WebSocket(this.url);
            this.socket.onopen = () => {};
            this.socket.onmessage = (ev) => this.handleMessage(ev);
            this.socket.onclose = () => {
                setTimeout(() => this.connect(), 1500);
            };
        } catch (e) {
            console.warn('Multiplayer connect failed:', e);
        }
    }

    handleMessage(ev) {
        try {
            const data = JSON.parse(ev.data);
            if (data.type === 'welcome') {
                this.id = data.id;
            } else if (data.type === 'player-join') {
                // Create placeholder
                this.ensureRemote(data.id);
            } else if (data.type === 'player-leave') {
                this.removeRemote(data.id);
            } else if (data.type === 'state' && data.id !== this.id) {
                const mesh = this.ensureRemote(data.id, data.color);
                if (mesh && data.pos) {
                    mesh.position.set(data.pos.x, data.pos.y, data.pos.z);
                    this.updateLabel(mesh, data.nick);
                }
            }
        } catch (e) {
            console.warn('Multiplayer parse error:', e);
        }
    }

    ensureRemote(id, colorOverride = null) {
        if (!id || id === this.id) return null;
        if (this.others.has(id)) return this.others.get(id);
        const mesh = this.clonePlayerAvatar(colorOverride);
        if (mesh) {
            mesh.userData = { gameId: id, gameName: 'Player' };
            this.scene.add(mesh);
            this.others.set(id, mesh);
            return mesh;
        }
        // Fallback simple box
        const geo = new THREE.BoxGeometry(0.8, 1.8, 0.8);
        const mat = new THREE.MeshStandardMaterial({ color: colorOverride || this.color, emissive: 0x0, roughness: 0.7 });
        const fallback = new THREE.Mesh(geo, mat);
        fallback.position.y = 1;
        fallback.userData = { gameId: id, gameName: 'Player' };
        this.scene.add(fallback);
        this.others.set(id, fallback);
        return fallback;
    }

    removeRemote(id) {
        const mesh = this.others.get(id);
        if (mesh) {
            try { this.scene.remove(mesh); } catch (e) {}
            this.others.delete(id);
        }
    }

    clonePlayerAvatar(colorOverride = null) {
        if (!this.player || !this.player.mesh) return null;
        try {
            const clone = this.player.mesh.clone(true);
            clone.traverse(n => {
                if (n.isMesh) {
                    n.castShadow = true;
                    n.receiveShadow = true;
                    if (n.material && n.material.clone) {
                        n.material = n.material.clone();
                    }
                    if (n.geometry && n.geometry.clone) {
                        n.geometry = n.geometry.clone();
                    }
                    // Apply color override only to torso/clothes
                    if (colorOverride && n.material && !Array.isArray(n.material)) {
                        const name = (n.userData && n.userData.gameName) ? n.userData.gameName.toLowerCase() : '';
                        if (name.includes('body') || name.includes('torso') || name.includes('shirt') || name.includes('clothes')) {
                            n.material = n.material.clone();
                            n.material.color = new THREE.Color(colorOverride);
                        }
                    }
                }
                // Prevent controls/extra refs on cloned object
                if (n.userData) n.userData = { ...n.userData };
            });
            return clone;
        } catch (e) {
            console.warn('Failed to clone player avatar:', e);
            return null;
        }
    }

    update(dt) {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
        this.lastSend += dt;
        if (this.lastSend < this.sendInterval) return;
        this.lastSend = 0;
        if (!this.player || !this.player.mesh) return;
        const pos = this.player.mesh.position;
        const anim = {
            arms: {
                leftX: this.player.leftArmPivot ? this.player.leftArmPivot.rotation.x : 0,
                rightX: this.player.rightArmPivot ? this.player.rightArmPivot.rotation.x : 0
            },
            legs: {
                leftX: this.player.leftLegPivot ? this.player.leftLegPivot.rotation.x : 0,
                rightX: this.player.rightLegPivot ? this.player.rightLegPivot.rotation.x : 0
            }
        };
        const payload = { type: 'state', pos: { x: pos.x, y: pos.y, z: pos.z }, nick: this.nick, color: this.color, anim };
        try { this.socket.send(JSON.stringify(payload)); } catch (e) {}
    }

    dispose() {
        if (this.socket) {
            try { this.socket.close(); } catch (e) {}
        }
        this.others.forEach(m => {
            try { this.scene.remove(m); } catch (e) {}
        });
        this.others.clear();
    }

    updateLabel(mesh, nick) {
        const name = nick || 'Player';
        if (!mesh.userData.label) {
            const div = document.createElement('div');
            div.className = 'debug-label';
            div.style.pointerEvents = 'none';
            div.style.position = 'absolute';
            mesh.userData.label = div;
            document.body.appendChild(div);
        }
        const label = mesh.userData.label;
        label.innerText = name;

        // Project to screen
        const pos = mesh.position.clone();
        if (this.scene && this.player && this.player.camera) {
            pos.y += 2.2;
            pos.project(this.player.camera);
            const x = (pos.x + 1) / 2 * window.innerWidth;
            const y = (-pos.y + 1) / 2 * window.innerHeight;
            label.style.left = `${x}px`;
            label.style.top = `${y}px`;
            label.style.display = 'block';
        }
    }
}
