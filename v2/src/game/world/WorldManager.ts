import * as THREE from 'three'
import { Chunk, ChunkParams } from './Chunk'

export class WorldManager {
    private scene: THREE.Scene
    private chunks: Map<string, Chunk> = new Map()
    private params: ChunkParams
    private renderDistance: number = 2
    
    constructor(scene: THREE.Scene, params: ChunkParams, renderDistance: number) {
        this.scene = scene
        this.params = params
        this.renderDistance = renderDistance
    }

    public updateParams(newParams: Partial<ChunkParams>, newRenderDist?: number) {
        let needsRegen = false
        if (newRenderDist !== undefined && newRenderDist !== this.renderDistance) {
            this.renderDistance = newRenderDist
            // Don't necessarily need full regen for distance change, but simplistic for now
        }
        
        if (newParams.seed !== undefined && newParams.seed !== this.params.seed) {
            this.params.seed = newParams.seed
            needsRegen = true
        }
        if (newParams.size !== undefined && newParams.size !== this.params.size) {
            this.params.size = newParams.size
            needsRegen = true
        }
        if (newParams.density !== undefined && newParams.density !== this.params.density) {
            this.params.density = newParams.density
            needsRegen = true
        }

        if (needsRegen) {
            this.clear()
        }
    }

    public update(targetPos: THREE.Vector3): number {
        // Calculate current chunk coordinates
        const cx = Math.floor(targetPos.x / this.params.size + 0.5)
        const cz = Math.floor(targetPos.z / this.params.size + 0.5)

        // Identify needed chunks
        const neededKeys = new Set<string>()
        
        for (let x = -this.renderDistance; x <= this.renderDistance; x++) {
            for (let z = -this.renderDistance; z <= this.renderDistance; z++) {
                neededKeys.add(`${cx + x},${cz + z}`)
            }
        }

        // Remove old chunks
        for (const [key, chunk] of this.chunks) {
            if (!neededKeys.has(key)) {
                chunk.dispose()
                this.chunks.delete(key)
            }
        }

        // Create new chunks
        for (const key of neededKeys) {
            if (!this.chunks.has(key)) {
                const [sx, sz] = key.split(',').map(Number)
                const chunk = new Chunk(sx, sz, this.params)
                this.scene.add(chunk.mesh)
                this.chunks.set(key, chunk)
            }
        }

        return this.chunks.size
    }

    public clear() {
        this.chunks.forEach(chunk => chunk.dispose())
        this.chunks.clear()
    }
}
