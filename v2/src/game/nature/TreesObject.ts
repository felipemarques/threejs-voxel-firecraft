import * as THREE from 'three'

/**
 * Creates an oak tree with spherical canopy
 * Based on v1/src/objects/treeOakElement.js
 */
export function createOakTree() {
  const treeGroup = new THREE.Group()
  const scale = 0.8 + Math.random() * 0.4
  treeGroup.scale.set(scale, scale, scale)

  const trunkHeight = 3.5 + Math.random() * 1.5
  const trunkGeo = new THREE.CylinderGeometry(0.45, 0.6, trunkHeight, 8)
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6b3f26, roughness: 1 })
  const trunk = new THREE.Mesh(trunkGeo, trunkMat)
  trunk.position.y = trunkHeight / 2
  trunk.castShadow = true
  trunk.receiveShadow = true
  treeGroup.add(trunk)

  // Optional knot
  if (Math.random() > 0.7) {
    const knotGeo = new THREE.BoxGeometry(0.15, 0.15, 0.05)
    const knotMat = new THREE.MeshStandardMaterial({ color: 0x5a3320 })
    const knot = new THREE.Mesh(knotGeo, knotMat)
    knot.position.set(0.25, trunk.position.y + 0.6, 0.45)
    knot.rotation.z = 0.4
    treeGroup.add(knot)
  }

  // Spherical canopy
  const leavesMat = new THREE.MeshStandardMaterial({ color: 0x2e8b57, roughness: 0.9 })
  const canopyCount = 6 + Math.floor(Math.random() * 4)
  for (let i = 0; i < canopyCount; i++) {
    const radius = 1.2 + Math.random() * 1.6
    const geo = new THREE.SphereGeometry(radius, 8, 6)
    const mesh = new THREE.Mesh(geo, leavesMat)
    mesh.position.y = trunk.position.y + 0.8 + Math.random() * 1.6
    mesh.position.x = (Math.random() - 0.5) * 1.5
    mesh.position.z = (Math.random() - 0.5) * 1.5
    mesh.castShadow = false
    mesh.receiveShadow = false
    treeGroup.add(mesh)
  }

  // Optional grass patch
  if (Math.random() > 0.3) {
    const grassGeo = new THREE.PlaneGeometry(0.8, 0.8)
    const grassMat = new THREE.MeshStandardMaterial({ color: 0x2ecc71, side: THREE.DoubleSide })
    const grass = new THREE.Mesh(grassGeo, grassMat)
    grass.rotation.x = -Math.PI / 2
    grass.position.y = 0.01
    grass.position.x = (Math.random() - 0.5) * 0.5
    grass.position.z = (Math.random() - 0.5) * 0.5
    grass.receiveShadow = false
    treeGroup.add(grass)
  }

  return treeGroup
}

/**
 * Creates an alpine/pine tree with conical shape
 * Based on v1/src/objects/treeAlpineElement.js
 */
export function createAlpineTree() {
  const treeGroup = new THREE.Group()
  const scale = 0.8 + Math.random() * 0.4
  treeGroup.scale.set(scale, scale, scale)

  const trunkHeight = 3.5 + Math.random() * 1.5
  const trunkGeo = new THREE.CylinderGeometry(0.45, 0.6, trunkHeight, 8)
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6b3f26, roughness: 1 })
  const trunk = new THREE.Mesh(trunkGeo, trunkMat)
  trunk.position.y = trunkHeight / 2
  trunk.castShadow = true
  trunk.receiveShadow = true
  treeGroup.add(trunk)

  // Conical layers
  const leavesMat = new THREE.MeshStandardMaterial({ color: 0x1a5e28, roughness: 0.9 })
  const coneCount = 3 + Math.floor(Math.random() * 3)
  for (let i = 0; i < coneCount; i++) {
    const size = 1.8 - i * 0.4 + Math.random() * 0.2
    const geo = new THREE.ConeGeometry(size, 1.2 + Math.random() * 0.6, 8)
    const mesh = new THREE.Mesh(geo, leavesMat)
    mesh.position.y = trunk.position.y + 0.6 + i * 0.9
    mesh.position.x = (Math.random() - 0.5) * 0.2
    mesh.position.z = (Math.random() - 0.5) * 0.2
    mesh.castShadow = false
    mesh.receiveShadow = false
    treeGroup.add(mesh)
  }

  // Top sphere
  const topGeo = new THREE.SphereGeometry(0.25, 6, 6)
  const top = new THREE.Mesh(topGeo, leavesMat)
  top.position.y = trunk.position.y + coneCount * 0.9 + 0.3
  treeGroup.add(top)

  // Optional grass patch
  if (Math.random() > 0.3) {
    const grassGeo = new THREE.PlaneGeometry(0.8, 0.8)
    const grassMat = new THREE.MeshStandardMaterial({ color: 0x2ecc71, side: THREE.DoubleSide })
    const grass = new THREE.Mesh(grassGeo, grassMat)
    grass.rotation.x = -Math.PI / 2
    grass.position.y = 0.01
    grass.position.x = (Math.random() - 0.5) * 0.5
    grass.position.z = (Math.random() - 0.5) * 0.5
    grass.receiveShadow = false
    treeGroup.add(grass)
  }

  return treeGroup
}

/**
 * Creates a bush with random spherical parts
 * Based on v1/src/objects/bushElement.js
 */
export function createBush(scale: number = 1.0) {
  const bushGroup = new THREE.Group()
  const col = new THREE.MeshStandardMaterial({ color: 0x2ca02c, roughness: 1 })
  const parts = 2 + Math.floor(Math.random() * 3)

  for (let i = 0; i < parts; i++) {
    const r = (1.2 + Math.random() * 1.0) * scale
    const g = new THREE.Mesh(new THREE.SphereGeometry(r, 6, 6), col)
    g.position.set((Math.random() - 0.5) * 1.2 * scale, r * 0.65, (Math.random() - 0.5) * 1.2 * scale)
    g.castShadow = true
    bushGroup.add(g)
  }

  return bushGroup
}
