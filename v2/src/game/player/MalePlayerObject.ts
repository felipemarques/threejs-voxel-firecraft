import * as THREE from 'three'

/**
 * Creates a male player character mesh
 * Based on v1/src/objects/playerElement.js
 */
export function createMalePlayer(options: {
  shirtColor?: number
  showHat?: boolean
  weapon?: 'none' | 'pistol' | 'rifle'
} = {}) {
  const {
    shirtColor = 0x3498db,
    showHat = true,
    weapon = 'none'
  } = options

  const playerGroup = new THREE.Group()

  // Materials
  const shirtMat = new THREE.MeshStandardMaterial({ color: shirtColor })
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xffccaa })
  const pantsMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50 })
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x000000 })

  // Head
  const head = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.5, 0.5),
    skinMat
  )
  head.position.y = 1.75
  playerGroup.add(head)

  // Hat
  if (showHat) {
    const capMat = new THREE.MeshStandardMaterial({ color: 0xe74c3c })
    const capTop = new THREE.Mesh(
      new THREE.BoxGeometry(0.52, 0.1, 0.52),
      capMat
    )
    capTop.position.set(0, 0.3, 0)
    head.add(capTop)

    const capBrim = new THREE.Mesh(
      new THREE.BoxGeometry(0.52, 0.02, 0.35),
      capMat
    )
    capBrim.position.set(0, 0.22, 0.35)
    head.add(capBrim)
  }

  // Eyes
  const leftEye = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 0.06, 0.02),
    eyeMat
  )
  leftEye.position.set(-0.1, 0.08, 0.26)
  head.add(leftEye)

  const rightEye = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 0.06, 0.02),
    eyeMat
  )
  rightEye.position.set(0.1, 0.08, 0.26)
  head.add(rightEye)

  // Mouth
  const mouthMat = new THREE.MeshStandardMaterial({ color: 0x2b1b10 })
  const mouth = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.06, 0.02),
    mouthMat
  )
  mouth.position.set(0, -0.16, 0.26)
  head.add(mouth)

  // Body
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.8, 0.3),
    shirtMat
  )
  body.position.y = 1.1
  playerGroup.add(body)

  // Arms
  const armGeo = new THREE.BoxGeometry(0.2, 0.8, 0.2)
  armGeo.translate(0, -0.3, 0)

  const leftArmPivot = new THREE.Group()
  leftArmPivot.position.set(-0.45, 1.4, 0)
  playerGroup.add(leftArmPivot)
  const leftArm = new THREE.Mesh(armGeo, skinMat)
  leftArmPivot.add(leftArm)

  const rightArmPivot = new THREE.Group()
  rightArmPivot.position.set(0.45, 1.4, 0)
  playerGroup.add(rightArmPivot)
  const rightArm = new THREE.Mesh(armGeo, skinMat)
  rightArmPivot.add(rightArm)

  // Legs
  const legGeo = new THREE.BoxGeometry(0.25, 0.8, 0.25)
  legGeo.translate(0, -0.4, 0)

  const leftLegPivot = new THREE.Group()
  leftLegPivot.position.set(-0.15, 0.7, 0)
  playerGroup.add(leftLegPivot)
  const leftLeg = new THREE.Mesh(legGeo, pantsMat)
  leftLegPivot.add(leftLeg)

  const rightLegPivot = new THREE.Group()
  rightLegPivot.position.set(0.15, 0.7, 0)
  playerGroup.add(rightLegPivot)
  const rightLeg = new THREE.Mesh(legGeo, pantsMat)
  rightLegPivot.add(rightLeg)

  // Weapon
  if (weapon && weapon !== 'none') {
    const weaponMesh = createWeapon(weapon)
    if (weaponMesh) {
      rightArmPivot.add(weaponMesh)
      rightArmPivot.rotation.x = -Math.PI / 2
    }
  }

  // Shadows
  playerGroup.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.castShadow = true
      obj.receiveShadow = true
    }
  })

  return {
    mesh: playerGroup,
    leftArmPivot,
    rightArmPivot,
    leftLegPivot,
    rightLegPivot
  }
}

function createWeapon(type: 'pistol' | 'rifle'): THREE.Group | null {
  if (type === 'pistol') {
    const pistol = new THREE.Group()
    const pSlide = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.12, 0.35),
      new THREE.MeshStandardMaterial({ color: 0x1a1a1a })
    )
    pSlide.position.set(0, -0.28, 0.2)
    pistol.add(pSlide)
    return pistol
  }
  
  if (type === 'rifle') {
    const rifle = new THREE.Group()
    const rBarrel = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.08, 0.9),
      new THREE.MeshStandardMaterial({ color: 0x1a1a1a })
    )
    rBarrel.position.set(0, -0.28, 0.45)
    rifle.add(rBarrel)
    return rifle
  }
  
  return null
}
