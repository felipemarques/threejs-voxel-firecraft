import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { GameCanvas } from './components/GameCanvas'
import { Button } from './components/ui/button'

// Fake API call to demonstrate TanStack Query
async function fetchGameStats() {
  await new Promise(resolve => setTimeout(resolve, 500))
  return {
    players: Math.floor(Math.random() * 100),
    fps: Math.floor(Math.random() * 60) + 30,
  }
}

function App() {
  const [cubeColor, setCubeColor] = useState('#ff6600')
  
  const { data: stats, refetch } = useQuery({
    queryKey: ['gameStats'],
    queryFn: fetchGameStats,
    refetchInterval: 5000,
  })

  const colors = ['#ff6600', '#00ff00', '#0066ff', '#ff00ff', '#ffff00']
  
  return (
    <div className="relative w-full h-full bg-black">
      {/* Three.js Canvas (fullscreen) */}
      <GameCanvas color={cubeColor} />
      
      {/* UI Overlay */}
      <div className="absolute top-4 left-4 flex flex-col gap-3 pointer-events-auto">
        <div className="bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg p-4 text-white">
          <h1 className="text-xl font-bold mb-2">🎮 Voxel Firecraft v2</h1>
          <p className="text-sm text-gray-300">React + TypeScript + Three.js + TanStack</p>
        </div>
        
        {/* Stats from TanStack Query */}
        {stats && (
          <div className="bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg p-4 text-white">
            <div className="text-sm">
              <div>Players Online: <span className="font-bold">{stats.players}</span></div>
              <div>FPS: <span className="font-bold">{stats.fps}</span></div>
            </div>
            <Button 
              onClick={() => refetch()} 
              size="sm" 
              className="mt-2 w-full"
            >
              Refresh Stats
            </Button>
          </div>
        )}
        
        {/* Color Controls (shadcn/ui Buttons) */}
        <div className="bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg p-4">
          <p className="text-white text-sm mb-2">Cube Color:</p>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <Button
                key={color}
                onClick={() => setCubeColor(color)}
                className="w- 10 h-10"
                style={{ backgroundColor: color }}
                variant={cubeColor === color ? "default" : "outline"}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Bottom info */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
        <p className="text-white/50 text-xs">
          Drag to rotate • Scroll to zoom • Click colors to change cube
        </p>
      </div>
    </div>
  )
}

export default App
