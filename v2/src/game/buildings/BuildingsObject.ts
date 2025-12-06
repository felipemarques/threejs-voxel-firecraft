import * as THREE from 'three'

/**
 * Creates a simple house with cone roof
 * Based on v1/src/objects/houseElement.js
 * @param scale - Scale multiplier (default 1)
 * @param wallColor - Wall color (default 0xbdc3c7 light gray)
 * @param roofColor - Roof color (default 0x7f8c8d dark gray)
 */
export function createHouse(scale: number = 1, wallColor: number = 0xbdc3c7, roofColor: number = 0x7f8c8d) {
  const houseGroup = new THREE.Group()

  const wallMat = new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.9 })
  const roofMat = new THREE.MeshStandardMaterial({ color: roofColor, roughness: 0.7, metalness: 0.1 })

  // 4 walls
  const walls = [
    { x: 0, y: 2, z: -3, w: 6, h: 4, d: 0.4 }, // Back wall
    { x: 0, y: 2, z: 3, w: 6, h: 4, d: 0.4 },  // Front wall
    { x: -3, y: 2, z: 0, w: 0.4, h: 4, d: 6 }, // Left wall
    { x: 3, y: 2, z: 0, w: 0.4, h: 4, d: 6 }   // Right wall
  ]

  walls.forEach(w => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w.w, w.h, w.d), wallMat)
    mesh.position.set(w.x, w.y, w.z)
    mesh.castShadow = true
    mesh.receiveShadow = true
    houseGroup.add(mesh)
  })

  // Cone roof
  const roof = new THREE.Mesh(new THREE.ConeGeometry(5, 2, 4), roofMat)
  roof.position.y = 5
  roof.rotation.y = Math.PI / 4
  roof.castShadow = true
  houseGroup.add(roof)

  // Door
  const doorMat = new THREE.MeshStandardMaterial({ color: 0x4d2b1b })
  const door = new THREE.Mesh(new THREE.BoxGeometry(1, 2.2, 0.1), doorMat)
  door.position.set(0, 1.1, 3.26)
  houseGroup.add(door)

  // Windows (2 on back wall)
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x88c0ff,
    metalness: 0.1,
    roughness: 0.2,
    transparent: true,
    opacity: 0.8
  })
  const win1 = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 0.05), glassMat)
  win1.position.set(-2, 2.2, -3.26)
  const win2 = win1.clone()
  win2.position.set(2, 2.2, -3.26)
  houseGroup.add(win1)
  houseGroup.add(win2)

  houseGroup.scale.setScalar(scale)
  return houseGroup
}

/**
 * Creates a small 2-story building with ramp
 * Based on v1/src/objects/smallBuildingElement.js
 */
export function createSmallBuilding() {
  const g = new THREE.Group()
  g.rotation.y = Math.random() * Math.PI * 2

  const wallMat = new THREE.MeshStandardMaterial({ color: 0x7f8c8d })
  const floorMat = new THREE.MeshStandardMaterial({ color: 0xbdc3c7 })
  
  const width = 8
  const depth = 8
  const height = 6
  const thick = 0.35
  const doorGap = 2.2
  const halfW = width / 2
  const halfD = depth / 2

  // Walls
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(width, height, thick), wallMat)
  backWall.position.set(0, height / 2, -halfD)
  
  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(thick, height, depth), wallMat)
  leftWall.position.set(-halfW, height / 2, 0)
  
  const rightWall = leftWall.clone()
  rightWall.position.x = halfW

  // Front walls with door gap
  const frontLeft = new THREE.Mesh(new THREE.BoxGeometry((width - doorGap) / 2, height, thick), wallMat)
  frontLeft.position.set(-(doorGap / 2 + (width - doorGap) / 4), height / 2, halfD)
  
  const frontRight = frontLeft.clone()
  frontRight.position.x = (doorGap / 2 + (width - doorGap) / 4)

  ;[backWall, leftWall, rightWall, frontLeft, frontRight].forEach(w => {
    w.castShadow = true
    w.receiveShadow = true
    g.add(w)
  })

  // Ground floor
  const floor1 = new THREE.Mesh(new THREE.BoxGeometry(width - 0.4, 0.3, depth - 0.4), floorMat)
  floor1.position.y = 0.15
  floor1.receiveShadow = true
  g.add(floor1)

  // Second floor
  const floor2 = new THREE.Mesh(new THREE.BoxGeometry(width - 0.4, 0.3, depth - 0.4), floorMat)
  floor2.position.y = 3.4
  floor2.receiveShadow = true
  g.add(floor2)

  // Roof
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(width + 0.4, 0.4, depth + 0.4),
    new THREE.MeshStandardMaterial({ color: 0x95a5a6 })
  )
  roof.position.y = height + 0.2
  roof.castShadow = true
  g.add(roof)

  return g
}

