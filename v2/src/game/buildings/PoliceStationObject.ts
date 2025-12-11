import * as THREE from 'three'

/**
 * Creates a police station building (Quartel da Polícia)
 * A 2-story governmental building with blue/white color scheme
 * @param scale - Scale multiplier (default 1)
 */
export function createPoliceStation(scale: number = 1) {
  const stationGroup = new THREE.Group()

  // Materials
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xeceff1, roughness: 0.8 }) // Light gray/white
  const accentMat = new THREE.MeshStandardMaterial({ color: 0x1565c0, roughness: 0.6 }) // Police blue
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x37474f, roughness: 0.7 })
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x88c0ff,
    transparent: true,
    opacity: 0.6,
    roughness: 0.1,
    metalness: 0.2
  })
  const doorMat = new THREE.MeshStandardMaterial({ color: 0x0d47a1, roughness: 0.7 }) // Dark blue door

  // Building dimensions
  const width = 10
  const height = 7
  const depth = 8

  // Main building body - walls
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
    stationGroup.add(mesh)
  })

  // Blue accent stripe (police color)
  const blueStripe1 = new THREE.Mesh(
    new THREE.BoxGeometry(width + 0.1, 0.6, 0.05),
    accentMat
  )
  blueStripe1.position.set(0, 3.5, depth/2 + 0.16)
  stationGroup.add(blueStripe1)

  const blueStripe2 = new THREE.Mesh(
    new THREE.BoxGeometry(width + 0.1, 0.6, 0.05),
    accentMat
  )
  blueStripe2.position.set(0, 3.5, -depth/2 - 0.16)
  stationGroup.add(blueStripe2)

  // Flat roof
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(width + 0.3, 0.4, depth + 0.3),
    roofMat
  )
  roof.position.y = height + 0.2
  roof.castShadow = true
  stationGroup.add(roof)

  // POLÍCIA sign on front
  const signBoard = new THREE.Mesh(
    new THREE.BoxGeometry(6, 1, 0.15),
    accentMat
  )
  signBoard.position.set(0, 5.5, depth/2 + 0.22)
  stationGroup.add(signBoard)

  // "POLÍCIA" text letters (individual boxes)
  const letterMat = new THREE.MeshStandardMaterial({ color: 0xffffff })
  const letterH = 0.6
  const letterW = 0.4
  const letterD = 0.05
  const spacing = 0.55

  // P
  const p = new THREE.Mesh(new THREE.BoxGeometry(letterW, letterH, letterD), letterMat)
  p.position.set(-1.65, 5.5, depth/2 + 0.3)
  stationGroup.add(p)

  // O
  const o = new THREE.Mesh(new THREE.BoxGeometry(letterW, letterH, letterD), letterMat)
  o.position.set(-1.65 + spacing, 5.5, depth/2 + 0.3)
  stationGroup.add(o)

  // L
  const l = new THREE.Mesh(new THREE.BoxGeometry(letterW, letterH, letterD), letterMat)
  l.position.set(-1.65 + spacing * 2, 5.5, depth/2 + 0.3)
  stationGroup.add(l)

  // I with accent (Í)
  const i = new THREE.Mesh(new THREE.BoxGeometry(letterW, letterH, letterD), letterMat)
  i.position.set(-1.65 + spacing * 3, 5.5, depth/2 + 0.3)
  stationGroup.add(i)

  // Accent above I
  const accent = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, letterD), letterMat)
  accent.position.set(-1.65 + spacing * 3, 5.5 + 0.45, depth/2 + 0.3)
  stationGroup.add(accent)

  // C
  const c = new THREE.Mesh(new THREE.BoxGeometry(letterW, letterH, letterD), letterMat)
  c.position.set(-1.65 + spacing * 4, 5.5, depth/2 + 0.3)
  stationGroup.add(c)

  // I
  const i2 = new THREE.Mesh(new THREE.BoxGeometry(letterW, letterH, letterD), letterMat)
  i2.position.set(-1.65 + spacing * 5, 5.5, depth/2 + 0.3)
  stationGroup.add(i2)

  // A
  const a = new THREE.Mesh(new THREE.BoxGeometry(letterW, letterH, letterD), letterMat)
  a.position.set(-1.65 + spacing * 6, 5.5, depth/2 + 0.3)
  stationGroup.add(a)

  // "POLICE" text below POLÍCIA (smaller letters)
  const letterH2 = 0.45
  const letterW2 = 0.35
  const spacing2 = 0.5
  const yPos2 = 4.9 // Below POLÍCIA

  // P
  const p2 = new THREE.Mesh(new THREE.BoxGeometry(letterW2, letterH2, letterD), letterMat)
  p2.position.set(-1.25, yPos2, depth/2 + 0.3)
  stationGroup.add(p2)

  // O
  const o2 = new THREE.Mesh(new THREE.BoxGeometry(letterW2, letterH2, letterD), letterMat)
  o2.position.set(-1.25 + spacing2, yPos2, depth/2 + 0.3)
  stationGroup.add(o2)

  // L
  const l2 = new THREE.Mesh(new THREE.BoxGeometry(letterW2, letterH2, letterD), letterMat)
  l2.position.set(-1.25 + spacing2 * 2, yPos2, depth/2 + 0.3)
  stationGroup.add(l2)

  // I
  const i3 = new THREE.Mesh(new THREE.BoxGeometry(letterW2, letterH2, letterD), letterMat)
  i3.position.set(-1.25 + spacing2 * 3, yPos2, depth/2 + 0.3)
  stationGroup.add(i3)

  // C
  const c2 = new THREE.Mesh(new THREE.BoxGeometry(letterW2, letterH2, letterD), letterMat)
  c2.position.set(-1.25 + spacing2 * 4, yPos2, depth/2 + 0.3)
  stationGroup.add(c2)

  // E
  const e2 = new THREE.Mesh(new THREE.BoxGeometry(letterW2, letterH2, letterD), letterMat)
  e2.position.set(-1.25 + spacing2 * 5, yPos2, depth/2 + 0.3)
  stationGroup.add(e2)

  // Main entrance door
  const door = new THREE.Mesh(
    new THREE.BoxGeometry(2, 3, 0.15),
    doorMat
  )
  door.position.set(0, 1.5, depth/2 + 0.18)
  stationGroup.add(door)

  // Door windows (glass panels on door)
  const doorWindow = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 1.5, 0.05),
    glassMat
  )
  doorWindow.position.set(0, 2, depth/2 + 0.26)
  stationGroup.add(doorWindow)

  // Front windows - First floor
  const frontWin1 = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 1.8, 0.1),
    glassMat
  )
  frontWin1.position.set(-3, 1.8, depth/2 + 0.16)
  stationGroup.add(frontWin1)

  const frontWin2 = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 1.8, 0.1),
    glassMat
  )
  frontWin2.position.set(3, 1.8, depth/2 + 0.16)
  stationGroup.add(frontWin2)

  // Front windows - Second floor
  const frontWin3 = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 1.5, 0.1),
    glassMat
  )
  frontWin3.position.set(-3.5, 4.8, depth/2 + 0.16)
  stationGroup.add(frontWin3)

  const frontWin4 = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 1.5, 0.1),
    glassMat
  )
  frontWin4.position.set(0, 4.8, depth/2 + 0.16)
  stationGroup.add(frontWin4)

  const frontWin5 = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 1.5, 0.1),
    glassMat
  )
  frontWin5.position.set(3.5, 4.8, depth/2 + 0.16)
  stationGroup.add(frontWin5)

  // Side windows (both floors)
  const createSideWindows = (xPos: number) => {
    // First floor
    for (let i = 0; i < 2; i++) {
      const win = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 1.8, 2),
        glassMat
      )
      win.position.set(xPos, 1.8, -2 + i * 4)
      stationGroup.add(win)
    }
    
    // Second floor
    for (let i = 0; i < 2; i++) {
      const win = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 1.5, 2),
        glassMat
      )
      win.position.set(xPos, 4.8, -2 + i * 4)
      stationGroup.add(win)
    }
  }

  createSideWindows(-width/2 - 0.05)
  createSideWindows(width/2 + 0.05)

  // Back windows
  for (let i = 0; i < 3; i++) {
    const backWin1 = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 1.5, 0.1),
      glassMat
    )
    backWin1.position.set(-3 + i * 3, 2, -depth/2 - 0.05)
    stationGroup.add(backWin1)

    const backWin2 = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 1.5, 0.1),
      glassMat
    )
    backWin2.position.set(-3 + i * 3, 5, -depth/2 - 0.05)
    stationGroup.add(backWin2)
  }

  // Antenna on roof (police radio antenna)
  const antennaPole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 2.5, 8),
    new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.6 })
  )
  antennaPole.position.set(3, height + 1.45, -2)
  stationGroup.add(antennaPole)

  // Antenna tip
  const antennaTip = new THREE.Mesh(
    new THREE.ConeGeometry(0.15, 0.4, 8),
    new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 0.3 })
  )
  antennaTip.position.set(3, height + 2.9, -2)
  stationGroup.add(antennaTip)

  // Light beacon on roof
  const beacon = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.3, 0.3, 16),
    new THREE.MeshStandardMaterial({ 
      color: 0x0d47a1, 
      emissive: 0x1976d2,
      emissiveIntensity: 0.5,
      metalness: 0.3
    })
  )
  beacon.position.set(-3, height + 0.55, -2)
  stationGroup.add(beacon)

  // Parking barrier/gate post (entrance control)
  const barrierPost1 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.15, 1.5, 8),
    new THREE.MeshStandardMaterial({ color: 0xffeb3b, metalness: 0.4 })
  )
  barrierPost1.position.set(-3, 0.75, depth/2 + 2)
  stationGroup.add(barrierPost1)

  const barrierPost2 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.15, 1.5, 8),
    new THREE.MeshStandardMaterial({ color: 0xffeb3b, metalness: 0.4 })
  )
  barrierPost2.position.set(3, 0.75, depth/2 + 2)
  stationGroup.add(barrierPost2)

  // Air conditioning units on roof
  const ac1 = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.6, 1),
    new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.8 })
  )
  ac1.position.set(0, height + 0.5, 2)
  stationGroup.add(ac1)

  const ac2 = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.6, 1),
    new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.8 })
  )
  ac2.position.set(-3, height + 0.5, 2)
  stationGroup.add(ac2)

  stationGroup.scale.setScalar(scale)
  return stationGroup
}
