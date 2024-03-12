import { OrbitControls } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import { useRef, useMemo, useEffect } from "react"

import vertexShader from "./shader/vertexShader.js"
import fragmentShader from "./shader/fragmentShader.js"
import { DoubleSide, Vector2 } from "three"

import './RenderMaterial.jsx'

// Texture width for simulation
const WIDTH = 128

// Water size in system units
const BOUNDS = 512

export default function Water(){

    const meshRef = useRef()
    const renderMat = useRef()

    useEffect(() => {
    
      // Defines
      renderMat.current.defines.WIDTH = WIDTH.toFixed( 1 )
      renderMat.current.defines.BOUNDS = BOUNDS.toFixed( 1 )
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
