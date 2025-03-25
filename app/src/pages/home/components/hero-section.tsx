import { Canvas } from "@react-three/fiber";
import {
  Environment,
  Float,
  OrbitControls,
  PresentationControls,
  Stage,
  useGLTF,
} from "@react-three/drei";
import { Suspense } from "react";
import { ChevronDown } from "lucide-react";

function Model() {
  const { scene } = useGLTF("/plant.gltf");
  return <primitive object={scene} scale={2} position={[0, -1, 0]} />;
}

export function Plant() {
  // useRef()

  return (
    <Canvas shadows dpr={[1, 2]} camera={{ fov: 50 }}>
      <Suspense fallback={null}>
        <Stage preset="rembrandt" intensity={1} environment="city">
          <Model />
        </Stage>
      </Suspense>
      <OrbitControls autoRotate enableZoom={false} />
    </Canvas>
  );
}

function HeroContent() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10 pointer-events-none">
      <h1 className="text-5xl md:text-7xl font-bold text-white drop-shadow-md mb-4">
        Agri AI
      </h1>
      <p className="text-xl md:text-2xl text-white drop-shadow-md max-w-2xl">
        Smart agriculture toolkit for plant detection, crop and fertilizer
        recommendations
      </p>
      <div className="mt-12 animate-bounce pointer-events-auto">
        <ChevronDown className="h-8 w-8 text-white" />
      </div>
    </div>
  );
}

export default function HeroSection() {
  return (
    <section className="w-full h-screen relative">
      {/* <Plant /> */}
      <Canvas className="bg-gradient-to-b from-green-800 to-green-600">
        <Suspense fallback={null}>
          <PresentationControls
            global
            rotation={[0.13, 0.1, 0]}
            polar={[-0.4, 0.2]}
            azimuth={[-1, 0.75]}
            // config={{ mass: 2, tension: 400 }}
            // snap={{ mass: 4, tension: 400 }}
          >
            <Float rotationIntensity={0.4}>
              <Model />
            </Float>
          </PresentationControls>
          <Environment preset="forest" />
          <OrbitControls autoRotate enableZoom={false} />
        </Suspense>
      </Canvas>
      <HeroContent />
    </section>
  );
}
