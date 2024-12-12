#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const { program } = require('commander');

// Template for a GLB model with animation
const animatedTemplate = `
import React, { useEffect, useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

const <%= componentName %> = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, animationName = "<%= animationName %>" }) => {
  // Load the GLB model
  const { scene, animations } = useGLTF(process.env.PUBLIC_URL + "<%= glbPath %>");

  // Create an AnimationMixer to control animations
  const mixer = useRef(null);

  // Get and control the loaded animations
  const { actions } = useAnimations(animations, scene);

  // Play the specified animation if it exists
  useEffect(() => {
    if (actions && animationName && actions[animationName]) {
      actions[animationName].play(); // Play the specified animation
    }
  }, [actions, animationName]);

  // Update animation on each frame without needing to manually call update
  useFrame(() => {
    if (mixer.current) {
      mixer.current.update(); // No need to call .update(delta) here
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

useGLTF.preload(process.env.PUBLIC_URL + "<%= glbPath %>");

export default <%= componentName %>;
`;

// Template for a GLB model without animation
const staticTemplate = `
import React from "react";
import { useGLTF } from "@react-three/drei";

const <%= componentName %> = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }) => {
  // Load the GLB model
  const { scene } = useGLTF(process.env.PUBLIC_URL + "<%= glbPath %>");

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

useGLTF.preload(process.env.PUBLIC_URL + "<%= glbPath %>");

export default <%= componentName %>;
`;

// Template for a glowing text model
const glowingTextTemplate = `
import React, { useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const <%= componentName %> = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, color = '<%= defaultColor %>', onClickUrl = '<%= defaultUrl %>' }) => {
  const { scene } = useGLTF(process.env.PUBLIC_URL + "<%= glbPath %>");
  const rigidBodyRef = useRef();
  const modelRef = useRef();
  const emissiveMaterialRef = useRef();

  useEffect(() => {
    modelRef.current.traverse((child) => {
      if (child.isMesh) {
        // Create a glowing material
        const emissiveMaterial = new THREE.MeshStandardMaterial({
          color: 0xffffff, // Base color
          emissive: new THREE.Color(color), // Emissive color
          emissiveIntensity: 1, // Emissive intensity
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
      const impulse = [0, 1, 0]; // Upward impulse
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

export default <%= componentName %>;
`;

program
  .command('glbgx <glbPath>')
  .alias('some-3d-models')
  .description('Generate a React component for a GLB model with or without animation')
  .option('-n, --name <name>', 'Component name', 'GLBModel')
  .option('-a, --animation <animation>', 'Animation name') // Optional animation name
  .option('-t, --text', 'Generate a glowing text component')  // New option to generate glowing text component
  .option('-c, --color <color>', 'Glow color (in hexadecimal)', '0xffa500')  // Default color
  .option('-u, --url <url>', 'URL to open on click', 'https://github.com/Reene444')  // Default URL
  .action(async (glbPath, options) => {
    const { name, animation, text, color, url } = options;
    const componentName = name.charAt(0).toUpperCase() + name.slice(1);

    let rendered;

    // If --text option is used, generate glowing text component
    if (text) {
      if (!color || !url) {
        console.error('Both --color and --url are required when using the --text option.');
        process.exit(1);
      }

      rendered = ejs.render(glowingTextTemplate, {
        componentName: componentName,
        modelPath: glbPath,
        defaultColor: color,
        defaultUrl: url,
      });
    } else {
      // Generate GLB model component
      const template = animation ? animatedTemplate : staticTemplate;
      rendered = ejs.render(template, {
        componentName: componentName,
        glbPath: glbPath,
        animationName: animation || "Take 01",
      });
    }

    const componentDir = path.join(process.cwd(), 'src/components');
    if (!fs.existsSync(componentDir)) {
      fs.mkdirSync(componentDir, { recursive: true });
    }

    const componentPath = path.join(componentDir, `${componentName}.js`);
    fs.writeFileSync(componentPath, rendered);

    console.log(`Component ${componentName} created at ${componentPath}`);
  });

program.parse(process.argv);
