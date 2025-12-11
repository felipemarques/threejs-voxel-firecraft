import * as THREE from 'three'
import { createVehicle } from '@/game/vehicles/VehicleObject'

/**
 * Creates a big garage with 2 floors
 * A large parking structure with corner ramps, vehicles, and protection barriers
 * @param scale - Scale multiplier (default 1)
 */
export function createBigGarage(scale: number = 1) {
  const garageGroup = new THREE.Group()

  // Materials
  const concreteMat = new THREE.MeshStandardMaterial({ color: 0x9e9e9e, roughness: 0.95 })
  const pillarMat = new THREE.MeshStandardMaterial({ color: 0x757575, roughness: 0.9 })
  const railingMat = new THREE.MeshStandardMaterial({ color: 0x616161, roughness: 0.8, metalness: 0.3 })
  const yellowMat = new THREE.MeshStandardMaterial({ color: 0xffeb3b, roughness: 0.7 })
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x546e7a, roughness: 0.8 })

  // Building dimensions - UPDATED: depth +50% again
  const width = 56
  const floorHeight = 6.825
  const depth = 27  // Was 18, now 27 (another 50% increase)


  // --- FLOOR STRUCTURE WITH RAMP OPENINGS ---
  // Similar to Tower3Floors, we need to create floors with "holes" where ramps connect
  
  // GROUND FLOOR - Full floor (no hole)
  const groundFloor = new THREE.Mesh(
    new THREE.BoxGeometry(width, 0.4, depth),
    concreteMat
  )
  groundFloor.position.set(0, 0.2, 0)
  groundFloor.castShadow = true
  groundFloor.receiveShadow = true
  garageGroup.add(groundFloor)

  // Ramp dimensions
  const rampWidth = 5
  const rampLength = 12
  const rampGap = rampWidth + 1  // Space needed for ramp opening

  // FIRST FLOOR - with opening on LEFT side for ramp from ground
  // Main floor section (right side, away from left ramp)
  const firstFloorMain = new THREE.Mesh(
    new THREE.BoxGeometry(width - rampGap, 0.4, depth),
    concreteMat
  )
  firstFloorMain.position.set((rampGap/2), floorHeight + 0.2, 0)
  firstFloorMain.castShadow = true
  firstFloorMain.receiveShadow = true
  garageGroup.add(firstFloorMain)

  // Front strip (in front of ramp opening on left side)
  const rampFrontMargin = depth/2 - rampLength - 1
  if (rampFrontMargin > 0) {
    const firstFloorFrontStrip = new THREE.Mesh(
      new THREE.BoxGeometry(rampGap, 0.4, rampFrontMargin),
      concreteMat
    )
    firstFloorFrontStrip.position.set(-width/2 + rampGap/2, floorHeight + 0.2, depth/2 - rampFrontMargin/2)
    firstFloorFrontStrip.castShadow = true
    firstFloorFrontStrip.receiveShadow = true
    garageGroup.add(firstFloorFrontStrip)
  }

  // Back strip (behind ramp opening on left side)
  const rampBackMargin = depth/2 - 1
  if (rampBackMargin > 0) {
    const firstFloorBackStrip = new THREE.Mesh(
      new THREE.BoxGeometry(rampGap, 0.4, rampBackMargin),
      concreteMat
    )
    firstFloorBackStrip.position.set(-width/2 + rampGap/2, floorHeight + 0.2, -depth/2 + rampBackMargin/2)
    firstFloorBackStrip.castShadow = true
    firstFloorBackStrip.receiveShadow = true
    garageGroup.add(firstFloorBackStrip)
  }

  // SECOND FLOOR (ROOF) - with opening on RIGHT side for ramp from first floor
  // Main floor section (left side, away from right ramp)
  const secondFloorMain = new THREE.Mesh(
    new THREE.BoxGeometry(width - rampGap, 0.5, depth),
    roofMat
  )
  secondFloorMain.position.set(-(rampGap/2), floorHeight * 2 + 0.25, 0)
  secondFloorMain.castShadow = true
  garageGroup.add(secondFloorMain)

  // Front strip (in front of ramp opening on right side)
  if (rampFrontMargin > 0) {
    const secondFloorFrontStrip = new THREE.Mesh(
      new THREE.BoxGeometry(rampGap, 0.5, rampFrontMargin),
      roofMat
    )
    secondFloorFrontStrip.position.set(width/2 - rampGap/2, floorHeight * 2 + 0.25, depth/2 - rampFrontMargin/2)
    secondFloorFrontStrip.castShadow = true
    garageGroup.add(secondFloorFrontStrip)
  }

  // Back strip (behind ramp opening on right side)
  if (rampBackMargin > 0) {
    const secondFloorBackStrip = new THREE.Mesh(
      new THREE.BoxGeometry(rampGap, 0.5, rampBackMargin),
      roofMat
    )
    secondFloorBackStrip.position.set(width/2 - rampGap/2, floorHeight * 2 + 0.25, -depth/2 + rampBackMargin/2)
    secondFloorBackStrip.castShadow = true
    garageGroup.add(secondFloorBackStrip)
  }

  // Support pillars - 4 rows (removed 1 from each end), increased spacing
  const pillarPositions = []
  const pillarSpacingX = 10.4  // Was 8, now 8 * 1.3 = 10.4 (30% wider)
  const pillarSpacingZ = 7.8   // Was 6, now 6 * 1.3 = 7.8 (30% wider)
  const numPillarsX = 5  // Reduced from 6 to fit with wider spacing
  const numPillarsZ = 3  // Changed from 4 to 3 (removed 1 from each end = 2 total removed)

  for (let ix = 0; ix < numPillarsX; ix++) {
    for (let iz = 0; iz < numPillarsZ; iz++) {
      pillarPositions.push({ 
        x: -width/2 + 6 + ix * pillarSpacingX, 
        z: -depth/2 + 5 + iz * pillarSpacingZ 
      })
    }
  }

  pillarPositions.forEach(pos => {
    // Ground to first floor pillar
    const pillar1 = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, floorHeight, 0.6),
      pillarMat
    )
    pillar1.position.set(pos.x, floorHeight / 2, pos.z)
    pillar1.castShadow = true
    pillar1.receiveShadow = true
    garageGroup.add(pillar1)

    // First to second floor pillar
    const pillar2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, floorHeight, 0.6),
      pillarMat
    )
    pillar2.position.set(pos.x, floorHeight + floorHeight / 2, pos.z)
    pillar2.castShadow = true
    pillar2.receiveShadow = true
    garageGroup.add(pillar2)

    // NO third floor pillars - open-air roof level
  })

  // Back wall (closed) - only 2 floors (not extending to open roof)
  const backWall = new THREE.Mesh(
    new THREE.BoxGeometry(width, floorHeight * 2, 0.3),
    concreteMat
  )
  backWall.position.set(0, floorHeight, -depth/2)
  backWall.castShadow = true
  backWall.receiveShadow = true
  garageGroup.add(backWall)

  // Side walls (partial) - only 2 floors (open roof on top)
  for (let i = 0; i < 2; i++) {  // 2 floors only
    // Left side panels
    const panelL1 = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, floorHeight, 8),
      concreteMat
    )
    panelL1.position.set(-width/2, 0.5 + i * floorHeight + floorHeight/2, -depth/2 + 4)
    panelL1.castShadow = true
    garageGroup.add(panelL1)

    const panelL2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, floorHeight, 8),
      concreteMat
    )
    panelL2.position.set(-width/2, 0.5 + i * floorHeight + floorHeight/2, depth/2 - 4)
    panelL2.castShadow = true
    garageGroup.add(panelL2)

    // Right side panels
    const panelR1 = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, floorHeight, 8),
      concreteMat
    )
    panelR1.position.set(width/2, 0.5 + i * floorHeight + floorHeight/2, -depth/2 + 4)
    panelR1.castShadow = true
    garageGroup.add(panelR1)

    const panelR2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, floorHeight, 8),
      concreteMat
    )
    panelR2.position.set(width/2, 0.5 + i * floorHeight + floorHeight/2, depth/2 - 4)
    panelR2.castShadow = true
    garageGroup.add(panelR2)
  }

  // CORNER RAMPS - Left corner (ground to first floor)
  const ramp1 = new THREE.Mesh(
    new THREE.BoxGeometry(rampWidth, 0.4, rampLength),
    concreteMat
  )
  ramp1.position.set(-width/2 + rampWidth/2 + 1, floorHeight / 2, depth/2 - rampLength/2 - 1)
  ramp1.rotation.x = Math.PI / 9
  ramp1.castShadow = true
  ramp1.receiveShadow = true
  garageGroup.add(ramp1)

  // Yellow stripe on ramp 1
  const rampStripe1 = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.05, rampLength),
    yellowMat
  )
  rampStripe1.position.set(-width/2 + rampWidth/2 + 1, floorHeight / 2 + 0.25, depth/2 - rampLength/2 - 1)
  rampStripe1.rotation.x = Math.PI / 9
  garageGroup.add(rampStripe1)

  // CORNER RAMPS - Right corner (first to second floor)
  const ramp2 = new THREE.Mesh(
    new THREE.BoxGeometry(rampWidth, 0.4, rampLength),
    concreteMat
  )
  ramp2.position.set(width/2 - rampWidth/2 - 1, floorHeight + floorHeight / 2, depth/2 - rampLength/2 - 1)
  ramp2.rotation.x = Math.PI / 9
  ramp2.castShadow = true
  ramp2.receiveShadow = true
  garageGroup.add(ramp2)

  // Yellow stripe on ramp 2
  const rampStripe2 = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.05, rampLength),
    yellowMat
  )
  rampStripe2.position.set(width/2 - rampWidth/2 - 1, floorHeight + floorHeight / 2 + 0.25, depth/2 - rampLength/2 - 1)
  rampStripe2.rotation.x = Math.PI / 9
  garageGroup.add(rampStripe2)

  // Front protection barriers (muretas) - WITH GAPS at corners for ramps - ALL 3 FLOORS
  const barrierHeight = 1.2
  const barrierThickness = 0.3

  // Left barrier (not covering left corner ramp) - GROUND FLOOR
  const leftBarrierWidth = width / 2 - rampWidth - 2
  const leftBarrier1 = new THREE.Mesh(
    new THREE.BoxGeometry(leftBarrierWidth, barrierHeight, barrierThickness),
    concreteMat
  )
  leftBarrier1.position.set(-width/4 - rampWidth/2 - 1, barrierHeight/2, depth/2)
  leftBarrier1.castShadow = true
  garageGroup.add(leftBarrier1)

  // Left barrier - FIRST FLOOR
  const leftBarrier2 = new THREE.Mesh(
    new THREE.BoxGeometry(leftBarrierWidth, barrierHeight, barrierThickness),
    concreteMat
  )
  leftBarrier2.position.set(-width/4 - rampWidth/2 - 1, floorHeight + barrierHeight/2, depth/2)
  leftBarrier2.castShadow = true
  garageGroup.add(leftBarrier2)

  // Left barrier - ROOF (SECOND FLOOR)
  const leftBarrier3 = new THREE.Mesh(
    new THREE.BoxGeometry(leftBarrierWidth, barrierHeight, barrierThickness),
    concreteMat
  )
  leftBarrier3.position.set(-width/4 - rampWidth/2 - 1, floorHeight * 2 + barrierHeight/2, depth/2)
  leftBarrier3.castShadow = true
  garageGroup.add(leftBarrier3)

  // Right barrier (not covering right corner ramp) - GROUND FLOOR
  const rightBarrier1 = new THREE.Mesh(
    new THREE.BoxGeometry(leftBarrierWidth, barrierHeight, barrierThickness),
    concreteMat
  )
  rightBarrier1.position.set(width/4 + rampWidth/2 + 1, barrierHeight/2, depth/2)
  rightBarrier1.castShadow = true
  garageGroup.add(rightBarrier1)

  // Right barrier - FIRST FLOOR
  const rightBarrier2 = new THREE.Mesh(
    new THREE.BoxGeometry(leftBarrierWidth, barrierHeight, barrierThickness),
    concreteMat
  )
  rightBarrier2.position.set(width/4 + rampWidth/2 + 1, floorHeight + barrierHeight/2, depth/2)
  rightBarrier2.castShadow = true
  garageGroup.add(rightBarrier2)

  // Right barrier - ROOF (SECOND FLOOR)
  const rightBarrier3 = new THREE.Mesh(
    new THREE.BoxGeometry(leftBarrierWidth, barrierHeight, barrierThickness),
    concreteMat
  )
  rightBarrier3.position.set(width/4 + rampWidth/2 + 1, floorHeight * 2 + barrierHeight/2, depth/2)
  rightBarrier3.castShadow = true
  garageGroup.add(rightBarrier3)

  // PARKING SPACE MARKINGS - MORE lines
  const numParkingSpaces = 15  // More parking spaces

  // Ground floor parking lines
  for (let i = 0; i < numParkingSpaces; i++) {
    const line = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.05, 4),
      yellowMat
    )
    line.position.set(-width/2 + 4 + i * 3.5, 0.45, -depth/4)
    garageGroup.add(line)
  }

  // First floor parking lines
  for (let i = 0; i < numParkingSpaces; i++) {
    const line = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.05, 4),
      yellowMat
    )
    line.position.set(-width/2 + 4 + i * 3.5, floorHeight + 0.45, -depth/4)
    garageGroup.add(line)
  }

  // ADD REAL VEHICLES from VehicleObject - 3 per floor
  // Ground floor vehicles
  const car1 = createVehicle('car')
  car1.position.set(-15, 0.7, -depth/4)  // Raised from 0.2 to 0.7
  car1.rotation.y = 0  // Changed from Math.PI / 2
  garageGroup.add(car1)

  const truck1 = createVehicle('truck')
  truck1.position.set(5, 0.7, -depth/4)  // Raised from 0.2 to 0.7
  truck1.rotation.y = 0  // Changed from Math.PI / 2
  garageGroup.add(truck1)

  const car2 = createVehicle('car')
  car2.position.set(20, 0.7, -depth/4)  // Raised from 0.2 to 0.7
  car2.rotation.y = 0  // Changed from Math.PI / 2
  garageGroup.add(car2)

  // First floor vehicles
  const truck2 = createVehicle('truck')
  truck2.position.set(-10, floorHeight + 0.7, -depth/4)  // Raised from 0.2 to 0.7
  truck2.rotation.y = 0  // Changed from Math.PI / 2
  garageGroup.add(truck2)

  const car3 = createVehicle('car')
  car3.position.set(0, floorHeight + 0.7, -depth/4)  // Raised from 0.2 to 0.7
  car3.rotation.y = 0  // Changed from Math.PI / 2
  garageGroup.add(car3)

  const car4 = createVehicle('car')
  car4.position.set(15, floorHeight + 0.7, -depth/4)  // Raised from 0.2 to 0.7
  car4.rotation.y = 0  // Changed from Math.PI / 2
  garageGroup.add(car4)

  // Floor number signs
  const createFloorNumber = (number: string, position: THREE.Vector3) => {
    const numberSign = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 0.1),
      new THREE.MeshStandardMaterial({ 
        color: 0xffeb3b,
        emissive: 0xffeb3b,
        emissiveIntensity: 0.2
      })
    )
    numberSign.position.copy(position)
    garageGroup.add(numberSign)
  }

  createFloorNumber('1', new THREE.Vector3(-width/2 + 2, floorHeight - 1, -depth/2 + 0.2))
  createFloorNumber('2', new THREE.Vector3(-width/2 + 2, floorHeight * 2 - 1, -depth/2 + 0.2))

  // Ceiling lights
  const createLight = (x: number, y: number, z: number) => {
    const light = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.4, 0.2, 12),
      new THREE.MeshStandardMaterial({ 
        color: 0xffffff,
        emissive: 0xffffaa,
        emissiveIntensity: 0.4
      })
    )
    light.position.set(x, y, z)
    garageGroup.add(light)
  }

  // Ground floor lights
  for (let i = 0; i < 5; i++) {  // Reduced from 6 to 5 for fewer pillars
    for (let j = 0; j < 3; j++) {
      createLight(-width/2 + 8 + i * 10, floorHeight - 0.3, -depth/2 + 6 + j * 8)
    }
  }

  // First floor lights
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 3; j++) {
      createLight(-width/2 + 8 + i * 10, floorHeight * 2 - 0.3, -depth/2 + 6 + j * 8)
    }
  }

  // NO ROOF LIGHTS - open-air parking on top level

  garageGroup.scale.setScalar(scale)
  return garageGroup
}
