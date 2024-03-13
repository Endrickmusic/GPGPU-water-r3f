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
    const gpuCompute = useRef()
    const heightmapVariable = useRef()

    const { gl, size } = useThree()


    const handleMouseMove = (event) =>{
      
      heightmapVariable.current.material.uniforms.mousePos.value.set(10000, 10000);

    }

    useEffect(() => {

      // Creates the gpu computation class and sets it up
      gpuCompute.current = new GPUComputationRenderer( WIDTH, WIDTH, gl )

      // Defines
      renderMat.current.defines.WIDTH = WIDTH.toFixed( 1 )
      renderMat.current.defines.BOUNDS = BOUNDS.toFixed( 1 )

      const heightmap0 = gpuCompute.current.createTexture()

      fillTexture( heightmap0 )

      heightmapVariable.current = gpuCompute.current.addVariable( 'heightmap', heightmapFragmentShader, heightmap0 )

      gpuCompute.current.setVariableDependencies( heightmapVariable.current, [ heightmapVariable.current ] )

      heightmapVariable.current.material.uniforms[ 'mousePos' ] = { value: new Vector2( 10000, 10000 ) };
			heightmapVariable.current.material.uniforms[ 'mouseSize' ] = { value: 20.0 };
			heightmapVariable.current.material.uniforms[ 'viscosityConstant' ] = { value: 0.999 };
			heightmapVariable.current.material.uniforms[ 'heightCompensation' ] = { value: 0 };
			heightmapVariable.current.material.defines.BOUNDS = BOUNDS.toFixed( 1 );

      gpuCompute.current.init()
    },[])
  

    useFrame((state) => {
      
      const time = state.clock.getElapsedTime()
      renderMat.current.uniforms.uTime.value = time
      
      const uniforms = heightmapVariable.current.material.uniforms

      // console.log( uniforms )

      // uniforms[ 'mousePos' ].value.set( 10000, 10000 )

      gpuCompute.current.compute()

      renderMat.current.uniforms.heightmap.value = gpuCompute.current.getCurrentRenderTarget( heightmapVariable.current ).texture
      uniforms.heightmap.value = gpuCompute.current.getCurrentRenderTarget( heightmapVariable.current ).texture
      // console.log(uniforms.heightmap.value)

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
      onPointerMove={handleMouseMove}
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

    const waterMaxHeight = 0.05

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

    const pixels = texture.image.data;

    let p = 0;
    for ( let j = 0; j < WIDTH; j ++ ) {

      for ( let i = 0; i < WIDTH; i ++ ) {

        const x = i * 128 / WIDTH;
        const y = j * 128 / WIDTH;

        pixels[ p + 0 ] = noise( x, y );
        pixels[ p + 1 ] = pixels[ p + 0 ];
        pixels[ p + 2 ] = 0;
        pixels[ p + 3 ] = 1;

        p += 4;

      }

    }
  }