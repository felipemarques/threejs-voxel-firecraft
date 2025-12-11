import * as THREE from 'three'

/**
 * Creates a pharmacy building (Farmácia)
 * A small, recognizable pharmacy with white/light blue walls and red cross
 * @param scale - Scale multiplier (default 1)
 */
export function createPharmacy(scale: number = 1) {
  const pharmacyGroup = new THREE.Group()

  // Materials
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xe8f4f8, roughness: 0.8 }) // Light blue/white
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x2c5f7c, roughness: 0.7 })
  const crossMat = new THREE.MeshStandardMaterial({ color: 0xd32f2f, roughness: 0.3 }) // Red cross
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x88c0ff,
    transparent: true,
    opacity: 0.6,
    roughness: 0.1,
    metalness: 0.2
  })
  const signMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 })

  // Building dimensions
  const width = 8
  const height = 5
  const depth = 6

  // Main building body
  const walls = [
    { x: 0, y: height/2, z: -depth/2, w: width, h: height, d: 0.3 }, // Back wall
    { x: 0, y: height/2, z: depth/2, w: width, h: height, d: 0.3 },  // Front wall
    { x: -width/2, y: height/2, z: 0, w: 0.3, h: height, d: depth }, // Left wall
    { x: width/2, y: height/2, z: 0, w: 0.3, h: height, d: depth }   // Right wall
  ]

  walls.forEach(w => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w.w, w.h, w.d), wallMat)
    mesh.position.set(w.x, w.y, w.z)
    mesh.castShadow = true
    mesh.receiveShadow = true
    pharmacyGroup.add(mesh)
  })

  // Flat roof
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(width + 0.2, 0.4, depth + 0.2),
    roofMat
  )
  roof.position.y = height + 0.2
  roof.castShadow = true
  pharmacyGroup.add(roof)

  // Red Cross on front wall (main identifier)
  const crossVertical = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 2.5, 0.05),
    crossMat
  )
  crossVertical.position.set(0, 3.5, depth/2 + 0.16)
  pharmacyGroup.add(crossVertical)

  const crossHorizontal = new THREE.Mesh(
    new THREE.BoxGeometry(2.5, 0.8, 0.05),
    crossMat
  )
  crossHorizontal.position.set(0, 3.5, depth/2 + 0.16)
  pharmacyGroup.add(crossHorizontal)

  // Sign board above entrance
  const signBoard = new THREE.Mesh(
    new THREE.BoxGeometry(6, 0.8, 0.1),
    signMat
  )
  signBoard.position.set(0, 1.8, depth/2 + 0.2)
  pharmacyGroup.add(signBoard)

  // Glass storefront windows
  const leftWindow = new THREE.Mesh(
    new THREE.BoxGeometry(2.5, 2, 0.1),
    glassMat
  )
  leftWindow.position.set(-2.5, 1.5, depth/2 + 0.16)
  pharmacyGroup.add(leftWindow)

  const rightWindow = new THREE.Mesh(
    new THREE.BoxGeometry(2.5, 2, 0.1),
    glassMat
  )
  rightWindow.position.set(2.5, 1.5, depth/2 + 0.16)
  pharmacyGroup.add(rightWindow)

  // Entrance door (glass)
  const doorFrame = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 2.5, 0.15),
    new THREE.MeshStandardMaterial({ color: 0x666666 })
  )
  doorFrame.position.set(0, 1.25, depth/2 + 0.18)
  pharmacyGroup.add(doorFrame)

  const doorGlass = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 2.3, 0.1),
    glassMat
  )
  doorGlass.position.set(0, 1.25, depth/2 + 0.2)
  pharmacyGroup.add(doorGlass)

  // Side windows
  const sideWindow1 = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 1.5, 2),
    glassMat
  )
  sideWindow1.position.set(-width/2 - 0.05, 3, -1)
  pharmacyGroup.add(sideWindow1)

  const sideWindow2 = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 1.5, 2),
    glassMat
  )
  sideWindow2.position.set(-width/2 - 0.05, 3, 1.5)
  pharmacyGroup.add(sideWindow2)

  const sideWindow3 = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 1.5, 2),
    glassMat
  )
  sideWindow3.position.set(width/2 + 0.05, 3, -1)
  pharmacyGroup.add(sideWindow3)

  const sideWindow4 = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 1.5, 2),
    glassMat
  )
  sideWindow4.position.set(width/2 + 0.05, 3, 1.5)
  pharmacyGroup.add(sideWindow4)

  // Red cross on roof (visible from above)
  const roofCrossV = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.3, 3.5),
    crossMat
  )
  roofCrossV.position.set(0, height + 0.45, 0)
  pharmacyGroup.add(roofCrossV)

  const roofCrossH = new THREE.Mesh(
    new THREE.BoxGeometry(3.5, 0.3, 1.2),
    crossMat
  )
  roofCrossH.position.set(0, height + 0.45, 0)
  pharmacyGroup.add(roofCrossH)

  pharmacyGroup.scale.setScalar(scale)
  return pharmacyGroup
}
