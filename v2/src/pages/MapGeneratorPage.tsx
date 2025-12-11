import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { WorldManager } from '@/game/world/WorldManager'
import { createMalePlayer } from '@/game/player/MalePlayerObject'
import { CharacterAnimator } from '@/game/animations/CharacterAnimator'

export function MapGeneratorPage() {
  const navigate = useNavigate()
  const canvasRef = useRef<HTMLDivElement>(null)
  
  // Three.js State
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const worldManagerRef = useRef<WorldManager | null>(null)
  const playerRef = useRef<any>(null)
  
  // Generation Params
  const [seed, setSeed] = useState(12345)
  const [chunkSize, setChunkSize] = useState(60)
  const [renderDist, setRenderDist] = useState(2)
  const [density, setDensity] = useState(0.5)
  const [playMode, setPlayMode] = useState(false)
  const [debugInfo, setDebugInfo] = useState({ chunks: 0, fps: 0 })

  // Input State
  const keysPressed = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!canvasRef.current) return

    // Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x202020)
    scene.fog = new THREE.Fog(0x202020, 50, 300)
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.set(0, 50, 50)
    cameraRef.current = camera

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.shadowMap.enabled = true
    canvasRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambient)
    const dirLight = new THREE.DirectionalLight(0xffffff, 1)
    dirLight.position.set(50, 100, 50)
    dirLight.castShadow = true
    // High shadow map for large area
    dirLight.shadow.mapSize.width = 2048
    dirLight.shadow.mapSize.height = 2048
    dirLight.shadow.camera.left = -100
    dirLight.shadow.camera.right = 100
    dirLight.shadow.camera.top = 100
    dirLight.shadow.camera.bottom = -100
    scene.add(dirLight)

    // Initial World Manager
    const wm = new WorldManager(scene, { size: 60, density: 0.5, seed: 12345 }, 2)
    worldManagerRef.current = wm
    wm.update(new THREE.Vector3(0,0,0)) // Init chunks at 0,0

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controlsRef.current = controls

    // Player Setup (Hidden by default)
    const playerData = createMalePlayer({
        shirtColor: 0x3498db,
        mouthStyle: 'serious',
        showHat: true,
        showGlasses: false,
        weapon: 'none'
    })
    playerData.mesh.visible = false
    scene.add(playerData.mesh)
    playerRef.current = playerData

    // Input Listeners
    const handleKeyDown = (e: KeyboardEvent) => keysPressed.current.add(e.key.toLowerCase())
    const handleKeyUp = (e: KeyboardEvent) => keysPressed.current.delete(e.key.toLowerCase())
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    // Loop
    let frameId = 0
    let lastTime = performance.now()
    let frames = 0
    let animTime = 0
    
    // Player Physics State
    const playerPos = new THREE.Vector3(0, 0, 0)
    let playerYVelocity = 0
    
    // Smooth Camera State
    const cameraTarget = new THREE.Vector3(0, 50, 50)
    
    const animate = () => {
      frameId = requestAnimationFrame(animate)
      const now = performance.now()
      const delta = Math.min((now - lastTime) / 1000, 0.1) // Cap delta
      
      // FPS Counter
      frames++
      // Fixed FPS update every ~1s (using math)
      if (Math.floor(now / 1000) > Math.floor(lastTime / 1000)) {
           setDebugInfo(prev => ({ ...prev, fps: frames }))
           frames = 0
      }
       
      lastTime = now

      // Logic Update
      if (playerRef.current && playerRef.current.mesh.visible) {
          // PLAY MODE LOGIC
          // Doubled speed: 20 for sprint, 10 for walk
          const speed = keysPressed.current.has('shift') ? 20 : 10
          const dir = new THREE.Vector3()
          if (keysPressed.current.has('w')) dir.z -= 1
          if (keysPressed.current.has('s')) dir.z += 1
          if (keysPressed.current.has('a')) dir.x -= 1
          if (keysPressed.current.has('d')) dir.x += 1
          
          if (dir.length() > 0) {
              dir.normalize()
              
              playerPos.x += dir.x * speed * delta
              playerPos.z += dir.z * speed * delta
              
              // Rotate player
              playerRef.current.mesh.rotation.y = Math.atan2(dir.x, dir.z)
              
              // Anim Speed roughly synced to movement
              // Walk (10) -> ~12.0
              // Run (20) -> ~18.0 (run anim has internal 1.5x, so base adjusted)
              const animSpeedMultiplier = keysPressed.current.has('shift') ? 12.0 : 12.0
              animTime += delta * animSpeedMultiplier

              const anim = keysPressed.current.has('shift') ? 'run' : 'walk'
              CharacterAnimator.animate(playerRef.current, anim, animTime, { baseY: 0, animTime })
              
          } else {
              CharacterAnimator.animate(playerRef.current, 'idle', now * 0.001, { baseY: 0, animTime: now * 0.001 })
          }

          // Simple Gravity / Ground
          if (playerPos.y > 0) {
              playerYVelocity -= 30 * delta // STRONGER GRAVITY
              playerPos.y += playerYVelocity * delta
          }
          if (playerPos.y < 0) {
              playerPos.y = 0
              playerYVelocity = 0
          }
          
          // Jump
          if (keysPressed.current.has(' ') && playerPos.y <= 0.1) {
               playerYVelocity = 12 // HIGHER JUMP
               playerPos.y = 0.1
          }

          playerRef.current.mesh.position.copy(playerPos)
          
          // Camera Follow - Smoother
          const offset = new THREE.Vector3(0, 8, 12) // Slightly higher/further
          const idealPos = playerPos.clone().add(offset)
          
          // Smooth Damping
          camera.position.lerp(idealPos, 5.0 * delta) 
          camera.lookAt(playerPos.clone().add(new THREE.Vector3(0, 1, 0))) // Look at head
          
          // Update World Manager - Throttled (Every 10 frames or distance check)
          // Simple distance check:
          if (worldManagerRef.current && frames % 10 === 0) {
             const activeChunks = worldManagerRef.current.update(playerPos)
             if (activeChunks !== debugInfo.chunks) {
                // defer update to avoid render flicker?
             }
          }
           
      } else {
          // ORBIT MODE
          controls.update()
          // Update World Manager based on Orbit Target
          if (worldManagerRef.current && frames % 20 === 0) {
             const target = controls.target
             worldManagerRef.current.update(target)
          }
      }

      renderer.render(scene, camera)
    }
    animate()

    // Cleanup
    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      renderer.dispose()
      canvasRef.current?.removeChild(renderer.domElement)
    }
  }, [])

  // Sync State to WorldManager
  useEffect(() => {
      if (worldManagerRef.current) {
          worldManagerRef.current.updateParams({ seed, size: chunkSize, density }, renderDist)
          // Force update visual count?
          setDebugInfo(prev => ({ ...prev, chunks: 0 })) // Will update next frame
      }
  }, [seed, chunkSize, renderDist, density])
  
  // Handle Play Mode Switch
  useEffect(() => {
     if (!playerRef.current || !controlsRef.current || !cameraRef.current) return
     
     if (playMode) {
         // Enable Player
         playerRef.current.mesh.visible = true
         controlsRef.current.enabled = false
         
         // Teleport player to current look target
         const target = controlsRef.current.target
         playerRef.current.mesh.position.set(target.x, 0, target.z)
         
     } else {
         // Disable Player
         playerRef.current.mesh.visible = false
         controlsRef.current.enabled = true
         
         // Reset camera to nice orbit
         cameraRef.current.position.set(0, 50, 50)
         controlsRef.current.target.set(0,0,0)
     }
  }, [playMode])

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return
      cameraRef.current.aspect = window.innerWidth / window.innerHeight
      cameraRef.current.updateProjectionMatrix()
      rendererRef.current.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Canvas */}
      <div ref={canvasRef} className="w-full h-full" />

      {/* UI Sidebar */}
      <div className="absolute top-0 right-0 h-full w-80 bg-black/80 backdrop-blur-md border-l border-white/10 p-6 overflow-y-auto text-white">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            🗺️ Map Generator
          </h2>
          
          <div className="space-y-6">
             <div className="space-y-2">
                <Label>World Seed</Label>
                <div className="flex gap-2">
                    <input 
                       type="number" 
                       value={seed} 
                       onChange={(e) => setSeed(parseInt(e.target.value))}
                       className="bg-slate-900 border border-slate-700 rounded px-2 py-1 w-full text-sm"
                    />
                    <Button size="sm" variant="outline" onClick={() => setSeed(Math.floor(Math.random() * 999999))}>
                       🎲
                    </Button>
                </div>
             </div>

             <div className="space-y-2">
                <div className="flex justify-between text-sm">
                   <Label>Chunk Size</Label>
                   <span className="text-slate-400">{chunkSize}m</span>
                </div>
                <Slider 
                   value={[chunkSize]} 
                   min={20} max={200} step={10}
                   onValueChange={([v]) => setChunkSize(v)}
                />
             </div>
             
             <div className="space-y-2">
                <div className="flex justify-between text-sm">
                   <Label>Render Distance</Label>
                   <span className="text-slate-400">{renderDist} chunks</span>
                </div>
                <Slider 
                   value={[renderDist]} 
                   min={1} max={8} step={1}
                   onValueChange={([v]) => setRenderDist(v)}
                />
             </div>
             
             <div className="space-y-2">
                <div className="flex justify-between text-sm">
                   <Label>Building Density</Label>
                   <span className="text-slate-400">{(density * 100).toFixed(0)}%</span>
                </div>
                <Slider 
                   value={[density]} 
                   min={0} max={1} step={0.1}
                   onValueChange={([v]) => setDensity(v)}
                />
             </div>

             <div className="pt-4 border-t border-white/10">
                <div className="flex items-center justify-between mb-2">
                   <Label>Play Mode</Label>
                   <Switch checked={playMode} onCheckedChange={setPlayMode} />
                </div>
                <p className="text-xs text-slate-500">
                    {playMode ? "WASD to move, Shift sprint, Space jump" : "Orbit camera control"}
                </p>
             </div>

             <div className="pt-4 mt-auto">
                 <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => console.log('Regenerate')}>
                    ♻️ Regenerate World
                 </Button>
             </div>

             <div className="bg-slate-900/50 p-2 rounded text-xs font-mono space-y-1 mt-6">
                <div className="flex justify-between">
                    <span>FPS:</span>
                    <span className={debugInfo.fps < 30 ? "text-red-400" : "text-green-400"}>{debugInfo.fps}</span>
                </div>
                <div className="flex justify-between">
                    <span>Active Chunks:</span>
                    <span>{debugInfo.chunks}</span>
                </div>
             </div>

          </div>
      </div>

      {/* Exit Button */}
      <div className="absolute top-4 left-4">
        <Button variant="destructive" onClick={() => navigate('/')}>
          Exit
        </Button>
      </div>
    </div>
  )
}
