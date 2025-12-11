import * as THREE from 'three'

/**
 * Creates a small commercial/shop building
 * More detailed than previous version
 */
// Material caches
const wallCache = new Map<number, THREE.Material>()
const roofCache = new Map<number, THREE.Material>()

// Static Materials
const glassMat = new THREE.MeshStandardMaterial({ color: 0x88c0ff, roughness: 0.2, metalness: 0.1 })
const frameMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50 })

// Palette (10 variations)
const PALETTE_HUES = [0.0, 0.1, 0.15, 0.25, 0.5, 0.6, 0.65, 0.75, 0.85, 0.95]

/**
 * Creates a small commercial/shop building
 * More detailed than previous version
 */
export function createSmallBuilding() {
  const g = new THREE.Group()
  // Randomize colors from palette
  const hueIndex = Math.floor(Math.random() * PALETTE_HUES.length)
  const hue = PALETTE_HUES[hueIndex]
  
  let wallMat = wallCache.get(hueIndex)
  if (!wallMat) {
     const c = new THREE.Color().setHSL(hue, 0.4, 0.6)
     wallMat = new THREE.MeshStandardMaterial({ color: c })
     wallCache.set(hueIndex, wallMat)
  }

  let roofMat = roofCache.get(hueIndex)
  if (!roofMat) {
     const c = new THREE.Color().setHSL(hue, 0.2, 0.3)
     roofMat = new THREE.MeshStandardMaterial({ color: c, roughness: 0.9 })
     roofCache.set(hueIndex, roofMat)
  }
  
  const width = 6 + Math.random() * 2
  const depth = 6 + Math.random() * 2
  const height = 4 + Math.random() * 1
  
  // Materials used from cache/global


  // Main Block
  const body = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), wallMat)
  body.position.y = height / 2
  body.castShadow = true
  body.receiveShadow = true
  g.add(body)

  // Shop Front (Glass Window)
  const windowWidth = width * 0.6
  const windowHeight = height * 0.5
  const windowFrame = new THREE.Mesh(new THREE.BoxGeometry(windowWidth + 0.4, windowHeight + 0.4, 0.2), frameMat)
  windowFrame.position.set(0, height * 0.4, depth / 2)
  g.add(windowFrame)

  const glass = new THREE.Mesh(new THREE.BoxGeometry(windowWidth, windowHeight, 0.25), glassMat)
  glass.position.set(0, height * 0.4, depth / 2)
  g.add(glass)

  // Door
  const doorW = 1.5
  const doorH = 2.5
  const door = new THREE.Mesh(new THREE.BoxGeometry(doorW, doorH, 0.2), frameMat)
  // Place door to the side of window
  const doorX = (width / 2) - 1.2
  door.position.set(doorX, doorH / 2, depth / 2 + 0.05)
  g.add(door)

  // Roof (Slanted or Flat with overhang)
  if (Math.random() > 0.5) {
      // Flat overhang
      const roof = new THREE.Mesh(new THREE.BoxGeometry(width + 0.6, 0.4, depth + 1.2), roofMat)
      roof.position.y = height + 0.2
      g.add(roof)
      
      // Sign board on top
      const sign = new THREE.Mesh(new THREE.BoxGeometry(width * 0.8, 1, 0.2), new THREE.MeshStandardMaterial({ color: 0xffffff }))
      sign.position.set(0, height + 1, depth / 2)
      g.add(sign)
  } else {
      // Slanted
      const roof = new THREE.Mesh(new THREE.ConeGeometry(width * 0.8, 2, 4), roofMat)
      roof.position.y = height + 1
      roof.rotation.y = Math.PI / 4
      roof.scale.z = depth / width
      g.add(roof)
  }

  // Sidewalk segment
  const sidewalk = new THREE.Mesh(new THREE.BoxGeometry(width + 2, 0.2, depth + 2), new THREE.MeshStandardMaterial({ color: 0xbdc3c7 }))
  sidewalk.position.y = 0.1
  sidewalk.receiveShadow = true
  g.add(sidewalk)

  return g
}
