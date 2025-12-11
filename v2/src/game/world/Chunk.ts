import * as THREE from 'three'
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { createHouse } from '@/game/buildings/HouseObject'
import { createSmallBuilding } from '@/game/buildings/SmallBuildingObject'
import { createTowerBuilding } from '@/game/buildings/Tower3FloorsObject'
import { createApartmentBuilding } from '@/game/buildings/ApartmentBuildingObject'
import { createWarehouse } from '@/game/buildings/WarehouseObject'
import { createPharmacy } from '@/game/buildings/PharmacyObject'
import { createMarket } from '@/game/buildings/MarketObject'
import { createPoliceStation } from '@/game/buildings/PoliceStationObject'
import { createHospital } from '@/game/buildings/HospitalObject'
import { createShopping } from '@/game/buildings/ShoppingObject'
import { createBigGarage } from '@/game/buildings/BigGarageObject'
import { createOakTree, createAlpineTree, createBush } from '@/game/nature/TreesObject'
import { createVehicle } from '@/game/vehicles/VehicleObject'
import { createBus } from '@/game/vehicles/BusObject'
import { createMotorcycle } from '@/game/vehicles/MotorcycleObject'
import { createRock, createRockPillar, createCrystalShard } from '@/game/nature/RocksObject'

const groundMat = new THREE.MeshStandardMaterial({ 
  color: 0x333333,
  roughness: 0.8,
  metalness: 0.1
})

const roadMat = new THREE.MeshStandardMaterial({ color: 0x262626, roughness: 0.95, metalness: 0.05 })
const sidewalkMat = new THREE.MeshStandardMaterial({ color: 0xbdbdbd, roughness: 0.98 })

export interface ChunkParams {
  size: number
  density: number
  seed: number
}

export class Chunk {
  public mesh: THREE.Group
  public x: number
  public z: number
  private params: ChunkParams
  private objects: THREE.Object3D[] = [] // Still keep reference if needed, but maybe not meshes

  constructor(x: number, z: number, params: ChunkParams) {
    this.x = x
    this.z = z
    this.params = params
    this.mesh = new THREE.Group()
    this.mesh.position.set(x * params.size, 0, z * params.size)
    
    this.generate()
  }

