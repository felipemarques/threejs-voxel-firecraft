import * as THREE from 'three'

/**
 * Creates a market/supermarket building (Mercado)
 * A medium-sized commercial building with large glass storefront
 * @param scale - Scale multiplier (default 1)
 */
export function createMarket(scale: number = 1) {
  const marketGroup = new THREE.Group()

  // Materials
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.8 }) // Light gray
  const accentMat = new THREE.MeshStandardMaterial({ color: 0xff9800, roughness: 0.6 }) // Orange accent
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x455a64, roughness: 0.7 })
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x88c0ff,
    transparent: true,
    opacity: 0.5,
    roughness: 0.1,
    metalness: 0.3
  })
  const signMat = new THREE.MeshStandardMaterial({ color: 0xff5722, roughness: 0.4 }) // Red-orange sign

  // Building dimensions
  const width = 12
  const height = 6
  const depth = 10

  // Main building walls
  const backWall = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, 0.3),
    wallMat
  )
  backWall.position.set(0, height/2, -depth/2)
  backWall.castShadow = true
  backWall.receiveShadow = true
  marketGroup.add(backWall)

  const leftWall = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, height, depth),
    wallMat
  )
  leftWall.position.set(-width/2, height/2, 0)
  leftWall.castShadow = true
  leftWall.receiveShadow = true
  marketGroup.add(leftWall)

  const rightWall = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, height, depth),
    wallMat
  )
  rightWall.position.set(width/2, height/2, 0)
  rightWall.castShadow = true
  rightWall.receiveShadow = true
  marketGroup.add(rightWall)

  // Front wall segments (with large glass storefront opening)
  const frontLeftWall = new THREE.Mesh(
    new THREE.BoxGeometry(2, height, 0.3),
    wallMat
  )
  frontLeftWall.position.set(-5, height/2, depth/2)
  frontLeftWall.castShadow = true
  marketGroup.add(frontLeftWall)

  const frontRightWall = new THREE.Mesh(
    new THREE.BoxGeometry(2, height, 0.3),
    wallMat
  )
  frontRightWall.position.set(5, height/2, depth/2)
  frontRightWall.castShadow = true
  marketGroup.add(frontRightWall)

  // Upper front wall
  const frontTopWall = new THREE.Mesh(
    new THREE.BoxGeometry(8, height - 3.5, 0.3),
    wallMat
  )
  frontTopWall.position.set(0, height - (height - 3.5)/2, depth/2)
  frontTopWall.castShadow = true
  marketGroup.add(frontTopWall)

  // Flat roof
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(width + 0.3, 0.5, depth + 0.3),
    roofMat
  )
  roof.position.y = height + 0.25
  roof.castShadow = true
  marketGroup.add(roof)

  // Large glass storefront
  const storefront = new THREE.Mesh(
    new THREE.BoxGeometry(7.5, 3, 0.15),
    glassMat
  )
  storefront.position.set(0, 1.75, depth/2 + 0.08)
  marketGroup.add(storefront)

  // Glass door
  const door = new THREE.Mesh(
    new THREE.BoxGeometry(2, 3, 0.1),
    glassMat
  )
  door.position.set(0, 1.5, depth/2 + 0.12)
  marketGroup.add(door)

  // Door frame
  const doorFrame = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 3.2, 0.12),
    new THREE.MeshStandardMaterial({ color: 0x333333 })
  )
  doorFrame.position.set(0, 1.6, depth/2 + 0.1)
  marketGroup.add(doorFrame)

  // Large sign board on front
  const signBoard = new THREE.Mesh(
    new THREE.BoxGeometry(10, 1.5, 0.2),
    signMat
  )
  signBoard.position.set(0, height - 0.75, depth/2 + 0.25)
  marketGroup.add(signBoard)

  // "MERCADO" text effect with accent stripe
  const textStripe = new THREE.Mesh(
    new THREE.BoxGeometry(9, 0.3, 0.05),
    new THREE.MeshStandardMaterial({ color: 0xffffff })
  )
  textStripe.position.set(0, height - 0.75, depth/2 + 0.36)
  marketGroup.add(textStripe)

  // Accent stripe around building (orange band)
  const accentStripe = new THREE.Mesh(
    new THREE.BoxGeometry(width + 0.1, 0.5, 0.05),
    accentMat
  )
  accentStripe.position.set(0, 4.5, depth/2 + 0.16)
  marketGroup.add(accentStripe)

  // Side windows
  for (let i = 0; i < 3; i++) {
    const leftWin = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 1.8, 2),
      glassMat
    )
    leftWin.position.set(-width/2 - 0.05, 3.5, -3 + i * 3)
    marketGroup.add(leftWin)

    const rightWin = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 1.8, 2),
      glassMat
    )
    rightWin.position.set(width/2 + 0.05, 3.5, -3 + i * 3)
    marketGroup.add(rightWin)
  }

  // Back loading dock area (elevated platform)
  const loadingDock = new THREE.Mesh(
    new THREE.BoxGeometry(4, 0.3, 3),
    new THREE.MeshStandardMaterial({ color: 0x666666 })
  )
  loadingDock.position.set(3, 1, -depth/2 - 1.35)
  loadingDock.castShadow = true
  marketGroup.add(loadingDock)

  // Loading dock door - SOLID to avoid glitching
  const dockDoor = new THREE.Mesh(
    new THREE.BoxGeometry(3.5, 2.5, 0.3),
    new THREE.MeshStandardMaterial({ color: 0x795548, roughness: 0.9 })
  )
  dockDoor.position.set(3, 2.25, -depth/2 - 0.15)
  dockDoor.castShadow = true
  dockDoor.receiveShadow = true
  marketGroup.add(dockDoor)

  // "MARKET" text on sign (individual letter boxes)
  const letterMat = new THREE.MeshStandardMaterial({ color: 0xffffff })
  const letterHeight = 0.8
  const letterWidth = 0.5
  const letterDepth = 0.05
  const letterSpacing = 0.7

  // M
  const m = new THREE.Mesh(new THREE.BoxGeometry(letterWidth, letterHeight, letterDepth), letterMat)
  m.position.set(-2.1, height - 0.75, depth/2 + 0.36)
  marketGroup.add(m)

  // A
  const a = new THREE.Mesh(new THREE.BoxGeometry(letterWidth, letterHeight, letterDepth), letterMat)
  a.position.set(-2.1 + letterSpacing, height - 0.75, depth/2 + 0.36)
  marketGroup.add(a)

  // R
  const r = new THREE.Mesh(new THREE.BoxGeometry(letterWidth, letterHeight, letterDepth), letterMat)
  r.position.set(-2.1 + letterSpacing * 2, height - 0.75, depth/2 + 0.36)
  marketGroup.add(r)

  // K
  const k = new THREE.Mesh(new THREE.BoxGeometry(letterWidth, letterHeight, letterDepth), letterMat)
  k.position.set(-2.1 + letterSpacing * 3, height - 0.75, depth/2 + 0.36)
  marketGroup.add(k)

  // E
  const e = new THREE.Mesh(new THREE.BoxGeometry(letterWidth, letterHeight, letterDepth), letterMat)
  e.position.set(-2.1 + letterSpacing * 4, height - 0.75, depth/2 + 0.36)
  marketGroup.add(e)

  // T
  const t = new THREE.Mesh(new THREE.BoxGeometry(letterWidth, letterHeight, letterDepth), letterMat)
  t.position.set(-2.1 + letterSpacing * 5, height - 0.75, depth/2 + 0.36)
  marketGroup.add(t)

  // Shopping cart corral (simple frame structure)
  const cartCorral = new THREE.Group()
  
  // Corral poles
  for (let i = 0; i < 4; i++) {
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 1.5, 8),
      new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.6 })
    )
    pole.position.set(
      i < 2 ? -4.5 : -3,
      0.75,
      i % 2 === 0 ? depth/2 + 2 : depth/2 + 3.5
    )
    cartCorral.add(pole)
  }
  
  marketGroup.add(cartCorral)

  // Rooftop AC units
  const createACUnit = () => {
    const ac = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.8, 0.8),
      new THREE.MeshStandardMaterial({ color: 0x666666, metalness: 0.3 })
    )
    return ac
  }

  const ac1 = createACUnit()
  ac1.position.set(-3, height + 0.65, -2)
  marketGroup.add(ac1)

  const ac2 = createACUnit()
  ac2.position.set(3, height + 0.65, -2)
  marketGroup.add(ac2)

  marketGroup.scale.setScalar(scale)
  return marketGroup
}
