import * as THREE from 'three'

/**
 * Creates a detailed Apartment Building using DIRECT BUFFER GEOMETRY GENERATION.
 * This avoids creating thousands of intermediate objects, solving Memory/GC issues.
 */

// --- CACHES & PALETTES ---
const wallCache = new Map<number, THREE.Material>()
const roofCache = new Map<number, THREE.Material>()
const glassCache = new Map<number, THREE.Material>()
const doorMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50 })

// Theme Palettes
const APARTMENT_THEMES = [
  { wall: 0xc8d6e5, roof: 0x576574, win: 0x88c0ff }, // Default Blue-Gray
  { wall: 0xf5deb3, roof: 0x8b4513, win: 0xadd8e6 }, // Beige/Brown
  { wall: 0xe0e0e0, roof: 0x333333, win: 0x87cefa }, // Modern White/Black
  { wall: 0xa8c5ba, roof: 0x2f4f4f, win: 0xb0e0e6 }, // Sage Green
  { wall: 0xd3b8ae, roof: 0x5d4037, win: 0xffe4e1 }, // Warm Brick/Terracotta
  { wall: 0x95a5a6, roof: 0x2c3e50, win: 0xecf0f1 }  // Concrete/Dark
]

// --- GEOMETRY BUILDER ---
class SimpleBoxBuilder {
  private positions: number[] = []
  private normals: number[] = []
  private uvs: number[] = []
  private indices: number[] = []
  private vertexCount = 0

  // Add a box at (x,y,z) with size (w,h,d)
  addBox(x: number, y: number, z: number, w: number, h: number, d: number) {
      const halfW = w / 2
      const halfH = h / 2
      const halfD = d / 2

      // 8 Vertices relative to center
      const v = [
          // Front (z+)
          { x: -halfW, y: -halfH, z: halfD, nx: 0, ny: 0, nz: 1, u: 0, v: 0 }, // 0
          { x: halfW, y: -halfH, z: halfD, nx: 0, ny: 0, nz: 1, u: 1, v: 0 }, // 1
          { x: halfW, y: halfH, z: halfD, nx: 0, ny: 0, nz: 1, u: 1, v: 1 }, // 2
          { x: -halfW, y: halfH, z: halfD, nx: 0, ny: 0, nz: 1, u: 0, v: 1 }, // 3
          // Back (z-)
          { x: halfW, y: -halfH, z: -halfD, nx: 0, ny: 0, nz: -1, u: 0, v: 0 }, // 4
          { x: -halfW, y: -halfH, z: -halfD, nx: 0, ny: 0, nz: -1, u: 1, v: 0 }, // 5
          { x: -halfW, y: halfH, z: -halfD, nx: 0, ny: 0, nz: -1, u: 1, v: 1 }, // 6
          { x: halfW, y: halfH, z: -halfD, nx: 0, ny: 0, nz: -1, u: 0, v: 1 }, // 7
          // Top (y+)
          { x: -halfW, y: halfH, z: halfD, nx: 0, ny: 1, nz: 0, u: 0, v: 0 }, // 8
          { x: halfW, y: halfH, z: halfD, nx: 0, ny: 1, nz: 0, u: 1, v: 0 }, // 9
          { x: halfW, y: halfH, z: -halfD, nx: 0, ny: 1, nz: 0, u: 1, v: 1 }, // 10
          { x: -halfW, y: halfH, z: -halfD, nx: 0, ny: 1, nz: 0, u: 0, v: 1 }, // 11
          // Bottom (y-)
          { x: -halfW, y: -halfH, z: -halfD, nx: 0, ny: -1, nz: 0, u: 0, v: 0 }, // 12
          { x: halfW, y: -halfH, z: -halfD, nx: 0, ny: -1, nz: 0, u: 1, v: 0 }, // 13
          { x: halfW, y: -halfH, z: halfD, nx: 0, ny: -1, nz: 0, u: 1, v: 1 }, // 14
          { x: -halfW, y: -halfH, z: halfD, nx: 0, ny: -1, nz: 0, u: 0, v: 1 }, // 15
           // Right (x+)
           { x: halfW, y: -halfH, z: halfD, nx: 1, ny: 0, nz: 0, u: 0, v: 0 }, // 16
           { x: halfW, y: -halfH, z: -halfD, nx: 1, ny: 0, nz: 0, u: 1, v: 0 }, // 17
           { x: halfW, y: halfH, z: -halfD, nx: 1, ny: 0, nz: 0, u: 1, v: 1 }, // 18
           { x: halfW, y: halfH, z: halfD, nx: 1, ny: 0, nz: 0, u: 0, v: 1 }, // 19
           // Left (x-)
           { x: -halfW, y: -halfH, z: -halfD, nx: -1, ny: 0, nz: 0, u: 0, v: 0 }, // 20
           { x: -halfW, y: -halfH, z: halfD, nx: -1, ny: 0, nz: 0, u: 1, v: 0 }, // 21
           { x: -halfW, y: halfH, z: halfD, nx: -1, ny: 0, nz: 0, u: 1, v: 1 }, // 22
           { x: -halfW, y: halfH, z: -halfD, nx: -1, ny: 0, nz: 0, u: 0, v: 1 }, // 23
      ]

      // Push vertices transformed by offset
      for (let i = 0; i < v.length; i++) {
          this.positions.push(v[i].x + x, v[i].y + y, v[i].z + z)
          this.normals.push(v[i].nx, v[i].ny, v[i].nz)
          this.uvs.push(v[i].u, v[i].v)
      }

      // 6 Quads per box, 2 triangles per quad = 12 tris * 3 indices = 36 indices
      // Vertex offsets (groups of 4)
      const base = this.vertexCount
      
      const addQuad = (a: number, b: number, c: number, d: number) => {
          this.indices.push(base + a, base + b, base + d)
          this.indices.push(base + b, base + c, base + d)
      }

      addQuad(0, 1, 2, 3) // Front
      addQuad(4, 5, 6, 7) // Back
      addQuad(8, 9, 10, 11) // Top
      addQuad(12, 13, 14, 15) // Bottom
      addQuad(16, 17, 18, 19) // Right
      addQuad(20, 21, 22, 23) // Left

      this.vertexCount += 24
  }