  private generate() {
    // 1. Ground - Asphalt
    const groundGeo = new THREE.PlaneGeometry(this.params.size, this.params.size)
    const ground = new THREE.Mesh(groundGeo, groundMat)
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    this.mesh.add(ground)

    // 2. Pseudo-Random Number Generator based on coordinate + seed
    const chunkSeed = this.params.seed + this.x * 1000 + this.z
    const random = this.sfc32(chunkSeed, chunkSeed, chunkSeed, chunkSeed)

    // 3. Geometry Buffer for Merging
    // Map Material UUID -> { material, geometries[] }
    // We categorize by material because we can only merge same-material meshes into one draw call
    const geometriesByMaterial: Map<string, { material: THREE.Material, geometries: THREE.BufferGeometry[] }> = new Map()

    const matrixHelper = new THREE.Matrix4()
    const placementDummy = new THREE.Object3D()

    const addToBuffer = (object: THREE.Object3D, parentMatrix: THREE.Matrix4) => {
        object.updateMatrix()
        const worldMatrix = parentMatrix.clone().multiply(object.matrix)

        if (object instanceof THREE.Mesh) {
            const mat = object.material as THREE.Material
            // Identify unique materials by uuid
            // Note: If material is array, we skip optimization for now or handle complexity
            if (!Array.isArray(mat)) {
                let entry = geometriesByMaterial.get(mat.uuid)
                if (!entry) {
                    entry = { material: mat, geometries: [] }
                    geometriesByMaterial.set(mat.uuid, entry)
                }
                
                // Clone geometry and apply world matrix (position/rotation/scale)
                const clonedGeo = object.geometry.clone()
                clonedGeo.applyMatrix4(worldMatrix)
                entry.geometries.push(clonedGeo)
            }
        }
        
        // Recurse
        object.children.forEach(child => addToBuffer(child, worldMatrix))
    }


    // 3.5 Road / sidewalk grid (instanced) aligned by world coordinates
    // Smaller plot size for denser city feel
    const plotSize = 14 
    const plotsPerSide = Math.floor(this.params.size / plotSize)
    const halfSize = this.params.size / 2

    const roadInterval = plotSize * 3  // keep more buildable area
    const roadWidth = 8
    const sidewalkWidth = 2.2
    const roadThickness = 0.25

    const chunkWorldX = this.x * this.params.size
    const chunkWorldZ = this.z * this.params.size
    const verticalWorldXs: number[] = []
    const horizontalWorldZs: number[] = []

    const pushAligned = (min: number, max: number, interval: number, out: number[]) => {
      let start = Math.floor(min / interval) * interval
      if (start > min) start -= interval
      for (let p = start; p <= max; p += interval) {
        out.push(p)
      }
    }

    pushAligned(chunkWorldX - halfSize - roadWidth, chunkWorldX + halfSize + roadWidth, roadInterval, verticalWorldXs)
    pushAligned(chunkWorldZ - halfSize - roadWidth, chunkWorldZ + halfSize + roadWidth, roadInterval, horizontalWorldZs)

    const localVerticalXs = verticalWorldXs.map(x => x - chunkWorldX)
    const localHorizontalZs = horizontalWorldZs.map(z => z - chunkWorldZ)

    if (localVerticalXs.length > 0) {
      const vRoadGeo = new THREE.BoxGeometry(roadWidth, roadThickness, this.params.size + roadWidth * 2)
      const vRoads = new THREE.InstancedMesh(vRoadGeo, roadMat, localVerticalXs.length)
      vRoads.receiveShadow = true
      localVerticalXs.forEach((x, idx) => {
        matrixHelper.makeTranslation(x, roadThickness / 2, 0)
        vRoads.setMatrixAt(idx, matrixHelper)
      })
      vRoads.instanceMatrix.needsUpdate = true
      this.mesh.add(vRoads)

      const sidewalkGeo = new THREE.BoxGeometry(sidewalkWidth, roadThickness, this.params.size + roadWidth * 2)
      const sidewalks = new THREE.InstancedMesh(sidewalkGeo, sidewalkMat, localVerticalXs.length * 2)
      sidewalks.receiveShadow = true
      let sIdx = 0
      localVerticalXs.forEach(x => {
        const offset = roadWidth / 2 + sidewalkWidth / 2
        matrixHelper.makeTranslation(x - offset, roadThickness / 2, 0)
        sidewalks.setMatrixAt(sIdx++, matrixHelper)
        matrixHelper.makeTranslation(x + offset, roadThickness / 2, 0)
        sidewalks.setMatrixAt(sIdx++, matrixHelper)
      })
      sidewalks.instanceMatrix.needsUpdate = true
      this.mesh.add(sidewalks)
    }

    if (localHorizontalZs.length > 0) {
      const hRoadGeo = new THREE.BoxGeometry(this.params.size + roadWidth * 2, roadThickness, roadWidth)
      const hRoads = new THREE.InstancedMesh(hRoadGeo, roadMat, localHorizontalZs.length)
      hRoads.receiveShadow = true
      localHorizontalZs.forEach((z, idx) => {
        matrixHelper.makeTranslation(0, roadThickness / 2, z)
        hRoads.setMatrixAt(idx, matrixHelper)
      })
      hRoads.instanceMatrix.needsUpdate = true
      this.mesh.add(hRoads)

      const sidewalkGeoH = new THREE.BoxGeometry(this.params.size + roadWidth * 2, roadThickness, sidewalkWidth)
      const sidewalksH = new THREE.InstancedMesh(sidewalkGeoH, sidewalkMat, localHorizontalZs.length * 2)
      sidewalksH.receiveShadow = true
      let sIdx = 0
      localHorizontalZs.forEach(z => {
        const offset = roadWidth / 2 + sidewalkWidth / 2
        matrixHelper.makeTranslation(0, roadThickness / 2, z - offset)
        sidewalksH.setMatrixAt(sIdx++, matrixHelper)
        matrixHelper.makeTranslation(0, roadThickness / 2, z + offset)
        sidewalksH.setMatrixAt(sIdx++, matrixHelper)
      })
      sidewalksH.instanceMatrix.needsUpdate = true
      this.mesh.add(sidewalksH)
    }

    const isNearRoad = (px: number, pz: number) => {
      const clearance = roadWidth / 2 + sidewalkWidth + 1 // leave room for sidewalks + buffer
      for (const vx of localVerticalXs) {
        if (Math.abs(px - vx) < clearance) return true
      }
      for (const hz of localHorizontalZs) {
        if (Math.abs(pz - hz) < clearance) return true
      }
      return false
    }


    // 4. Buildings / Features Generation Loop with Limits

    // Building count limits per chunk
    let warehouseCount = 0
    let towerCount = 0
    const MAX_WAREHOUSES = 4
    const MAX_TOWERS = 4

    for (let ix = 0; ix < plotsPerSide; ix++) {
      for (let iz = 0; iz < plotsPerSide; iz++) {
        if (random() > this.params.density) continue

        const px = (ix * plotSize) - halfSize + (plotSize / 2)
        const pz = (iz * plotSize) - halfSize + (plotSize / 2)

        if (isNearRoad(px, pz)) continue

        const typeRoll = random()
        let obj: any

        if (typeRoll < 0.22) {
           // Nature Mix
           const subRoll = random()
           let mesh
           if (subRoll < 0.4) mesh = random() > 0.5 ? createOakTree() : createAlpineTree()
           else if (subRoll < 0.7) mesh = createBush()
           else if (subRoll < 0.9) mesh = createRock()
           else mesh = random() > 0.5 ? createRockPillar() : createCrystalShard()
           
           mesh.scale.setScalar(1.0 + random() * 0.5)
           obj = { mesh }
        } else if (typeRoll < 0.3) {
           // Vehicles
           const vRoll = random()
           let vMesh
           if (vRoll < 0.5) vMesh = createVehicle('car')
           else if (vRoll < 0.7) vMesh = createVehicle('truck')
           else if (vRoll < 0.9) vMesh = createMotorcycle()
           else vMesh = createBus()
           obj = { mesh: vMesh }
        } else if (typeRoll < 0.4) {
           // House
           obj = { mesh: createHouse() }
        } else if (typeRoll < 0.5) {
           // Small Building
           obj = { mesh: createSmallBuilding() }
        } else if (typeRoll < 0.6) {
           // Apartment (Randomize floors 3 to 8)
           const floors = 3 + Math.floor(random() * 6)
           obj = { mesh: createApartmentBuilding(floors) }
        } else if (typeRoll < 0.7) {
           // Tower3Floors - check limit
           if (towerCount < MAX_TOWERS) {
              obj = { mesh: createTowerBuilding() }
              towerCount++
           } else {
              // Fallback to Apartment if limit reached
              const floors = 3 + Math.floor(random() * 6)
              obj = { mesh: createApartmentBuilding(floors) }
           }
        } else if (typeRoll < 0.8) {
           // Warehouse - check limit
           if (warehouseCount < MAX_WAREHOUSES) {
              obj = { mesh: createWarehouse() }
              warehouseCount++
           } else {
              // Fallback to Apartment if limit reached
              const floors = 3 + Math.floor(random() * 6)
              obj = { mesh: createApartmentBuilding(floors) }
           }
        } else if (typeRoll < 0.85) {
           // Pharmacy
           obj = { mesh: createPharmacy() }
        } else if (typeRoll < 0.88) {
           // Market
           obj = { mesh: createMarket() }
        } else if (typeRoll < 0.91) {
           // Police Station
           obj = { mesh: createPoliceStation() }
        } else if (typeRoll < 0.94) {
           // Hospital
           obj = { mesh: createHospital() }
        } else if (typeRoll < 0.97) {
           // Shopping Mall
           obj = { mesh: createShopping() }
        } else {
           // Big Garage
           obj = { mesh: createBigGarage() }
        }

        if (obj && obj.mesh) {
            // Setup position matrix
            placementDummy.position.set(px, 0, pz)
            // Random Rotation
            const rot = Math.floor(random() * 4) * (Math.PI / 2)
            placementDummy.rotation.y = rot
            placementDummy.updateMatrix()

            // Collect geometries
            addToBuffer(obj.mesh, placementDummy.matrix)

            // Explicitly dispose the source object immediately to free memory
            // This is critical for OOM prevention with many objects
            obj.mesh.traverse((c: any) => {
                if (c.geometry) {
                    c.geometry.dispose()
                }
                // Do NOT dispose materials as they might be shared
            })
        }
      }
    }

    // 5. Merge and Create Final Meshes
    geometriesByMaterial.forEach((entry) => {
        if (entry.geometries.length > 0) {
            // BufferGeometryUtils.mergeGeometries must be imported
            // Verify if geometries behave well (same attributes). Usually standard primitives do.
            try {
                const mergedGeo = BufferGeometryUtils.mergeGeometries(entry.geometries)
                if (mergedGeo) {
                    const mesh = new THREE.Mesh(mergedGeo, entry.material)
                    mesh.castShadow = true
                    mesh.receiveShadow = true
                    this.mesh.add(mesh)
                }
            } catch (e) {
                console.warn("Failed to merge some geometries", e)
            }
            
            // Dispose intermediate geometries
            entry.geometries.forEach(g => g.dispose())
        }
    })
  }

  // Simple Seeded Random Function
  private sfc32(a: number, b: number, c: number, d: number) {
    return function() {
      a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0; 
      let t = (a + b) | 0;
      a = b ^ b >>> 9;
      b = c + (c << 3) | 0;
      c = (c << 21 | c >>> 11);
      d = d + 1 | 0;
      t = t + d | 0;
      c = c + t | 0;
      return (t >>> 0) / 4294967296;
    }
  }

  public dispose() {
    this.mesh.parent?.remove(this.mesh)
    // Geometries are now merged, so we just dispose the children of this.mesh
    this.mesh.children.forEach(c => {
        if (c instanceof THREE.Mesh) {
            c.geometry.dispose()
            // Materials are shared, often don't dispose them unless unique
        }
    })
    this.objects = []
  }
}
