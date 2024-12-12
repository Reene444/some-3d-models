### [some-3d-models](https://www.npmjs.com/package/some-3d-models) ![npm](https://img.shields.io/npm/v/some-3d-models)

`some-3d-models` is a CLI tool for generating React components to load and display `.glb` models with or without animations.
Installation

```bash
npm install -g some-3d-models
```

### Usage

#### Generate a React component for a GLB model

```bash
npx some-3d-models glbgx <glbPath> [options]
```

- `<glbPath>`: The relative path to the `.glb` model file.
- `--name <name>` or `-n <name>`: The name of the generated React component (default: `GLBModel`).
  Example:
- `--animation <animation>` or `-a <animation>`: The name of the animation to be played. If this option is not provided, the generated component will not include any animations. If an animation name is provided, the component will play the specified animation when loaded.
-

* `--text` or `-t`: Generate a glowing text component.
* `--color <color>` or `-c <color>`: The color of the glowing text in hexadecimal format (default: `#ff9900`).
* `--url <url>` or `-u <url>`: The URL to open when the glowing text is clicked (default: `https://github.com/Reene444`).

```bash
npx some-3d-models glbgx models/hero.glb -n HeroModel
npx some-3d-models glbgx models/hero.glb -n HeroModel -a "Walk"
npx some-3d-models glbgx models/hero.glb -n HeroModel -t -c "#ff9900" -u "https://example.com"
```

#### Generated Component Example

#### Without animation:

```javascript
import React from "react";
import { useGLTF } from "@react-three/drei";

const HeroModel = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }) => {
  const { scene } = useGLTF(process.env.PUBLIC_URL + "/models/hero.glb");

  return (
    <primitive
      object={scene}
      position={position}
      rotation={rotation}
      scale={scale}
      castShadow
      receiveShadow
    />
  );
};

useGLTF.preload(process.env.PUBLIC_URL + "/models/hero.glb");

export default HeroModel;

```

With animation:

```javascript
import React, { useEffect, useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

const HeroModel = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, animationName = "Walk" }) => {
  const { scene, animations } = useGLTF(process.env.PUBLIC_URL + "/models/hero.glb");

  const mixer = useRef(null);
  const { actions } = useAnimations(animations, scene);

  useEffect(() => {
    if (actions && animationName && actions[animationName]) {
      actions[animationName].play(); // Play the specified animation
    }
  }, [actions, animationName]);

  useFrame(() => {
    if (mixer.current) {
      mixer.current.update(); // Update animation on every frame
    }
  });

  return (
    <primitive
      object={scene}
      position={position}
      rotation={rotation}
      scale={scale}
      castShadow
      receiveShadow
    />
  );
};

useGLTF.preload(process.env.PUBLIC_URL + "/models/hero.glb");

export default HeroModel;



```

Glowing Text Model:

```
import React, { useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const GlowingTextModel = ({ modelPath, position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, color = '#ff9900', onClickUrl = 'https://github.com/Reene444' }) => {
  const { scene } = useGLTF(modelPath);
  const rigidBodyRef = useRef();
  const modelRef = useRef();
  const emissiveMaterialRef = useRef();

  useEffect(() => {
    modelRef.current.traverse((child) => {
      if (child.isMesh) {
        // Create a glowing material
        const emissiveMaterial = new THREE.MeshStandardMaterial({
          color: 0xffffff, // Base color
          emissive: new THREE.Color(color), // Glow color
          emissiveIntensity: 1, // Glow intensity
          transparent: true,
          opacity: 1,
        });

        child.material = emissiveMaterial;
        emissiveMaterialRef.current = emissiveMaterial;
      }
    });
  }, [color]);

  // Pulsing effect
  useFrame((state) => {
    if (emissiveMaterialRef.current) {
      const time = state.clock.getElapsedTime();
      emissiveMaterialRef.current.emissiveIntensity = 1.5 + Math.sin(time * 2) * 0.5;
    }
  });

  const handleClick = () => {
    if (onClickUrl) {
      window.open(onClickUrl, '_blank');
    }
  };

  const handleCollisionEnter = (e) => {
    if (rigidBodyRef.current) {
      const impulse = [0, 1, 0]; // Apply upward impulse
      rigidBodyRef.current.applyImpulse(impulse, true);
    }
  };

  return (
    <RigidBody type="fixed" colliders="trimesh" ref={rigidBodyRef} onCollisionEnter={handleCollisionEnter}>
      <primitive
        ref={modelRef}
        object={scene}
        position={position}
        rotation={rotation}
        scale={Array.isArray(scale) ? scale : [scale, scale, scale]}
        onClick={handleClick}
        castShadow
        receiveShadow
      />
    </RigidBody>
  );
};

useGLTF.preload(modelPath);

export default GlowingTextModel;

```

### Reference: 3D Models Used

- **Model Loading**: "Loading animate" by [yelaman.arts](https://sketchfab.com/3d-models/loading-animate-5d02b9b25e7f4e5bb11075a7d373048e) on [Sketchfab](https://sketchfab.com), used under [CC BY 4.0 License](https://creativecommons.org/licenses/by/4.0/).
- **Model Scene**: "Ecctrl + Fisheye" by [ecctrl](https://github.com/pmndrs/ecctrl) on [React Three Fiber](https://github.com/pmndrs/ecctrl), used under [MIT License](https://github.com/pmndrs/ecctrl/blob/main/LICENSE).
