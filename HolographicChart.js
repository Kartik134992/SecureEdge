import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { gsap } from 'gsap';

const HolographicChart = ({ data }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  
  useEffect(() => {
    gsap.registerPlugin(MotionPathPlugin);
    
    const width = 800;
    const height = 500;
    const margin = { top: 50, right: 50, bottom: 50, left: 50 };
    
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);
    
    // Create gradient for holographic effect
    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', 'holographic-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '100%');
    
    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#00d2ff');
    
    gradient.append('stop')
      .attr('offset', '50%')
      .attr('stop-color', '#3a7bd5');
    
    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#4a8fe7');
    
    // Create scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(data, d => new Date(d.date)))
      .range([margin.left, width - margin.right]);
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value)])
      .range([height - margin.bottom, margin.top]);
    
    // Create line generator
    const line = d3.line()
      .x(d => xScale(new Date(d.date)))
      .y(d => yScale(d.value))
      .curve(d3.curveCatmullRom.alpha(0.5));
    
    // Draw the line
    const path = svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'url(#holographic-gradient)')
      .attr('stroke-width', 4)
      .attr('d', line);
    
    // Create glow effect
    const glow = svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'url(#holographic-gradient)')
      .attr('stroke-width', 20)
      .attr('stroke-opacity', 0.2)
      .attr('d', line);
    
    // Add animated dots
    const dots = svg.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', d => xScale(new Date(d.date)))
      .attr('cy', d => yScale(d.value))
      .attr('r', 0)
      .attr('fill', 'url(#holographic-gradient)');
    
    // Animation timeline
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    
    tl.from(path.node(), {
      drawSVG: "0%",
      duration: 2
    })
    .to(glow.node(), {
      attr: { 'stroke-opacity': 0.4 },
      duration: 0.5,
      yoyo: true,
      repeat: -1
    }, "-=1.5")
    .to(dots.nodes(), {
      r: 4,
      stagger: 0.1,
      duration: 0.3
    }, "-=1");
    
    // Create floating particles
    for (let i = 0; i < 30; i++) {
      const particle = svg.append('circle')
        .attr('r', Math.random() * 3 + 1)
        .attr('fill', `rgba(74, 143, 231, ${Math.random() * 0.5 + 0.2})`)
        .attr('cx', Math.random() * width)
        .attr('cy', Math.random() * height);
      
      gsap.to(particle.node(), {
        cx: `+=${(Math.random() - 0.5) * 100}`,
        cy: `+=${(Math.random() - 0.5) * 50}`,
        duration: Math.random() * 10 + 5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }
    
    // Add interactive effects
    svg.on('mousemove', function(event) {
      const [x, y] = d3.pointer(event);
      
      gsap.to(path.node(), {
        attr: { 'stroke-width': 6 + Math.sin(x / 50) * 2 },
        duration: 0.3
      });
      
      gsap.to(glow.node(), {
        attr: { 'stroke-width': 30 + Math.sin(y / 50) * 10 },
        duration: 0.5
      });
    });
    
    return () => {
      tl.kill();
    };
  }, [data]);
  
  return (
    <div ref={containerRef} className="holographic-container">
      <svg ref={svgRef} className="holographic-chart" />
      <div className="holographic-overlay" />
    </div>
  );
};

export default HolographicChart;