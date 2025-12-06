import * as THREE from 'three'

interface SpiderLeg {
  upper: THREE.Group
  lower: THREE.Group
  side: number
  index: number
  baseRotation: number
}

interface SpiderResult {
  mesh: THREE.Group
  legs: SpiderLeg[]
  abdomen: THREE.Mesh
  head: THREE.Mesh
}

/**
 * Creates a voxel spider enemy with 8 legs and animated body
 * Dark brown spider with 8 red eyes and fangs
 * Based on v1/src/objects/spiderElement.js
 */
export function createSpider(): SpiderResult {
  const spiderGroup = new THREE.Group()

  // Body material - dark spider color
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x2c1810, roughness: 0.8 })
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0x440000, emissiveIntensity: 0.5 })
  const legMat = new THREE.MeshStandardMaterial({ color: 0x3a2318, roughness: 0.9 })

  // Main body (abdomen) - rounder back part
  const abdomenGeo = new THREE.SphereGeometry(0.9, 8, 8)
  abdomenGeo.scale(1, 0.8, 1.3) // Flatten slightly and elongate
  const abdomen = new THREE.Mesh(abdomenGeo, bodyMat)
  abdomen.position.set(0, 0.7, -0.5)
  abdomen.castShadow = true
  spiderGroup.add(abdomen)

  // Head (cephalothorax) - smaller front part
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 0.8), bodyMat)
  head.position.set(0, 0.5, 0.6)
  head.castShadow = true
  spiderGroup.add(head)

  // Eyes - 8 eyes in two rows
  const eyeSize = 0.1
  const eyePositions = [
    // Top row (4 eyes)
    [-0.25, 0.7, 1.0],
    [-0.08, 0.7, 1.05],
    [0.08, 0.7, 1.05],
    [0.25, 0.7, 1.0],
    // Bottom row (4 eyes)
    [-0.2, 0.55, 1.0],
    [-0.06, 0.55, 1.05],
    [0.06, 0.55, 1.05],
    [0.2, 0.55, 1.0]
  ]

  eyePositions.forEach((pos, index) => {
    const size = index < 4 ? eyeSize : eyeSize * 0.7
    const eye = new THREE.Mesh(new THREE.BoxGeometry(size, size, size * 0.5), eyeMat)
    eye.position.set(pos[0], pos[1], pos[2])
    spiderGroup.add(eye)
  })

  // Mandibles (fangs)
  const fangGeo = new THREE.ConeGeometry(0.08, 0.3, 4)
  const fangMat = new THREE.MeshStandardMaterial({ color: 0x1a0f0a, roughness: 0.5 })

  const leftFang = new THREE.Mesh(fangGeo, fangMat)
  leftFang.position.set(-0.15, 0.35, 1.0)
  leftFang.rotation.x = Math.PI / 6 // Point inward/down
  leftFang.rotation.z = -Math.PI / 12
  spiderGroup.add(leftFang)

  const rightFang = new THREE.Mesh(fangGeo, fangMat)
  rightFang.position.set(0.15, 0.35, 1.0)
  rightFang.rotation.x = Math.PI / 6
  rightFang.rotation.z = Math.PI / 12
  spiderGroup.add(rightFang)

  // Leg segments storage
  const legs: SpiderLeg[] = []

  // Leg configuration: 4 legs per side (8 total)
  const legAngles = [0, 0, 0, 0] // Perpendicular

  // Create 8 legs (4 on each side)
  for (let side = 0; side < 2; side++) {
    // 0 = left, 1 = right
    const xMult = side === 0 ? -1 : 1

    for (let legIndex = 0; legIndex < 4; legIndex++) {
      const legGroup = new THREE.Group()

      // Attach legs to cephalothorax/body
      const zOffset = 0.7 - legIndex * 0.5
      legGroup.position.set(xMult * 0.45, 0.5, zOffset)

      // Base rotation
      const baseAngle = side === 0 ? -Math.PI / 2 : Math.PI / 2
      const angleOffset = legAngles[legIndex]
      legGroup.rotation.y = baseAngle + angleOffset

      // Upper leg segment pivot
      const upperPivot = new THREE.Group()
      upperPivot.position.set(0, 0, 0)

      // Upper leg segment (femur) - goes up and out
      const upperLeg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.8), legMat)
      upperLeg.position.set(0, 0, 0.35)
      upperPivot.rotation.x = -Math.PI / 4 // Rotate up 45 deg
      upperLeg.castShadow = true
      upperPivot.add(upperLeg)

      // Lower leg segment pivot (knee)
      const lowerPivot = new THREE.Group()
      lowerPivot.position.set(0, 0, 0.7)

      // Lower leg segment (tibia) - goes down
      const lowerLeg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 1.2), legMat)
      lowerLeg.position.set(0, 0, 0.5)
      lowerPivot.rotation.x = Math.PI / 1.2 // Bend down sharply
      lowerLeg.castShadow = true
      lowerPivot.add(lowerLeg)

      upperPivot.add(lowerPivot)
      legGroup.add(upperPivot)
      spiderGroup.add(legGroup)

      // Store pivots for animation
      legs.push({
        upper: upperPivot,
        lower: lowerPivot,
        side: side,
        index: legIndex,
        baseRotation: legGroup.rotation.y
      })
    }
  }

  // Cast shadows
  spiderGroup.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.castShadow = true
      obj.receiveShadow = true
    }
  })

  return {
    mesh: spiderGroup,
    legs: legs, // Spider-specific: leg pivots for walking animation
    abdomen: abdomen, // For bobbing animation
    head: head
  }
}
