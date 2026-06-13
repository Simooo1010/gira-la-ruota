import React from 'react';
import { motion } from 'framer-motion';

export type WedgeValue = number | 'Passa' | 'Bancarotta' | 'Jolly';

export const WEDGE_VALUES: WedgeValue[] = [
  500, 1000, 500, 'Passa', 1500, 500, 'Bancarotta', 2000, 
  500, 1000, 'Jolly', 500, 3000, 500, 'Bancarotta', 1000
];

const getWedgeColor = (value: WedgeValue, index: number) => {
  if (value === 'Bancarotta') return '#111111'; // Dark
  if (value === 'Passa') return '#D60000'; // Red
  if (value === 'Jolly') return '#00b894'; // Green
  const colors = ['#FFD700', '#00266B', '#E5A910', '#00a8ff']; // Yellow, Blue, Gold, Light Blue
  return colors[index % colors.length];
};

interface WheelProps {
  rotation: number;
}

export const Wheel: React.FC<WheelProps> = ({ rotation }) => {
  const numWedges = WEDGE_VALUES.length;
  const anglePerWedge = 360 / numWedges;
  const radius = 200;
  const cx = 200;
  const cy = 200;

  const createWedge = (index: number) => {
    const startAngle = (index * anglePerWedge - 90) * (Math.PI / 180);
    const endAngle = ((index + 1) * anglePerWedge - 90) * (Math.PI / 180);

    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);

    const pathData = [
      `M ${cx} ${cy}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 0 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');

    const value = WEDGE_VALUES[index];
    const color = getWedgeColor(value, index);
    const textColor = color === '#FFD700' || color === '#E5A910' ? '#000' : '#FFF';
    
    // Text positioning
    const textAngle = (index * anglePerWedge + anglePerWedge / 2 - 90) * (Math.PI / 180);
    const textRadius = radius * 0.7; // Place text at 70% of radius
    const textX = cx + textRadius * Math.cos(textAngle);
    const textY = cy + textRadius * Math.sin(textAngle);
    const rotationDeg = index * anglePerWedge + anglePerWedge / 2;

    return (
      <g key={index}>
        <path d={pathData} fill={color} stroke="#FFF" strokeWidth="2" />
        <text
          x={textX}
          y={textY}
          fill={textColor}
          fontSize="14"
          fontWeight="bold"
          textAnchor="middle"
          transform={`rotate(${rotationDeg}, ${textX}, ${textY})`}
          dominantBaseline="middle"
        >
          {value}
        </text>
      </g>
    );
  };

  return (
    <div className="relative w-64 h-64 md:w-96 md:h-96 mx-auto drop-shadow-2xl">
      {/* Pointer */}
      <div className="absolute top-[-10px] left-1/2 transform -translate-x-1/2 z-10">
        <svg width="40" height="40" viewBox="0 0 40 40">
          <path d="M 20 40 L 0 0 L 40 0 Z" fill="#FFF" filter="drop-shadow(0px 2px 2px rgba(0,0,0,0.5))" />
        </svg>
      </div>
      
      <motion.div 
        className="w-full h-full rounded-full overflow-hidden"
        animate={{ rotate: rotation }}
        transition={{ duration: 4, ease: "easeOut" }}
      >
        <svg viewBox="0 0 400 400" className="w-full h-full">
          {WEDGE_VALUES.map((_, idx) => createWedge(idx))}
          <circle cx="200" cy="200" r="30" fill="#FFF" stroke="#E5A910" strokeWidth="4" />
          <circle cx="200" cy="200" r="10" fill="#E5A910" />
        </svg>
      </motion.div>
    </div>
  );
};
