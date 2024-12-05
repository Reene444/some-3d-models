### [some-3d-models](https://www.npmjs.com/package/some-3d-models)

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

```bash
npx some-3d-models glbgx models/hero.glb -n HeroModel
npx some-3d-models glbgx models/hero.glb -n HeroModel -a "Walk"

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

### Reference: 3D Models Used

- **Model Loading**: "Loading animate" by [yelaman.arts](https://sketchfab.com/3d-models/loading-animate-5d02b9b25e7f4e5bb11075a7d373048e) on [Sketchfab](https://sketchfab.com), used under [CC BY 4.0 License](https://creativecommons.org/licenses/by/4.0/).
- **Model Scene**: "Ecctrl + Fisheye" by [ecctrl](https://github.com/pmndrs/ecctrl) on [React Three Fiber](https://r3f.docs.pmnd.rs/getting-started/examples)](https://github.com/pmndrs/ecctrl), used under [MIT License](https://github.com/pmndrs/ecctrl/blob/main/LICENSE).
