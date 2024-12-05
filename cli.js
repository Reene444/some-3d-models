#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const { program } = require('commander');

// with animation
const animatedTemplate = `
import React, { useEffect, useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

const <%= componentName %> = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, animationName = "<%= animationName %>" }) => {
  // 加载 GLB 文件
  const { scene, animations } = useGLTF(process.env.PUBLIC_URL + "<%= glbPath %>");

  // 创建 AnimationMixer 用于控制动画
  const mixer = useRef(null);

  // 获取并控制加载的动画
  const { actions } = useAnimations(animations, scene);

  // 如果模型有动画并且动画名称存在，播放指定的动画
  useEffect(() => {
    if (actions && animationName && actions[animationName]) {
      actions[animationName].play(); // 播放指定动画
    }
  }, [actions, animationName]);

  // 在每帧更新动画，不需要手动调用 update
  useFrame(() => {
    if (mixer.current) {
      mixer.current.update(); // 这里不再需要调用 .update(delta)
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

// 没有动画的模板
const staticTemplate = `
import React from "react";
import { useGLTF } from "@react-three/drei";

const <%= componentName %> = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }) => {
  // 加载 GLB 文件
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

program
  .command('glbgx <glbPath>')
  .description('Generate a React component for a GLB model with or without animation')
  .option('-n, --name <name>', 'Component name', 'GLBModel')
  .option('-a, --animation <animation>', 'Animation name') // 动画名称作为可选项
  .action(async (glbPath, options) => {
    const { name, animation } = options;
    const componentName = name.charAt(0).toUpperCase() + name.slice(1);

    // 根据是否提供了 --animation 来决定模板
    const template = animation ? animatedTemplate : staticTemplate;

    // 渲染模板
    const rendered = ejs.render(template, {
      componentName: componentName,
      glbPath: glbPath,
      animationName: animation || "Take 01" // 默认动画名称为 "Take 01"（如果没有指定）
    });

    // 确保组件目录存在
    const componentDir = path.join(process.cwd(), 'src/components');
    if (!fs.existsSync(componentDir)) {
      fs.mkdirSync(componentDir, { recursive: true });
    }

    // 写入文件
    const componentPath = path.join(componentDir, `${componentName}.js`);
    fs.writeFileSync(componentPath, rendered);

    console.log(`Component ${componentName} created at ${componentPath}`);
  });

program.parse(process.argv);
