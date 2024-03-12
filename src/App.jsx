import { Canvas } from '@react-three/fiber'

import './index.css'
import Water from './Water.jsx'

function App() {
  
  return (
  <>

    <Canvas
    camera={{ 
      position: [0, 0, 2],
      fov: 40 }}  
    >
      <color attach="background" args={[0x999999]} />
      <Water />
    </Canvas>
  </>
  )
}

export default App
