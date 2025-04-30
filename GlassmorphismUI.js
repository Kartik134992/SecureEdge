import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';

const InteractiveStockChart = ({ data }) => {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const [activePoint, setActivePoint] = useState(null);
  const [timeRange, setTimeRange] = useState('1M');
  
  useEffect(() => {
    gsap.registerPlugin(Draggable);
    
    const width = 1000;
    const height = 500;
    const margin = { top: 30, right: 50, bottom: 50, left: 60 };
    
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);
    
    // Filter data based on time range
    const filteredData = filterDataByRange(data, timeRange);
    
    // Create scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(filteredData, d => new Date(d.date)))
      .range([margin.left, width - margin.right]);
    
    const yScale = d3.scaleLinear()
      .domain([d3.min(filteredData, d => d.low) * 0.98, d3.max(filteredData, d => d.high) * 1.02])
      .range([height - margin.bottom, margin.top]);
    
    // Create candlestick chart
    const candleWidth = width / filteredData.length * 0.7;
    
    svg.selectAll('.candle')
      .data(filteredData)
      .enter()
      .append('rect')
      .attr('class', 'candle')
      .attr('x', d => xScale(new Date(d.date)) - candleWidth/2)
      .attr('y', d => yScale(Math.max(d.open, d.close)))
      .attr('width', candleWidth)
      .attr('height', d => Math.abs(yScale(d.open) - yScale(d.close)))
      .attr('fill', d => d.open > d.close ? '#ff4d4d' : '#4dff7f')
      .on('mouseover', (event, d) => {
        setActivePoint(d);
        gsap.to(tooltipRef.current, { opacity: 1, duration: 0.2 });
      })
      .on('mouseout', () => {
        gsap.to(tooltipRef.current, { opacity: 0, duration: 0.2 });
      });
    
    // Add wicks
    svg.selectAll('.wick')
      .data(filteredData)
      .enter()
      .append('line')
      .attr('class', 'wick')
      .attr('x1', d => xScale(new Date(d.date)))
      .attr('x2', d => xScale(new Date(d.date)))
      .attr('y1', d => yScale(d.high))
      .attr('y2', d => yScale(d.low))
      .attr('stroke', d => d.open > d.close ? '#ff4d4d' : '#4dff7f')
      .attr('stroke-width', 1);
    
    // Add moving average line
    const movingAvg = calculateMovingAverage(filteredData, 20);
    const line = d3.line()
      .x(d => xScale(new Date(d.date)))
      .y(d => yScale(d.avg));
    
    svg.append('path')
      .datum(movingAvg)
      .attr('class', 'ma-line')
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', '#3a86ff')
      .attr('stroke-width', 2);
    
    // Add axes
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d3.timeFormat('%b %d'));
    
    const yAxis = d3.axisLeft(yScale)
      .tickFormat(d => `$${d.toFixed(2)}`);
    
    svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(xAxis);
    
    svg.append('g')
      .attr('class', 'y-axis')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(yAxis);
    
    // Add zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([1, 10])
      .translateExtent([[0, 0], [width, height]])
      .extent([[0, 0], [width, height]])
      .on('zoom', (event) => {
        const newXScale = event.transform.rescaleX(xScale);
        svg.selectAll('.candle')
          .attr('x', d => newXScale(new Date(d.date)) - candleWidth/2);
        
        svg.selectAll('.wick')
          .attr('x1', d => newXScale(new Date(d.date)))
          .attr('x2', d => newXScale(new Date(d.date)));
        
        svg.select('.ma-line')
          .attr('d', line.x(d => newXScale(new Date(d.date))));
        
        svg.select('.x-axis').call(xAxis.scale(newXScale));
      });
    
    svg.call(zoom);
    
    // Add brush for time range selection
    const brush = d3.brushX()
      .extent([[margin.left, margin.top], [width - margin.right, margin.top + 30]])
      .on('end', ({ selection }) => {
        if (selection) {
          const [x0, x1] = selection;
          const newDomain = [xScale.invert(x0), xScale.invert(x1)];
          xScale.domain(newDomain);
          
          svg.selectAll('.candle')
            .attr('x', d => xScale(new Date(d.date)) - candleWidth/2);
          
          svg.selectAll('.wick')
            .attr('x1', d => xScale(new Date(d.date)))
            .attr('x2', d => xScale(new Date(d.date)));
          
          svg.select('.ma-line')
            .attr('d', line.x(d => xScale(new Date(d.date))));
          
          svg.select('.x-axis').call(xAxis);
        }
      });
    
    svg.append('g')
      .attr('class', 'brush')
      .call(brush);
    
    return () => {
      svg.selectAll('*').remove();
    };
  }, [data, timeRange]);
  
  const filterDataByRange = (data, range) => {
    const now = new Date();
    let cutoff = new Date();
    
    switch(range) {
      case '1D': cutoff.setDate(now.getDate() - 1); break;
      case '1W': cutoff.setDate(now.getDate() - 7); break;
      case '1M': cutoff.setMonth(now.getMonth() - 1); break;
      case '3M': cutoff.setMonth(now.getMonth() - 3); break;
      case '1Y': cutoff.setFullYear(now.getFullYear() - 1); break;
      default: return data;
    }
    
    return data.filter(d => new Date(d.date) >= cutoff);
  };
  
  const calculateMovingAverage = (data, windowSize) => {
    return data.map((d, i) => {
      const start = Math.max(0, i - windowSize + 1);
      const subset = data.slice(start, i + 1);
      const sum = subset.reduce((acc, val) => acc + val.close, 0);
      return {
        date: d.date,
        avg: sum / subset.length
      };
    });
  };
  
  return (
    <div className="interactive-chart-container">
      <div className="chart-controls">
        {['1D', '1W', '1M', '3M', '1Y', 'ALL'].map(range => (
          <button 
            key={range}
            className={timeRange === range ? 'active' : ''}
            onClick={() => setTimeRange(range)}
          >
            {range}
          </button>
        ))}
      </div>
      
      <svg ref={svgRef} className="interactive-chart" />
      
      <div ref={tooltipRef} className="chart-tooltip" style={{ opacity: 0 }}>
        {activePoint && (
          <>
            <h4>{new Date(activePoint.date).toLocaleDateString()}</h4>
            <p>Open: ${activePoint.open.toFixed(2)}</p>
            <p>Close: ${activePoint.close.toFixed(2)}</p>
            <p>High: ${activePoint.high.toFixed(2)}</p>
            <p>Low: ${activePoint.low.toFixed(2)}</p>
            <p>Volume: {activePoint.volume.toLocaleString()}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default InteractiveStockChart;