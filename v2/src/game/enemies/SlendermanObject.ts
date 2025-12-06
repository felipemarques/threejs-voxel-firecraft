import * as THREE from 'three'

/**
 * Creates a Slenderman mesh
 * Tall, thin figure in black suit with faceless pale head and red tie
 * Based on v1/src/objects/slendermanElement.js
 */
export function createSlenderman() {
  const group = new THREE.Group()

  const suitMat = new THREE.MeshStandardMaterial({
    color: 0x0a0a0a,
    roughness: 0.8,
    metalness: 0.1
  })
  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xf5f5dc, // Pale beige
    roughness: 0.3
  })
  const tieMat = new THREE.MeshStandardMaterial({
    color: 0xcc0000, // Red tie
    roughness: 0.6
  })

  // Faceless head (smooth, no features)
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.5, 0.4), skinMat)
  head.position.y = 2.4 // Higher position for tall character
  group.add(head)

  // Body (tall and thin)
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.4, 0.25), suitMat)
  body.position.y = 1.5
  group.add(body)

  // Red tie
  const tie = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.8, 0.05), tieMat)
  tie.position.set(0, 1.5, 0.14)
  group.add(tie)

  // Long thin arms - Pivots (tentacle-like)
  const armGeo = new THREE.BoxGeometry(0.12, 1.2, 0.12) // Longer, thinner
  armGeo.translate(0, -0.5, 0)

  const leftArmPivot = new THREE.Group()
  leftArmPivot.position.set(-0.35, 2.0, 0)
  group.add(leftArmPivot)
  leftArmPivot.add(new THREE.Mesh(armGeo, suitMat))

  const rightArmPivot = new THREE.Group()
  rightArmPivot.position.set(0.35, 2.0, 0)
  group.add(rightArmPivot)
  rightArmPivot.add(new THREE.Mesh(armGeo, suitMat))

  // Legs - Pivots (long and thin)
  const legGeo = new THREE.BoxGeometry(0.18, 1.0, 0.18)
  legGeo.translate(0, -0.5, 0)

  const leftLegPivot = new THREE.Group()
  leftLegPivot.position.set(-0.12, 0.9, 0)
  group.add(leftLegPivot)
  leftLegPivot.add(new THREE.Mesh(legGeo, suitMat))

  const rightLegPivot = new THREE.Group()
  rightLegPivot.position.set(0.12, 0.9, 0)
  group.add(rightLegPivot)
  rightLegPivot.add(new THREE.Mesh(legGeo, suitMat))

  // Cast shadows
  group.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.castShadow = true
      obj.receiveShadow = true
    }
  })

  return {
    mesh: group,
    leftArmPivot,
    rightArmPivot,
    leftLegPivot,
    rightLegPivot
  }
}
