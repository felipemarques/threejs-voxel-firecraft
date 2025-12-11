import * as THREE from 'three'

/**
 * Creates a hospital building
 * A medium-large medical facility with red cross and modern design
 * @param scale - Scale multiplier (default 1)
 */
export function createHospital(scale: number = 1) {
  const hospitalGroup = new THREE.Group()

  // Materials
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.8 }) // White/light gray
  const accentMat = new THREE.MeshStandardMaterial({ color: 0xd32f2f, roughness: 0.5 }) // Red accent
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x616161, roughness: 0.7 })
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x88c0ff,
    transparent: true,
    opacity: 0.5,
    roughness: 0.1,
    metalness: 0.3
  })
  const crossMat = new THREE.MeshStandardMaterial({ 
    color: 0xff0000, 
    emissive: 0xff0000,
    emissiveIntensity: 0.2
  }) // Bright red cross

  // Building dimensions - larger than pharmacy
  const width = 14
  const height = 10  // 2-3 floors
  const depth = 12

  // Main building walls
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
    hospitalGroup.add(mesh)
  })

  // Flat roof
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(width + 0.3, 0.5, depth + 0.3),
    roofMat
  )
  roof.position.y = height + 0.25
  roof.castShadow = true
  hospitalGroup.add(roof)

  // Red accent stripe around building (hospital identifier)
  const accentStripe = new THREE.Mesh(
    new THREE.BoxGeometry(width + 0.1, 0.8, 0.05),
    accentMat
  )
  accentStripe.position.set(0, height/2, depth/2 + 0.16)
  hospitalGroup.add(accentStripe)

  // Large red cross on front wall
  const crossVertical = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 4, 0.1),
    crossMat
  )
  crossVertical.position.set(0, height - 3, depth/2 + 0.2)
  hospitalGroup.add(crossVertical)

  const crossHorizontal = new THREE.Mesh(
    new THREE.BoxGeometry(4, 1.5, 0.1),
    crossMat
  )
  crossHorizontal.position.set(0, height - 3, depth/2 + 0.2)
  hospitalGroup.add(crossHorizontal)

  // Emergency entrance (marked with red)
  const emergencySign = new THREE.Mesh(
    new THREE.BoxGeometry(4, 1, 0.15),
    accentMat
  )
  emergencySign.position.set(-4, 1.5, depth/2 + 0.22)
  hospitalGroup.add(emergencySign)

  // White letters on emergency sign
  const emergencyText = new THREE.Mesh(
    new THREE.BoxGeometry(3.5, 0.4, 0.05),
    new THREE.MeshStandardMaterial({ color: 0xffffff })
  )
  emergencyText.position.set(-4, 1.5, depth/2 + 0.3)
  hospitalGroup.add(emergencyText)

  // Main entrance with glass doors
  const entranceDoor1 = new THREE.Mesh(
    new THREE.BoxGeometry(2, 3, 0.1),
    glassMat
  )
  entranceDoor1.position.set(2, 1.5, depth/2 + 0.16)
  hospitalGroup.add(entranceDoor1)

  const entranceDoor2 = new THREE.Mesh(
    new THREE.BoxGeometry(2, 3, 0.1),
    glassMat
  )
  entranceDoor2.position.set(4.5, 1.5, depth/2 + 0.16)
  hospitalGroup.add(entranceDoor2)

  // Windows - multiple floors
  // Ground floor windows
  for (let i = 0; i < 4; i++) {
    const win = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 2, 0.1),
      glassMat
    )
    win.position.set(-width/2 + 2 + i * 3.5, 2, depth/2 + 0.16)
    hospitalGroup.add(win)
  }

  // First floor windows
  for (let i = 0; i < 5; i++) {
    const win = new THREE.Mesh(
      new THREE.BoxGeometry(2, 1.8, 0.1),
      glassMat
    )
    win.position.set(-width/2 + 1.5 + i * 3, 5, depth/2 + 0.16)
    hospitalGroup.add(win)
  }

  // Second floor windows
  for (let i = 0; i < 5; i++) {
    const win = new THREE.Mesh(
      new THREE.BoxGeometry(2, 1.8, 0.1),
      glassMat
    )
    win.position.set(-width/2 + 1.5 + i * 3, 8, depth/2 + 0.16)
    hospitalGroup.add(win)
  }

  // Side windows (left)
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const win = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 1.8, 2),
        glassMat
      )
      win.position.set(-width/2 - 0.05, 2 + i * 3, -depth/2 + 2 + j * 4)
      hospitalGroup.add(win)
    }
  }

  // Side windows (right)
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const win = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 1.8, 2),
        glassMat
      )
      win.position.set(width/2 + 0.05, 2 + i * 3, -depth/2 + 2 + j * 4)
      hospitalGroup.add(win)
    }
  }

  // Back windows
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 3; j++) {
      const win = new THREE.Mesh(
        new THREE.BoxGeometry(2, 1.8, 0.1),
        glassMat
      )
      win.position.set(-width/2 + 2 + i * 3.5, 2 + j * 3, -depth/2 - 0.05)
      hospitalGroup.add(win)
    }
  }

  // Helipad on roof (H marking)
  const helipadBase = new THREE.Mesh(
    new THREE.CylinderGeometry(2.5, 2.5, 0.2, 32),
    accentMat
  )
  helipadBase.position.set(4, height + 0.45, -3)
  hospitalGroup.add(helipadBase)

  // H letter on helipad
  const hVertical1 = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 2, 0.05),
    new THREE.MeshStandardMaterial({ color: 0xffffff })
  )
  hVertical1.position.set(3.2, height + 0.55, -3)
  hVertical1.rotation.x = -Math.PI / 2
  hospitalGroup.add(hVertical1)

  const hVertical2 = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 2, 0.05),
    new THREE.MeshStandardMaterial({ color: 0xffffff })
  )
  hVertical2.position.set(4.8, height + 0.55, -3)
  hVertical2.rotation.x = -Math.PI / 2
  hospitalGroup.add(hVertical2)

  const hHorizontal = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 1.6, 0.05),
    new THREE.MeshStandardMaterial({ color: 0xffffff })
  )
  hHorizontal.position.set(4, height + 0.55, -3)
  hHorizontal.rotation.x = -Math.PI / 2
  hHorizontal.rotation.z = Math.PI / 2
  hospitalGroup.add(hHorizontal)

  // Helipad lights (small yellow/red indicators)
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2
    const light = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 0.2, 8),
      new THREE.MeshStandardMaterial({ 
        color: i % 2 === 0 ? 0xffff00 : 0xff0000,
        emissive: i % 2 === 0 ? 0xffff00 : 0xff0000,
        emissiveIntensity: 0.4
      })
    )
    light.position.set(
      4 + Math.cos(angle) * 2.3,
      height + 0.55,
      -3 + Math.sin(angle) * 2.3
    )
    hospitalGroup.add(light)
  }

  // Rooftop AC units and equipment
  for (let i = 0; i < 3; i++) {
    const ac = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.8, 1),
      new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.8 })
    )
    ac.position.set(-4 + i * 2, height + 0.65, 3)
    hospitalGroup.add(ac)
  }

  // Emergency ambulance parking canopy
  const canopyPoles = [
    { x: -5, z: depth/2 + 3 },
    { x: -5, z: depth/2 + 6 },
    { x: 2, z: depth/2 + 3 },
    { x: 2, z: depth/2 + 6 }
  ]

  canopyPoles.forEach(pos => {
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 3, 12),
      new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.5 })
    )
    pole.position.set(pos.x, 1.5, pos.z)
    hospitalGroup.add(pole)
  })

  const canopyRoof = new THREE.Mesh(
    new THREE.BoxGeometry(7.5, 0.2, 3.5),
    accentMat
  )
  canopyRoof.position.set(-1.5, 3, depth/2 + 4.5)
  canopyRoof.castShadow = true
  hospitalGroup.add(canopyRoof)

  hospitalGroup.scale.setScalar(scale)
  return hospitalGroup
}