/**
 * Creates a 3-story tower building with stairs
 * Custom creation for v2
 */
export function createTowerBuilding() {
  const g = new THREE.Group()

  const wallMat = new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.8 }) // Brown brick
  const floorMat = new THREE.MeshStandardMaterial({ color: 0xa0a0a0, roughness: 0.7 }) // Gray concrete
  const stairMat = new THREE.MeshStandardMaterial({ color: 0x6a5d4f, roughness: 0.9 }) // Dark brown
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x87ceeb,
    transparent: true,
    opacity: 0.6,
    metalness: 0.3,
    roughness: 0.2
  })
  
  // Double width as requested
  const width = 12
  const depth = 6
  const floorHeight = 3.5
  const thick = 0.3
  const halfW = width / 2
  const halfD = depth / 2
  
  const stairWidth = 2.0 // Wider stairs
  const stairGap = 2.2 // Gap in floor for stairs

  // Create 3 floors
  for (let floor = 0; floor < 3; floor++) {
    const baseY = floor * floorHeight

    // --- FLOOR PLATFORM ---
    // If ground floor (0), full floor.
    // If upper floor (>0), needs hole for stairs coming from below.
    if (floor === 0) {
      const floorPlatform = new THREE.Mesh(new THREE.BoxGeometry(width, 0.3, depth), floorMat)
      floorPlatform.position.y = baseY + 0.15
      floorPlatform.receiveShadow = true
      g.add(floorPlatform)
    } else {
      // Create floor with hole for stairs on the left side
      // 1. Main part (Right side)
      const mainFloorW = width - stairGap
      const mainFloor = new THREE.Mesh(new THREE.BoxGeometry(mainFloorW, 0.3, depth), floorMat)
      mainFloor.position.set(halfW - mainFloorW / 2, baseY + 0.15, 0)
      mainFloor.receiveShadow = true
      g.add(mainFloor)

      // 2. Small strip at back (behind stairs)
      const stairStartZ = -halfD + depth * 0.2
      const backStripD = stairStartZ - (-halfD)
      if (backStripD > 0) {
        const backStrip = new THREE.Mesh(new THREE.BoxGeometry(stairGap, 0.3, backStripD), floorMat)
        backStrip.position.set(-halfW + stairGap / 2, baseY + 0.15, -halfD + backStripD / 2)
        backStrip.receiveShadow = true
        g.add(backStrip)
      }

      // 3. Strip at front (in front of stairs)
      // Stair length approx 3.5m (7 steps * 0.5)
      const stairEndZ = stairStartZ + (7 * 0.5)
      const frontStripD = halfD - stairEndZ
      if (frontStripD > 0) {
        const frontStrip = new THREE.Mesh(new THREE.BoxGeometry(stairGap, 0.3, frontStripD), floorMat)
        frontStrip.position.set(-halfW + stairGap / 2, baseY + 0.15, halfD - frontStripD / 2)
        frontStrip.receiveShadow = true
        g.add(frontStrip)
      }
      
      // Safety railing around stair hole
      const railH = 1.0
      const railGeo = new THREE.BoxGeometry(0.1, railH, 3.5) // Side rail
      const rail = new THREE.Mesh(railGeo, wallMat)
      rail.position.set(-halfW + stairGap, baseY + 0.15 + railH/2, -halfD + depth*0.2 + 1.75)
      g.add(rail)
      
      const railGeo2 = new THREE.BoxGeometry(stairGap, railH, 0.1) // Front rail
      const rail2 = new THREE.Mesh(railGeo2, wallMat)
      rail2.position.set(-halfW + stairGap/2, baseY + 0.15 + railH/2, stairEndZ)
      g.add(rail2)
    }

    // --- WALLS ---
    const wallHeight = floorHeight - 0.3

    // Back wall (Solid with windows)
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(width, wallHeight, thick), wallMat)
    backWall.position.set(0, baseY + wallHeight / 2 + 0.3, -halfD)
    backWall.castShadow = true
    backWall.receiveShadow = true
    g.add(backWall)
    
    // Back Windows (2 large ones)
    const winGeo = new THREE.BoxGeometry(2.5, 1.8, thick + 0.1)
    const winB1 = new THREE.Mesh(winGeo, glassMat)
    winB1.position.set(-3, baseY + 2 + 0.3, -halfD)
    g.add(winB1)
    
    const winB2 = new THREE.Mesh(winGeo, glassMat)
    winB2.position.set(3, baseY + 2 + 0.3, -halfD)
    g.add(winB2)

    // Right wall (Solid with big window)
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(thick, wallHeight, depth), wallMat)
    rightWall.position.set(halfW, baseY + wallHeight / 2 + 0.3, 0)
    rightWall.castShadow = true
    rightWall.receiveShadow = true
    g.add(rightWall)
    
    // Right Window
    const winR = new THREE.Mesh(new THREE.BoxGeometry(thick + 0.1, 1.8, 3), glassMat)
    winR.position.set(halfW, baseY + 2 + 0.3, 0)
    g.add(winR)

    // Left wall (Solid with big window, stair side)
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(thick, wallHeight, depth), wallMat)
    leftWall.position.set(-halfW, baseY + wallHeight / 2 + 0.3, 0)
    leftWall.castShadow = true
    leftWall.receiveShadow = true
    g.add(leftWall)
    
    // Left Window (High up to not conflict with stairs)
    const winL = new THREE.Mesh(new THREE.BoxGeometry(thick + 0.1, 1.2, 3), glassMat)
    winL.position.set(-halfW, baseY + 2.5 + 0.3, 0)
    g.add(winL)

    // Front wall
    if (floor === 0) {
      // Ground floor with Door opening
      // Door is at center? No, let's put door aligned somewhat comfortably.
      // Door width 2.0
      const doorW = 2.0
      const doorH = 2.5
      
      // Wall Left of Door
      const wL = (width - doorW) / 2
      const wallFL = new THREE.Mesh(new THREE.BoxGeometry(wL, wallHeight, thick), wallMat)
      wallFL.position.set(-width/2 + wL/2, baseY + wallHeight/2 + 0.3, halfD)
      wallFL.castShadow = true
      g.add(wallFL)
      
      // Wall Right of Door
      const wallFR = new THREE.Mesh(new THREE.BoxGeometry(wL, wallHeight, thick), wallMat)
      wallFR.position.set(width/2 - wL/2, baseY + wallHeight/2 + 0.3, halfD)
      wallFR.castShadow = true
      g.add(wallFR)
      
      // Wall Above Door
      const wallTop = new THREE.Mesh(new THREE.BoxGeometry(doorW, wallHeight - doorH, thick), wallMat)
      wallTop.position.set(0, baseY + doorH + (wallHeight-doorH)/2 + 0.3, halfD)
      wallTop.castShadow = true
      g.add(wallTop)

    } else {
      // Upper floors full front wall with windows
      const frontWall = new THREE.Mesh(new THREE.BoxGeometry(width, wallHeight, thick), wallMat)
      frontWall.position.set(0, baseY + wallHeight / 2 + 0.3, halfD)
      frontWall.castShadow = true
      frontWall.receiveShadow = true
      g.add(frontWall)
      
      // Front Windows
      const winF1 = new THREE.Mesh(winGeo, glassMat)
      winF1.position.set(-3, baseY + 2 + 0.3, halfD)
      g.add(winF1)
      
      const winF2 = new THREE.Mesh(winGeo, glassMat)
      winF2.position.set(3, baseY + 2 + 0.3, halfD)
      g.add(winF2)
    }

    // --- STAIRS ---
    // Stairs to NEXT floor (except on top floor)
    // Stairs placed on the LEFT side, going from Front to Back (or Back to Front)
    if (floor < 2) {
      const stairCount = 14 // More steps for smoother climb
      const stairDepth = 0.35
      const stairRise = floorHeight / stairCount
      
      // Start Z and Direction
      // Let's go from Front (-ish) to Back (-ish)
      const startZ = halfD - 1.0 
      
      for (let s = 0; s < stairCount; s++) {
        const step = new THREE.Mesh(
          new THREE.BoxGeometry(stairWidth, stairRise * (s + 1), stairDepth),
          stairMat
        )
        // Position: X aligned to left wall
        // Y rising
        // Z moving back
        step.position.set(
          -halfW + stairWidth / 2 + 0.2,
          baseY + 0.3 + stairRise * (s + 1) / 2,
          startZ - s * stairDepth
        )
        step.castShadow = true
        step.receiveShadow = true
        g.add(step)
      }
    }
  }

  // --- ROOF ---
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(width + 0.6, 0.4, depth + 0.6),
    new THREE.MeshStandardMaterial({ color: 0x5a4a3a, roughness: 0.8 })
  )
  roof.position.y = 3 * floorHeight + 0.2
  roof.castShadow = true
  g.add(roof)

  return g
}
