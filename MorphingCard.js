import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';

const MorphingCard = ({ title, content, iconPaths }) => {
  const cardRef = useRef(null);
  const iconRef = useRef(null);
  const [active, setActive] = useState(false);
  
  useEffect(() => {
    gsap.registerPlugin(MorphSVGPlugin);
    
    // Initial animation
    gsap.from(cardRef.current, {
      y: 50,
      opacity: 0,
      duration: 0.8,
      ease: "back.out(1.2)"
    });
    
    // Continuous subtle floating effect
    gsap.to(cardRef.current, {
      y: "-=5",
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
  }, []);
  
  const handleHover = () => {
    const tl = gsap.timeline();
    
    if (!active) {
      tl.to(cardRef.current, {
        backdropFilter: 'blur(12px)',
        backgroundColor: 'rgba(255, 255, 255, 0.18)',
        duration: 0.3
      })
      .to(iconRef.current, {
        morphSVG: iconPaths[1],
        duration: 0.5,
        ease: "elastic.out(1, 0.5)"
      }, "-=0.2");
      
      setActive(true);
    } else {
      tl.to(cardRef.current, {
        backdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        duration: 0.3
      })
      .to(iconRef.current, {
        morphSVG: iconPaths[0],
        duration: 0.5,
        ease: "back.out(1.2)"
      }, "-=0.2");
      
      setActive(false);
    }
  };
  
  return (
    <div 
      ref={cardRef}
      className="morphing-card"
      onMouseEnter={handleHover}
      onMouseLeave={handleHover}
    >
      <div className="card-icon">
        <svg width="60" height="60" viewBox="0 0 24 24">
          <path 
            ref={iconRef}
            d={iconPaths[0]}
            fill="url(#glass-gradient)"
          />
        </svg>
      </div>
      <h3>{title}</h3>
      <p>{content}</p>
      
      <div className="card-radial-gradient" />
      <div className="card-noise-overlay" />
    </div>
  );
};

// Example usage
const GlassmorphismUI = () => {
  const features = [
    {
      title: "Real-Time Analytics",
      content: "Live market data with millisecond precision",
      iconPaths: [
        "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
        "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
      ]
    },
    // More feature cards...
  ];
  
  return (
    <div className="glassmorphism-ui">
      {features.map((feature, index) => (
        <MorphingCard key={index} {...feature} />
      ))}
    </div>
  );
};

export default GlassmorphismUI;