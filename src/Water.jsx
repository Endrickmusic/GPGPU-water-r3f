import { OrbitControls } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import { useRef, useMemo, useEffect } from "react"
import { DoubleSide, Vector2 } from "three"
import { SimplexNoise } from 'three/addons/math/SimplexNoise.js'
import { GPUComputationRenderer } from 'three/addons/misc/GPUComputationRenderer.js'

import heightmapFragmentShader from "./shader/heightmapFragmentShader.js"


import './RenderMaterial.jsx'

// Texture width for simulation
const WIDTH = 128

// Water size in system units
const BOUNDS = 512

const simplex = new SimplexNoise();

export default function initWater(){

    const meshRef = useRef()
    const renderMat = useRef()

    useEffect((gl) => {
    
      // Defines
      renderMat.current.defines.WIDTH = WIDTH.toFixed( 1 )
      renderMat.current.defines.BOUNDS = BOUNDS.toFixed( 1 )
      
      // Creates the gpu computation class and sets it up

			const gpuCompute = new GPUComputationRenderer( WIDTH, WIDTH, gl );

      const heightmap0 = gpuCompute.createTexture()

      fillTexture( heightmap0 )

      const heightmapVariable = gpuCompute.addVariable( 'heightmap', heightmapFragmentShader, heightmap0 )

      gpuCompute.setVariableDependencies( heightmapVariable, [ heightmapVariable ] )

    },[])
  

    useFrame((state) => {
      let time = state.clock.getElapsedTime()
  
      // start from 20 to skip first 20 seconds ( optional )
      renderMat.current.uniforms.uTime.value = time
    
    })
  
      // Define the shader uniforms with memoization to optimize performance
      const uniforms = useMemo(
        () => ({
          uTime: {
            type: "f",
            value: 1.0,
              },
          uResolution: {
            type: "v2",
            value: new Vector2(4, 3),
            }
         }),[]
      )   
      const viewport = useThree(state => state.viewport)
  return (
    <>
      <OrbitControls />    
      <mesh 
      ref={meshRef}
      scale={[1, 1, 1]}
      >
          <planeGeometry args={[1, 1, 64, 64]} />
          <renderMaterial
            ref = {renderMat}
            side = {DoubleSide}
            wireframe = {true}
          />
        </mesh>
   </>
  )}


  
  function fillTexture( texture ) {

    const waterMaxHeight = 10

    function noise( x, y ) {

      let multR = waterMaxHeight
      let mult = 0.025
      let r = 0
      for ( let i = 0; i < 15; i ++ ) {

        r += multR * simplex.noise( x * mult, y * mult )
        multR *= 0.53 + 0.025 * i
        mult *= 1.25

      }

      return r

    }
  }