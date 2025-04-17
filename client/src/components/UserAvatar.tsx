import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Mood, AvatarCustomization } from '@/models/types';

interface UserAvatarProps {
  customization: AvatarCustomization;
  mood?: Mood;
  size?: 'sm' | 'md' | 'lg';
}

export default function UserAvatar({ 
  customization,
  mood = 'neutral', 
  size = 'md',
}: UserAvatarProps) {
  const avatarRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const avatarRef3D = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!avatarRef.current) return;

    // Initialize Three.js scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Set up camera
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 3;
    cameraRef.current = camera;

    // Set up renderer
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true,
      antialias: true
    });
    renderer.setSize(120, 120); // Default size, will be adjusted based on size prop
    avatarRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create avatar group
    const avatarGroup = new THREE.Group();
    scene.add(avatarGroup);
    avatarRef3D.current = avatarGroup;

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    // Create the avatar based on customization
    createAvatar(avatarGroup, customization);

    // Animation loop
    let frameId: number;
    
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      
      if (avatarRef3D.current) {
        // Add subtle floating animation
        avatarRef3D.current.position.y = Math.sin(Date.now() * 0.001) * 0.1;
        
        // Slight rotation
        avatarRef3D.current.rotation.y = Math.sin(Date.now() * 0.0005) * 0.1;
      }
      
      renderer.render(scene, camera);
    };
    
    animate();

    // Adjust size based on props
    updateSize();

    // Clean up
    return () => {
      cancelAnimationFrame(frameId);
      if (rendererRef.current && avatarRef.current) {
        avatarRef.current.removeChild(rendererRef.current.domElement);
      }
      rendererRef.current?.dispose();
    };
  }, []);

  // Update the avatar when customization changes
  useEffect(() => {
    if (avatarRef3D.current && sceneRef.current) {
      // Remove old avatar
      while (avatarRef3D.current.children.length > 0) {
        avatarRef3D.current.remove(avatarRef3D.current.children[0]);
      }
      
      // Create new avatar with updated customization
      createAvatar(avatarRef3D.current, customization);
    }
  }, [customization]);

  // Update the avatar when mood changes
  useEffect(() => {
    if (avatarRef3D.current) {
      updateAvatarMood(mood);
    }
  }, [mood]);

  const updateSize = () => {
    if (!rendererRef.current || !avatarRef.current) return;
    
    let dimension = 120; // Default medium size
    if (size === 'sm') dimension = 60;
    if (size === 'lg') dimension = 180;
    
    rendererRef.current.setSize(dimension, dimension);
  };

  const createAvatar = (group: THREE.Group, customization: AvatarCustomization) => {
    const { faceShape, eyeStyle, color, accessories } = customization;
    
    // Create the head based on face shape
    let headGeometry;
    if (faceShape === 'round') {
      headGeometry = new THREE.SphereGeometry(1, 32, 32);
    } else if (faceShape === 'square') {
      headGeometry = new THREE.BoxGeometry(1.8, 1.8, 1.8);
    } else { // triangle
      headGeometry = new THREE.ConeGeometry(1, 2, 3);
      // Rotate cone to stand on its point
      const headMesh = new THREE.Mesh(headGeometry);
      headMesh.rotation.x = Math.PI;
    }
    
    const headMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.9,
      clearcoat: 0.5,
      clearcoatRoughness: 0.1,
      metalness: 0.1,
      roughness: 0.2,
    });
    
    const head = new THREE.Mesh(headGeometry, headMaterial);
    group.add(head);
    
    // Add eyes based on eye style
    addEyes(group, eyeStyle);
    
    // Add accessories
    if (accessories.includes('hat')) {
      addHat(group);
    }
    
    if (accessories.includes('glasses')) {
      addGlasses(group);
    }
    
    if (accessories.includes('bow')) {
      addBow(group);
    }
  };

  const addEyes = (group: THREE.Group, eyeStyle: string) => {
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    
    // Basic eye shapes
    let eyeGeometry;
    if (eyeStyle === 'default') {
      eyeGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    } else if (eyeStyle === 'happy') {
      // For happy eyes, use curved line shapes
      eyeGeometry = new THREE.TorusGeometry(0.1, 0.02, 16, 32, Math.PI);
    } else { // cool
      eyeGeometry = new THREE.BoxGeometry(0.2, 0.1, 0.05);
    }
    
    // Left eye
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.3, 0.1, 0.85);
    if (eyeStyle === 'happy') {
      leftEye.rotation.x = -Math.PI / 2;
      leftEye.rotation.z = Math.PI;
    }
    group.add(leftEye);
    
    // Right eye
    const rightEye = new THREE.Mesh(eyeGeometry.clone(), eyeMaterial);
    rightEye.position.set(0.3, 0.1, 0.85);
    if (eyeStyle === 'happy') {
      rightEye.rotation.x = -Math.PI / 2;
      rightEye.rotation.z = Math.PI;
    }
    group.add(rightEye);
    
    // Add mouth based on mood and eye style
    addMouth(group, eyeStyle);
  };

  const addMouth = (group: THREE.Group, eyeStyle: string) => {
    const mouthMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    
    let mouthGeometry;
    if (eyeStyle === 'happy') {
      // Happy mouth is a curved line
      mouthGeometry = new THREE.TorusGeometry(0.2, 0.02, 16, 32, Math.PI);
      const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
      mouth.position.set(0, -0.3, 0.85);
      mouth.rotation.x = -Math.PI / 2;
      group.add(mouth);
    } else if (eyeStyle === 'cool') {
      // Cool mouth is a straight line
      mouthGeometry = new THREE.BoxGeometry(0.3, 0.02, 0.05);
      const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
      mouth.position.set(0, -0.3, 0.85);
      group.add(mouth);
    } else {
      // Default mouth is a small curved line
      mouthGeometry = new THREE.TorusGeometry(0.15, 0.02, 16, 32, Math.PI);
      const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
      mouth.position.set(0, -0.3, 0.85);
      mouth.rotation.x = -Math.PI / 2;
      group.add(mouth);
    }
  };

  const addHat = (group: THREE.Group) => {
    const hatMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x333333,
      metalness: 0.1,
      roughness: 0.5
    });
    
    // Hat brim
    const brimGeometry = new THREE.CylinderGeometry(1.1, 1.1, 0.1, 32);
    const brim = new THREE.Mesh(brimGeometry, hatMaterial);
    brim.position.set(0, 1.1, 0);
    group.add(brim);
    
    // Hat top
    const topGeometry = new THREE.CylinderGeometry(0.7, 0.7, 0.5, 32);
    const top = new THREE.Mesh(topGeometry, hatMaterial);
    top.position.set(0, 1.4, 0);
    group.add(top);
  };

  const addGlasses = (group: THREE.Group) => {
    const glassesMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x222222,
      metalness: 0.7,
      roughness: 0.2
    });
    
    // Left lens frame
    const leftFrameGeometry = new THREE.TorusGeometry(0.25, 0.04, 16, 32);
    const leftFrame = new THREE.Mesh(leftFrameGeometry, glassesMaterial);
    leftFrame.position.set(-0.3, 0.1, 0.9);
    leftFrame.rotation.x = Math.PI / 2;
    group.add(leftFrame);
    
    // Right lens frame
    const rightFrameGeometry = new THREE.TorusGeometry(0.25, 0.04, 16, 32);
    const rightFrame = new THREE.Mesh(rightFrameGeometry, glassesMaterial);
    rightFrame.position.set(0.3, 0.1, 0.9);
    rightFrame.rotation.x = Math.PI / 2;
    group.add(rightFrame);
    
    // Bridge between lenses
    const bridgeGeometry = new THREE.BoxGeometry(0.4, 0.04, 0.04);
    const bridge = new THREE.Mesh(bridgeGeometry, glassesMaterial);
    bridge.position.set(0, 0.1, 0.9);
    group.add(bridge);
  };

  const addBow = (group: THREE.Group) => {
    const bowMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xFF69B4, // Pink color for bow
      metalness: 0.1,
      roughness: 0.3
    });
    
    // Left bow loop
    const leftLoopGeometry = new THREE.TorusGeometry(0.2, 0.05, 16, 32);
    const leftLoop = new THREE.Mesh(leftLoopGeometry, bowMaterial);
    leftLoop.position.set(-0.2, 0.9, 0.6);
    leftLoop.rotation.x = Math.PI / 3;
    leftLoop.rotation.z = Math.PI / 4;
    group.add(leftLoop);
    
    // Right bow loop
    const rightLoopGeometry = new THREE.TorusGeometry(0.2, 0.05, 16, 32);
    const rightLoop = new THREE.Mesh(rightLoopGeometry, bowMaterial);
    rightLoop.position.set(0.2, 0.9, 0.6);
    rightLoop.rotation.x = Math.PI / 3;
    rightLoop.rotation.z = -Math.PI / 4;
    group.add(rightLoop);
    
    // Center knot
    const knotGeometry = new THREE.BoxGeometry(0.2, 0.15, 0.1);
    const knot = new THREE.Mesh(knotGeometry, bowMaterial);
    knot.position.set(0, 0.85, 0.7);
    group.add(knot);
  };

  const updateAvatarMood = (mood: Mood) => {
    // In a full implementation, this would modify the avatar's expression based on mood
    // For now, we'll just adjust some simple properties
    
    if (!avatarRef3D.current) return;
    
    // Find mouth element (assuming it's the last child added to the group)
    const eyesAndMouth = avatarRef3D.current.children.filter(child => 
      child.position.z > 0.8 && child instanceof THREE.Mesh
    );
    
    if (eyesAndMouth.length < 3) return; // Need at least eyes and mouth
    
    // The last element should be the mouth
    const mouth = eyesAndMouth[eyesAndMouth.length - 1] as THREE.Mesh;
    
    if (mood === 'happy' || mood === 'improved') {
      // Big smile
      if (mouth.geometry instanceof THREE.TorusGeometry) {
        mouth.geometry = new THREE.TorusGeometry(0.3, 0.03, 16, 32, Math.PI);
      }
    } else if (mood === 'sad') {
      // Frown - inverted smile
      if (mouth.geometry instanceof THREE.TorusGeometry) {
        mouth.geometry = new THREE.TorusGeometry(0.2, 0.03, 16, 32, Math.PI);
        mouth.rotation.z = Math.PI; // Invert the mouth
      }
    } else if (mood === 'anxious' || mood === 'stressed') {
      // Zigzag mouth
      if (mouth.geometry instanceof THREE.TorusGeometry) {
        // In a more advanced implementation, we'd create a zigzag line
        // For now, we'll just make a straight line
        mouth.geometry = new THREE.BoxGeometry(0.3, 0.03, 0.05);
      }
    }
  };

  const sizeClass = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-28 h-28'
  }[size];

  return (
    <div className={`${sizeClass} relative`}>
      <div ref={avatarRef} className="w-full h-full"></div>
    </div>
  );
}