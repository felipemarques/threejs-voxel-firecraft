import * as THREE from 'three'

/**
 * Creates a voxel-style bus
 * Based on v1/src/objects/busElement.js
 * @param scale - Scale multiplier (default 1.0)
 */
export function createBus(scale: number = 1.0) {
  const busGroup = new THREE.Group()

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xf39c12, roughness: 0.6, metalness: 0.3 })
  const windowMat = new THREE.MeshStandardMaterial({ color: 0x5dade2, roughness: 0.2, metalness: 0.8, transparent: true, opacity: 0.6 })
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x212121, roughness: 0.8 })
  const grayMat = new THREE.MeshStandardMaterial({ color: 0x7f8c8d, roughness: 0.5 })

  // Main body
  const body = new THREE.Mesh(new THREE.BoxGeometry(3 * scale, 2.5 * scale, 10 * scale), bodyMat)
  body.position.y = 2 * scale
  body.castShadow = true
  busGroup.add(body)

  // Roof
  const roof = new THREE.Mesh(new THREE.BoxGeometry(3 * scale, 0.3 * scale, 10 * scale), grayMat)
  roof.position.y = 3.4 * scale
  roof.castShadow = true
  busGroup.add(roof)

  // Front nose
  const front = new THREE.Mesh(new THREE.BoxGeometry(2.8 * scale, 2 * scale, 0.5 * scale), bodyMat)
  front.position.set(0, 2 * scale, 5.25 * scale)
  front.castShadow = true
  busGroup.add(front)

  // Front windshield
  const frontWindow = new THREE.Mesh(new THREE.BoxGeometry(2.5 * scale, 1.2 * scale, 0.2 * scale), windowMat)
  frontWindow.position.set(0, 2.5 * scale, 5.4 * scale)
  busGroup.add(frontWindow)

  // Side windows
  const windowPositions = [-3.5, -1.5, 0.5, 2.5]
  windowPositions.forEach((z) => {
    const leftWindow = new THREE.Mesh(new THREE.BoxGeometry(0.1 * scale, 1.2 * scale, 1.5 * scale), windowMat)
    leftWindow.position.set(-1.5 * scale, 2.5 * scale, z * scale)
    busGroup.add(leftWindow)

    const rightWindow = new THREE.Mesh(new THREE.BoxGeometry(0.1 * scale, 1.2 * scale, 1.5 * scale), windowMat)
    rightWindow.position.set(1.5 * scale, 2.5 * scale, z * scale)
    busGroup.add(rightWindow)
  })

  // Wheels (6 wheels)
  const wheelRadius = 0.6 * scale
  const wheelWidth = 0.4 * scale
  const wheelGeometry = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 12)
  const wheelZPositions = [-3.5, 0, 3.5]
  
  wheelZPositions.forEach((z) => {
    const leftWheel = new THREE.Mesh(wheelGeometry, wheelMat)
    leftWheel.rotation.z = Math.PI / 2
    leftWheel.position.set(-1.7 * scale, 0.6 * scale, z * scale)
    leftWheel.castShadow = true
    busGroup.add(leftWheel)

    const rightWheel = new THREE.Mesh(wheelGeometry, wheelMat)
    rightWheel.rotation.z = Math.PI / 2
    rightWheel.position.set(1.7 * scale, 0.6 * scale, z * scale)
    rightWheel.castShadow = true
    busGroup.add(rightWheel)
  })

  // Door
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.15 * scale, 1.8 * scale, 1 * scale), grayMat)
  door.position.set(-1.5 * scale, 1.5 * scale, 4 * scale)
  busGroup.add(door)

  // Back
  const back = new THREE.Mesh(new THREE.BoxGeometry(2.8 * scale, 2 * scale, 0.5 * scale), bodyMat)
  back.position.set(0, 2 * scale, -5.25 * scale)
  back.castShadow = true
  busGroup.add(back)

  // Taillights
  const taillightMat = new THREE.MeshStandardMaterial({ color: 0xe74c3c, emissive: 0xe74c3c, emissiveIntensity: 0.5 })
  ;[-0.8, 0.8].forEach((x) => {
    const taillight = new THREE.Mesh(new THREE.BoxGeometry(0.3 * scale, 0.3 * scale, 0.1 * scale), taillightMat)
    taillight.position.set(x * scale, 1.5 * scale, -5.3 * scale)
    busGroup.add(taillight)
  })

  return busGroup
}
