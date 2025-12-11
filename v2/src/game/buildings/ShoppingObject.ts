import * as THREE from 'three'

/**
 * Creates a shopping mall building
 * A large modern commercial complex with glass facade
 * @param scale - Scale multiplier (default 1)
 */
export function createShopping(scale: number = 1) {
  const shoppingGroup = new THREE.Group()

  // Materials
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xf0f0f0, roughness: 0.7 }) // Light gray
  const accentMat = new THREE.MeshStandardMaterial({ color: 0x2196f3, roughness: 0.5 }) // Blue accent
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x546e7a, roughness: 0.6 })
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x88c0ff,
    transparent: true,
    opacity: 0.4,
    roughness: 0.1,
    metalness: 0.4
  })
  const signMat = new THREE.MeshStandardMaterial({ 
    color: 0xff9800,
    emissive: 0xff9800,
    emissiveIntensity: 0.3
  }) // Orange/golden sign

  // Building dimensions - large commercial complex
  const width = 16
  const height = 8  // 2 floors
  const depth = 14

  // Main building walls
  const backWall = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, 0.3),
    wallMat
  )
  backWall.position.set(0, height/2, -depth/2)
  backWall.castShadow = true
  backWall.receiveShadow = true
  shoppingGroup.add(backWall)

  const leftWall = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, height, depth),
    wallMat
  )
  leftWall.position.set(-width/2, height/2, 0)
  leftWall.castShadow = true
  leftWall.receiveShadow = true
  shoppingGroup.add(leftWall)

  const rightWall = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, height, depth),
    wallMat
  )
  rightWall.position.set(width/2, height/2, 0)
  rightWall.castShadow = true
  rightWall.receiveShadow = true
  shoppingGroup.add(rightWall)

  // Front wall segments (mostly glass)
  const frontLeftWall = new THREE.Mesh(
    new THREE.BoxGeometry(3, height, 0.3),
    wallMat
  )
  frontLeftWall.position.set(-width/2 + 1.5, height/2, depth/2)
  frontLeftWall.castShadow = true
  shoppingGroup.add(frontLeftWall)

  const frontRightWall = new THREE.Mesh(
    new THREE.BoxGeometry(3, height, 0.3),
    wallMat
  )
  frontRightWall.position.set(width/2 - 1.5, height/2, depth/2)
  frontRightWall.castShadow = true
  shoppingGroup.add(frontRightWall)

  // Upper front wall
  const frontTopWall = new THREE.Mesh(
    new THREE.BoxGeometry(10, 2, 0.3),
    wallMat
  )
  frontTopWall.position.set(0, height - 1, depth/2)
  frontTopWall.castShadow = true
  shoppingGroup.add(frontTopWall)

  // Flat roof
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(width + 0.4, 0.6, depth + 0.4),
    roofMat
  )
  roof.position.y = height + 0.3
  roof.castShadow = true
  shoppingGroup.add(roof)

  // Massive glass storefront (2-story entrance)
  const mainGlass = new THREE.Mesh(
    new THREE.BoxGeometry(9.5, 5.5, 0.15),
    glassMat
  )
  mainGlass.position.set(0, 3, depth/2 + 0.08)
  shoppingGroup.add(mainGlass)

  // Glass doors (entrance)
  const door1 = new THREE.Mesh(
    new THREE.BoxGeometry(2.5, 3.5, 0.12),
    glassMat
  )
  door1.position.set(-2, 1.75, depth/2 + 0.12)
  shoppingGroup.add(door1)

  const door2 = new THREE.Mesh(
    new THREE.BoxGeometry(2.5, 3.5, 0.12),
    glassMat
  )
  door2.position.set(2, 1.75, depth/2 + 0.12)
  shoppingGroup.add(door2)

  // Door frames
  const frame1 = new THREE.Mesh(
    new THREE.BoxGeometry(2.7, 3.7, 0.15),
    new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.6 })
  )
  frame1.position.set(-2, 1.75, depth/2 + 0.1)
  shoppingGroup.add(frame1)

  const frame2 = new THREE.Mesh(
    new THREE.BoxGeometry(2.7, 3.7, 0.15),
    new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.6 })
  )
  frame2.position.set(2, 1.75, depth/2 + 0.1)
  shoppingGroup.add(frame2)

  // Large "SHOPPING" sign on top
  const signBoard = new THREE.Mesh(
    new THREE.BoxGeometry(12, 1.8, 0.3),
    signMat
  )
  signBoard.position.set(0, height - 1, depth/2 + 0.3)
  shoppingGroup.add(signBoard)

  // Sign text effect (white stripe)
  const signText = new THREE.Mesh(
    new THREE.BoxGeometry(11, 0.6, 0.05),
    new THREE.MeshStandardMaterial({ color: 0xffffff })
  )
  signText.position.set(0, height - 1, depth/2 + 0.46)
  shoppingGroup.add(signText)

  // Blue accent stripes
  const accentStripe1 = new THREE.Mesh(
    new THREE.BoxGeometry(width + 0.1, 0.4, 0.05),
    accentMat
  )
  accentStripe1.position.set(0, height/2 + 1, depth/2 + 0.16)
  shoppingGroup.add(accentStripe1)

  const accentStripe2 = new THREE.Mesh(
    new THREE.BoxGeometry(width + 0.1, 0.4, 0.05),
    accentMat
  )
  accentStripe2.position.set(0, height/2 - 1, depth/2 + 0.16)
  shoppingGroup.add(accentStripe2)

  // Side windows (first floor)
  for (let i = 0; i < 4; i++) {
    const leftWin = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 2, 2.5),
      glassMat
    )
    leftWin.position.set(-width/2 - 0.05, 2, -depth/2 + 2 + i * 3.5)
    shoppingGroup.add(leftWin)

    const rightWin = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 2, 2.5),
      glassMat
    )
    rightWin.position.set(width/2 + 0.05, 2, -depth/2 + 2 + i * 3.5)
    shoppingGroup.add(rightWin)
  }

  // Side windows (second floor)
  for (let i = 0; i < 4; i++) {
    const leftWin = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 1.8, 2.2),
      glassMat
    )
    leftWin.position.set(-width/2 - 0.05, 6, -depth/2 + 2 + i * 3.5)
    shoppingGroup.add(leftWin)

    const rightWin = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 1.8, 2.2),
      glassMat
    )
    rightWin.position.set(width/2 + 0.05, 6, -depth/2 + 2 + i * 3.5)
    shoppingGroup.add(rightWin)
  }

  // Back windows
  for (let i = 0; i < 5; i++) {
    const win1 = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 2, 0.1),
      glassMat
    )
    win1.position.set(-width/2 + 2 + i * 3, 2, -depth/2 - 0.05)
    shoppingGroup.add(win1)

    const win2 = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 1.8, 0.1),
      glassMat
    )
    win2.position.set(-width/2 + 2 + i * 3, 6, -depth/2 - 0.05)
    shoppingGroup.add(win2)
  }

  // Rooftop features
  // Large HVAC system
  const hvacMain = new THREE.Mesh(
    new THREE.BoxGeometry(4, 1.5, 2.5),
    new THREE.MeshStandardMaterial({ color: 0x757575, roughness: 0.7 })
  )
  hvacMain.position.set(-4, height + 1.05, -3)
  shoppingGroup.add(hvacMain)

  // AC units
  for (let i = 0; i < 4; i++) {
    const ac = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.8, 0.9),
      new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.8 })
    )
    ac.position.set(2 + i * 1.5, height + 0.7, -4)
    shoppingGroup.add(ac)
  }

  // Skylight panels on roof
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 2; j++) {
      const skylight = new THREE.Mesh(
        new THREE.BoxGeometry(2, 0.2, 2),
        new THREE.MeshStandardMaterial({
          color: 0x88c0ff,
          transparent: true,
          opacity: 0.6,
          roughness: 0.2,
          metalness: 0.3
        })
      )
      skylight.position.set(-3 + i * 3, height + 0.65, 1 + j * 3)
      shoppingGroup.add(skylight)
    }
  }

  // Entrance canopy/awning
  const canopySupports = [
    { x: -5, z: depth/2 + 2 },
    { x: 5, z: depth/2 + 2 }
  ]

  canopySupports.forEach(pos => {
    const support = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.15, 4, 12),
      new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.6 })
    )
    support.position.set(pos.x, 2, pos.z)
    shoppingGroup.add(support)
  })

  const canopy = new THREE.Mesh(
    new THREE.BoxGeometry(11, 0.3, 2.5),
    accentMat
  )
  canopy.position.set(0, 4, depth/2 + 2)
  canopy.castShadow = true
  shoppingGroup.add(canopy)

  // Decorative modern facade panels
  for (let i = 0; i < 3; i++) {
    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(2, 1, 0.1),
      accentMat
    )
    panel.position.set(-5 + i * 5, 6.5, depth/2 + 0.2)
    shoppingGroup.add(panel)
  }

  // Loading dock at back
  const dockDoor = new THREE.Mesh(
    new THREE.BoxGeometry(4, 3, 0.2),
    new THREE.MeshStandardMaterial({ color: 0x795548, roughness: 0.9 })
  )
  dockDoor.position.set(5, 2.5, -depth/2 - 0.05)
  shoppingGroup.add(dockDoor)

  // Parking lot light poles
  const createLightPole = (x: number, z: number) => {
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 5, 8),
      new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.5 })
    )
    pole.position.set(x, 2.5, z)
    shoppingGroup.add(pole)

    const light = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.3, 0.4),
      new THREE.MeshStandardMaterial({ 
        color: 0xffeb3b,
        emissive: 0xffeb3b,
        emissiveIntensity: 0.3
      })
    )
    light.position.set(x, 5, z)
    shoppingGroup.add(light)
  }

  createLightPole(-8, depth/2 + 5)
  createLightPole(8, depth/2 + 5)
  createLightPole(-8, depth/2 + 8)
  createLightPole(8, depth/2 + 8)

  shoppingGroup.scale.setScalar(scale)
  return shoppingGroup
}