  build(): THREE.BufferGeometry {
      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(this.positions, 3))
      geometry.setAttribute('normal', new THREE.Float32BufferAttribute(this.normals, 3))
      geometry.setAttribute('uv', new THREE.Float32BufferAttribute(this.uvs, 2))
      geometry.setIndex(this.indices)
      return geometry
  }
}

// --- MAIN FUNCTION ---
// --- MAIN FUNCTION ---
export function createApartmentBuilding(
  floors: number = 4,
  scale: number = 1,
  wallColor?: number, // Restored parameter
  width?: number,
  depth?: number
) {
  const g = new THREE.Group()

  // 1. Params
  floors = Math.max(2, Math.min(10, Math.floor(floors)))
  
  const finalW = width ?? (8 + Math.floor(Math.random() * 4) * 2) 
  const finalD = depth ?? (8 + Math.floor(Math.random() * 4) * 2)
  const floorHeight = 3.2
  const totalH = floors * floorHeight
  
  // Theme Selection
  // If wallColor is provided, use it. Otherwise pick random theme.
  let activeTheme: { wall: number, roof: number, win: number }

  if (wallColor !== undefined) {
      // Use provided wall color, pick default roof/win (or from first theme)
      activeTheme = { 
          wall: wallColor, 
          roof: 0x576574, // Default Roof
          win: 0x88c0ff   // Default Win
      }
  } else {
      const themeIndex = Math.floor(Math.random() * APARTMENT_THEMES.length)
      activeTheme = APARTMENT_THEMES[themeIndex]
  }

  // 2. Materials
  let wallMat = wallCache.get(activeTheme.wall)
  if (!wallMat) {
     wallMat = new THREE.MeshStandardMaterial({ color: activeTheme.wall, roughness: 0.9 })
     wallCache.set(activeTheme.wall, wallMat)
  }
  let roofMat = roofCache.get(activeTheme.roof)
  if (!roofMat) {
     roofMat = new THREE.MeshStandardMaterial({ color: activeTheme.roof, roughness: 0.7, metalness: 0.1 })
     roofCache.set(activeTheme.roof, roofMat)
  }
  let glassMat = glassCache.get(activeTheme.win)
  if (!glassMat) {
    glassMat = new THREE.MeshStandardMaterial({ 
        color: activeTheme.win, metalness: 0.3, roughness: 0.1, transparent: true, opacity: 0.7 
    })
    glassCache.set(activeTheme.win, glassMat)
  }
  
  // 3. INTERNAL CORE (Acts as "interior backing" to block seeing through to other side)
  const coreBuilder = new SimpleBoxBuilder()
  const coreW = finalW - 1.0
  const coreD = finalD - 1.0
  coreBuilder.addBox(0, totalH/2, 0, coreW, totalH, coreD)
  const coreMesh = new THREE.Mesh(
    coreBuilder.build(), 
    new THREE.MeshBasicMaterial({ color: 0x1a252f }) // Dark slate
  )
  g.add(coreMesh)

  // 4. STRUCTURE & GLASS BUILDERS
  const wallBuilder = new SimpleBoxBuilder()
  const glassBuilder = new SimpleBoxBuilder()
  
  // Z-LAYERING STRATEGY TO PREVENT Z-FIGHTING (Flickering)
  // 1. Column Face:   0.00 (Reference)
  // 2. Beam Face:    -0.10 (Recessed)
  // 3. Window Face:  -0.20 (Deep Recessed)
  
  const colThick = 0.6 // Thicker columns
  const beamThick = 0.4 // Thinner beams (height)
  const beamDepth = 0.4 // Recessed depth
  
  // A. Vertical Columns (Corners)
  // Positioned so standard bounds are hit
  const colX = finalW/2 - colThick/2
  const colZ = finalD/2 - colThick/2
  
  // FL, FR, BL, BR
  wallBuilder.addBox(-colX, totalH/2, colZ, colThick, totalH, colThick)
  wallBuilder.addBox(colX, totalH/2, colZ, colThick, totalH, colThick)
  wallBuilder.addBox(-colX, totalH/2, -colZ, colThick, totalH, colThick)
  wallBuilder.addBox(colX, totalH/2, -colZ, colThick, totalH, colThick)

  // B. Floors
  for (let f = 0; f < floors; f++) {
      const yBase = f * floorHeight
      // Beams - Recessed by 0.1 from Column Face
      // Column Face is at finalD/2
      // Beam Face should be at finalD/2 - 0.1
      // Beam Depth is 0.4. Center = Face - 0.2 = finalD/2 - 0.3
      const beamZOffset = 0.3
      const beamZ = finalD/2 - beamZOffset
      
      const beamXOffset = 0.3
      const beamX = finalW/2 - beamXOffset

      // Horizontal Beams (Floor outline)
      // Front (Z+)
      wallBuilder.addBox(0, yBase + beamThick/2, beamZ, finalW - colThick, beamThick, beamDepth)
      // Back (Z-)
      wallBuilder.addBox(0, yBase + beamThick/2, -beamZ, finalW - colThick, beamThick, beamDepth)
      // Left (X-) - Rotated logic
      wallBuilder.addBox(-beamX, yBase + beamThick/2, 0, beamDepth, beamThick, finalD - colThick)
      // Right (X+)
      wallBuilder.addBox(beamX, yBase + beamThick/2, 0, beamDepth, beamThick, finalD - colThick)
      
      // Top Beam (Ceiling)
      const yCeil = yBase + floorHeight - beamThick/2
      wallBuilder.addBox(0, yCeil, beamZ, finalW - colThick, beamThick, beamDepth)
      wallBuilder.addBox(0, yCeil, -beamZ, finalW - colThick, beamThick, beamDepth)
      wallBuilder.addBox(-beamX, yCeil, 0, beamDepth, beamThick, finalD - colThick)
      wallBuilder.addBox(beamX, yCeil, 0, beamDepth, beamThick, finalD - colThick)

      // C. Windows (Inset further)
      // Window Face at finalD/2 - 0.2
      // Win Depth 0.1. Center = Face - 0.05 = finalD/2 - 0.25
      const winZCenter = finalD/2 - 0.25
      const winXCenter = finalW/2 - 0.25
      const winThick = 0.1
      
      if (f > 0) {
        const winH = floorHeight - (beamThick * 2)
        const winY = yBase + floorHeight/2
        
        // Front
        glassBuilder.addBox(0, winY, winZCenter, finalW - colThick*2, winH, winThick)
        // Back
        glassBuilder.addBox(0, winY, -winZCenter, finalW - colThick*2, winH, winThick)
        // Left
        glassBuilder.addBox(-winXCenter, winY, 0, winThick, winH, finalD - colThick*2)
        // Right
        glassBuilder.addBox(winXCenter, winY, 0, winThick, winH, finalD - colThick*2)
      } else {
         // Ground Floor - Entrance + Glass
         const winH = floorHeight - (beamThick * 2)
         const winY = yBase + floorHeight/2
         
         // Front (Split for door)
         const doorW = 2.0
         // Left Panel
         glassBuilder.addBox(-(doorW/2 + (finalW/2 - doorW/2)/2), winY, winZCenter, (finalW - doorW)/2 - colThick, winH, winThick)
         // Right Panel
         glassBuilder.addBox((doorW/2 + (finalW/2 - doorW/2)/2), winY, winZCenter, (finalW - doorW)/2 - colThick, winH, winThick)
         
         // Other sides full glass
         glassBuilder.addBox(0, winY, -winZCenter, finalW - colThick*2, winH, winThick)
         glassBuilder.addBox(-winXCenter, winY, 0, winThick, winH, finalD - colThick*2)
         glassBuilder.addBox(winXCenter, winY, 0, winThick, winH, finalD - colThick*2)
      }
  }

  // Roof Cap
  const roofBuilder = new SimpleBoxBuilder()
  roofBuilder.addBox(0, totalH + 0.25, 0, finalW + 0.5, 0.5, finalD + 0.5)
  const roofMesh = new THREE.Mesh(roofBuilder.build(), roofMat)
  roofMesh.castShadow = true
  roofMesh.receiveShadow = true
  g.add(roofMesh)
  
  // HELIPAD (Details)
  if (floors > 6) {
     const heliColor = 0xf1c40f // Yellow
     let heliMat = wallCache.get(heliColor)
     if (!heliMat) {
         heliMat = new THREE.MeshBasicMaterial({ color: heliColor }) // Basic to pop out
         wallCache.set(heliColor, heliMat)
     }

     const hBuilder = new SimpleBoxBuilder()
     const yHeli = totalH + 0.5 + 0.05 // On top of roof
     
     // Size of Helipad Area (fit within roof)
     const padSize = Math.min(finalW, finalD) - 2.0
     
     if (padSize > 4) {
         // 1. Border Ring
         const thick = 0.3
         const halfS = padSize / 2
         // Front/Back
         hBuilder.addBox(0, yHeli, halfS, padSize, 0.1, thick)
         hBuilder.addBox(0, yHeli, -halfS, padSize, 0.1, thick)
         // Left/Right
         hBuilder.addBox(-halfS, yHeli, 0, thick, 0.1, padSize)
         hBuilder.addBox(halfS, yHeli, 0, thick, 0.1, padSize)
         
         // 2. The "H"
         // Logic: Two vertical bars, one horizontal crossbar
         // H Height = padSize * 0.6
         // H Width = padSize * 0.6
         const hDim = padSize * 0.6
         const hThick = 0.6
         
         // Left Leg
         hBuilder.addBox(-hDim/3, yHeli, 0, hThick, 0.1, hDim)
         // Right Leg
         hBuilder.addBox(hDim/3, yHeli, 0, hThick, 0.1, hDim)
         // Crossbar
         hBuilder.addBox(0, yHeli, 0, hDim * 0.66, 0.1, hThick)
         
         const heliMesh = new THREE.Mesh(hBuilder.build(), heliMat)
         g.add(heliMesh)
     }
  }
  
  // Door Mesh
  const door = new THREE.Mesh(new THREE.BoxGeometry(2, 3, 0.2), doorMat)
  door.position.set(0, 1.5, finalD/2 + 0.05)
  g.add(door)
  
  // Build Final Meshes
  const wallMesh = new THREE.Mesh(wallBuilder.build(), wallMat)
  wallMesh.castShadow = true
  wallMesh.receiveShadow = true
  g.add(wallMesh)
  
  const glassMesh = new THREE.Mesh(glassBuilder.build(), glassMat)
  // Transparent, no shadow usually
  g.add(glassMesh)

  g.scale.setScalar(scale)
  return g
}
