import * as THREE from 'three'

type VehicleType = 'car' | 'truck'

/**
 * Creates a vehicle (Car or Truck) with voxel-style design
 * Based on v1/src/objects/vehicleElement.js
 * @param type - 'car' or 'truck'
 * @param color - Optional custom body color (hex number)
 */
export function createVehicle(type: VehicleType = 'car', color: number | null = null) {
  const vehicleGroup = new THREE.Group()
  vehicleGroup.rotation.y = Math.random() * Math.PI * 2

  const wheelRadius = type === 'truck' ? 0.45 : 0.35
  const wheelCenterY = type === 'truck' ? 0.4 : 0.3

  if (type === 'car') {
    createCar(vehicleGroup, color, wheelRadius, wheelCenterY)
  } else {
    createTruck(vehicleGroup, color, wheelRadius, wheelCenterY)
  }

  return vehicleGroup
}

function createCar(group: THREE.Group, color: number | null, wheelRadius: number, wheelCenterY: number) {
  const palette = [0x1976d2, 0xf2f2f2, 0x111111, 0x8b1a1a, 0xe53935, 0xf1c40f]
  const bodyColor = color !== null ? color : palette[Math.floor(Math.random() * palette.length)]
  
  const bodyMat = new THREE.MeshStandardMaterial({ color: bodyColor, metalness: 0.45, roughness: 0.38 })
  const stripeMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, metalness: 0.2, roughness: 0.6 })
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x1f2a30, roughness: 0.8 })
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, transparent: true, opacity: 0.7, metalness: 0.2, roughness: 0.1 })

  // Main body
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.9, 4.2), bodyMat)
  body.position.y = 0.85
  body.castShadow = true
  group.add(body)

  // Side stripe
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.25, 0.15, 4.25), stripeMat)
  stripe.position.set(0, 0.9, 0)
  group.add(stripe)

  // Cabin
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.9, 2.1), darkMat)
  cabin.position.set(0, 1.55, -0.2)
  cabin.castShadow = true
  group.add(cabin)

  // Windows
  const frontWindow = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.6, 0.08), glassMat)
  frontWindow.position.set(0, 1.55, 1.0)
  group.add(frontWindow)

  const backWindow = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.6, 0.08), glassMat)
  backWindow.position.set(0, 1.55, -1.5)
  group.add(backWindow)

  // Bumpers
  const bumper = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.25, 0.35), darkMat)
  bumper.position.set(0, 0.55, 2.1)
  group.add(bumper)
  const bumperRear = bumper.clone()
  bumperRear.position.z = -2.1
  group.add(bumperRear)

  // Wheels
  createWheels(group, wheelRadius, wheelCenterY, [
    [-0.95, wheelCenterY, 1.35],
    [0.95, wheelCenterY, 1.35],
    [-0.95, wheelCenterY, -1.35],
    [0.95, wheelCenterY, -1.35]
  ])

  // Lights
  addLights(group, 0.8, 2.15, -2.15)
}

function createTruck(group: THREE.Group, color: number | null, wheelRadius: number, wheelCenterY: number) {
  const palette = [0x1e3a5f, 0xf2f2f2, 0x111111, 0x8b1a1a, 0xe53935, 0xf1c40f]
  const bodyColor = color !== null ? color : palette[Math.floor(Math.random() * palette.length)]
  
  const bodyMat = new THREE.MeshStandardMaterial({ color: bodyColor, metalness: 0.55, roughness: 0.42 })
  const stripeMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.7 })
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x1f2a30, roughness: 0.8 })
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, transparent: true, opacity: 0.7 })

  // Main body
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.1, 5.2), bodyMat)
  body.position.y = 1.05
  body.castShadow = true
  group.add(body)

  // Stripe
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.65, 0.18, 5.25), stripeMat)
  stripe.position.set(0, 1.1, 0)
  group.add(stripe)

  // Cabin
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.3, 1.3, 2.2), darkMat)
  cabin.position.set(0, 2.05, 1.2)
  cabin.castShadow = true
  group.add(cabin)

  // Cargo bed
  const cargoBed = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.85, 2.6), new THREE.MeshStandardMaterial({ color: 0x7f8c8d }))
  cargoBed.position.set(0, 1.55, -1.55)
  cargoBed.castShadow = true
  group.add(cargoBed)

  // Windows
  const frontWindow = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.7, 0.08), glassMat)
  frontWindow.position.set(0, 2.05, 2.05)
  group.add(frontWindow)

  const sideWindowL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.6, 1.2), glassMat)
  sideWindowL.position.set(-1.15, 2.05, 1.2)
  group.add(sideWindowL)
  
  const sideWindowR = sideWindowL.clone()
  sideWindowR.position.x = 1.15
  group.add(sideWindowR)

  // Wheels (6 wheels for truck)
  createWheels(group, wheelRadius, 0.4, [
    [-1.1, 0.4, 1.8],
    [1.1, 0.4, 1.8],
    [-1.1, 0.4, -1.5],
    [1.1, 0.4, -1.5],
    [-1.1, 0.4, -2.2],
    [1.1, 0.4, -2.2]
  ])

  // Lights
  addLights(group, 1.85, 2.35, -2.55)
}

function createWheels(group: THREE.Group, wheelRadius: number, wheelCenterY: number, positions: number[][]) {
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x0d0d0d, roughness: 0.9 })
  const rimPalette = [0xdfe4ea, 0x0c0c0c, 0xffffff]

  positions.forEach((pos) => {
    const wheel = new THREE.Mesh(
      new THREE.CylinderGeometry(wheelRadius, wheelRadius, 0.35, 14, 1, false),
      tireMat
    )
    wheel.rotation.z = Math.PI / 2
    wheel.position.set(pos[0], pos[1], pos[2])
    wheel.castShadow = true

    // Rim
    const rim = new THREE.Mesh(
      new THREE.CylinderGeometry(wheelRadius * 0.55, wheelRadius * 0.55, 0.18, 12),
      new THREE.MeshStandardMaterial({
        color: rimPalette[Math.floor(Math.random() * rimPalette.length)],
        roughness: 0.45,
        metalness: 0.65
      })
    )
    rim.rotation.z = Math.PI / 2
    wheel.add(rim)

    group.add(wheel)
  })
}

function addLights(group: THREE.Group, yPos: number, frontZ: number, rearZ: number) {
  const headMat = new THREE.MeshStandardMaterial({ color: 0xffffaa, emissive: 0xfff59d, emissiveIntensity: 0.8 })
  const tailMat = new THREE.MeshStandardMaterial({ color: 0xff5252, emissive: 0xff5252, emissiveIntensity: 0.6 })

  // Headlights
  const headlightL = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.2, 0.1), headMat)
  headlightL.position.set(-0.75, yPos, frontZ)
  group.add(headlightL)

  const headlightR = headlightL.clone()
  headlightR.position.x = 0.75
  group.add(headlightR)

  // Taillights
  const taillightL = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.2, 0.1), tailMat)
  taillightL.position.set(-0.75, yPos, rearZ)
  group.add(taillightL)

  const taillightR = taillightL.clone()
  taillightR.position.x = 0.75
  group.add(taillightR)
}
