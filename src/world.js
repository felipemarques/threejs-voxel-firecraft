import * as THREE from 'three';

export class World {
    constructor(scene, itemManager, settings) {
        this.scene = scene;
        this.itemManager = itemManager;
        this.objects = []; // Objects for collision detection
        this.stormRadius = 100;
        
        const stormTime = settings ? settings.stormTime : 180; // seconds
        this.stormShrinkRate = this.stormRadius / stormTime; 

        this.safeZoneCenter = new THREE.Vector3(0, 0, 0);
        
        this.init();
    }

    init() {
        this.createEnvironment();
        this.createStormVisuals();
    }

    createEnvironment() {
        // Ground
        const groundGeo = new THREE.PlaneGeometry(200, 200, 64, 64);
        
        // Improved Ground Material (Vertex Colors for variation)
        const count = groundGeo.attributes.position.count;
        groundGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
        
        const colors = groundGeo.attributes.color;
        const color = new THREE.Color();
        
        for (let i = 0; i < count; i++) {
            // Noise-like variation
            const r = Math.random();
            if (r > 0.8) color.setHex(0x27ae60); // Darker grass
            else if (r > 0.4) color.setHex(0x2ecc71); // Normal grass
            else color.setHex(0x58d68d); // Lighter grass
            
            colors.setXYZ(i, color.r, color.g, color.b);
        }

        const groundMat = new THREE.MeshStandardMaterial({ 
            vertexColors: true,
            roughness: 0.8
        });
        
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        ground.userData = { gameId: this.generateID(), gameName: 'Ground' };
        this.scene.add(ground);
        this.objects.push(ground);

        // Trees
        for (let i = 0; i < 50; i++) {
            const x = (Math.random() - 0.5) * 180;
            const z = (Math.random() - 0.5) * 180;
            
            const type = Math.random() > 0.5 ? 'Oak' : 'Pine';
            const tree = this.createTree(x, z, type);
            tree.userData = { gameId: this.generateID(), gameName: `Tree_${type}` };
            this.scene.add(tree);
            this.objects.push(tree);
        }

        // Rocks
        for (let i = 0; i < 30; i++) {
            const x = (Math.random() - 0.5) * 180;
            const z = (Math.random() - 0.5) * 180;
            const rock = this.createRock(x, z);
            rock.userData = { gameId: this.generateID(), gameName: 'Rock' };
            this.scene.add(rock);
            this.objects.push(rock);
        }
        
        // Buildings
        for (let i = 0; i < 8; i++) {
            const x = (Math.random() - 0.5) * 150;
            const z = (Math.random() - 0.5) * 150;
            const house = this.createHouse(x, z);
            house.userData = { gameId: this.generateID(), gameName: 'House' };
            this.scene.add(house);
            this.objects.push(house);
            
            // Spawn loot inside
            this.itemManager.spawnLootInHouse(x, 1, z);
        }
    }

    generateID() {
        return Math.random().toString(36).substr(2, 9).toUpperCase();
    }

    createTree(x, z, type) {
        const treeGroup = new THREE.Group();
        treeGroup.position.set(x, 0, z);

        const scale = 0.8 + Math.random() * 0.4;
        treeGroup.scale.set(scale, scale, scale);

        // Trunk
        const trunkGeo = new THREE.BoxGeometry(1, 4, 1);
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 2;
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        treeGroup.add(trunk);
        this.objects.push(trunk);

        // Leaves
        const leavesMat = new THREE.MeshStandardMaterial({ color: type === 'Oak' ? 0x228B22 : 0x1B5E20 });
        
        if (type === 'Oak') {
            const layers = [
                { size: 5, y: 4 },
                { size: 5, y: 5 },
                { size: 3, y: 6 },
                { size: 3, y: 7 }
            ];
            layers.forEach(layer => {
                const geo = new THREE.BoxGeometry(layer.size, 1, layer.size);
                const mesh = new THREE.Mesh(geo, leavesMat);
                mesh.position.y = layer.y;
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                treeGroup.add(mesh);
            });
        } else { // Pine
            const layers = [
                { size: 4, y: 3 },
                { size: 3, y: 4.5 },
                { size: 2, y: 6 },
                { size: 1, y: 7.5 }
            ];
            layers.forEach(layer => {
                const geo = new THREE.BoxGeometry(layer.size, 1.5, layer.size);
                const mesh = new THREE.Mesh(geo, leavesMat);
                mesh.position.y = layer.y;
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                treeGroup.add(mesh);
            });
        }

        return treeGroup;
    }

    createRock(x, z) {
        const size = 0.5 + Math.random() * 1.0;
        const geo = new THREE.BoxGeometry(size, size * 0.8, size);
        const rockMat = new THREE.MeshStandardMaterial({ color: 0x7f8c8d });
        const rock = new THREE.Mesh(geo, rockMat);
        rock.position.set(x, size/2, z);
        rock.rotation.set(Math.random(), Math.random(), Math.random());
        rock.castShadow = true;
        rock.receiveShadow = true;
        return rock;
    }

    createHouse(x, z) {
        const houseGroup = new THREE.Group();
        houseGroup.position.set(x, 0, z);
        houseGroup.rotation.y = Math.random() * Math.PI * 2;

        const wallMat = new THREE.MeshStandardMaterial({ color: 0x95a5a6 }); 
        const roofMat = new THREE.MeshStandardMaterial({ color: 0xc0392b });

        // Walls
        const walls = [
            { w: 6, h: 4, d: 0.5, x: 0, y: 2, z: -3 }, // Back
            { w: 0.5, h: 4, d: 6, x: -3, y: 2, z: 0 }, // Left
            { w: 0.5, h: 4, d: 6, x: 3, y: 2, z: 0 }, // Right
            { w: 2, h: 4, d: 0.5, x: -2, y: 2, z: 3 }, // Front Left
            { w: 2, h: 4, d: 0.5, x: 2, y: 2, z: 3 }, // Front Right
            { w: 2, h: 1, d: 0.5, x: 0, y: 3.5, z: 3 } // Front Top
        ];

        walls.forEach(w => {
            const mesh = new THREE.Mesh(new THREE.BoxGeometry(w.w, w.h, w.d), wallMat);
            mesh.position.set(w.x, w.y, w.z);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            houseGroup.add(mesh);
            this.objects.push(mesh);
        });

        // Roof
        const roof = new THREE.Mesh(new THREE.ConeGeometry(5, 2, 4), roofMat);
        roof.position.y = 5;
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        houseGroup.add(roof);

        return houseGroup;
    }


    createStormVisuals() {
        const geometry = new THREE.CylinderGeometry(this.stormRadius, this.stormRadius, 50, 32, 1, true);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0x8e44ad, 
            transparent: true, 
            opacity: 0.3, 
            side: THREE.DoubleSide 
        });
        this.stormMesh = new THREE.Mesh(geometry, material);
        this.stormMesh.position.y = 25;
        this.scene.add(this.stormMesh);
    }

    update(dt, playerPos) {
        // Shrink storm
        if (this.stormRadius > 10) {
            this.stormRadius -= this.stormShrinkRate * dt;
            const scale = this.stormRadius / 100; 
            this.stormMesh.scale.set(scale, 1, scale);
        }

        // Check storm damage
        const dist = Math.sqrt(playerPos.x * playerPos.x + playerPos.z * playerPos.z);
        return { inStorm: dist > this.stormRadius };
    }

}
