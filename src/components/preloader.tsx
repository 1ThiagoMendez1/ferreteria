
'use client';

import { useState, useEffect } from 'react';

export default function Preloader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 6000); // Total duration of the animation

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`preloader ${loading ? '' : 'fade-out'}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 400 200"
        className="animation-container"
      >
        {/* Background elements */}
        <line
          x1="0"
          y1="180"
          x2="400"
          y2="180"
          stroke="hsl(var(--muted-foreground))"
          strokeWidth="2"
        />

        {/* Person */}
        <g id="person">
          {/* Body */}
          <rect
            x="35"
            y="135"
            width="10"
            height="30"
            fill="hsl(var(--primary-foreground))"
          />
          {/* Head */}
          <circle cx="40" cy="128" r="7" fill="hsl(var(--primary-foreground))" />
          {/* Arm */}
          <line
            x1="40"
            y1="145"
            x2="55"
            y2="135"
            stroke="hsl(var(--primary-foreground))"
            strokeWidth="3"
          />
        </g>
        
        {/* Brick */}
        <g id="brick">
            <rect x="50" y="120" width="20" height="10" fill="hsl(var(--accent))"/>
        </g>


        {/* Truck */}
        <g id="truck">
          <g className="truck-body">
            {/* Main Body */}
            <path
              d="M80 175 V 120 H 180 V 175 Z"
              fill="hsl(var(--accent))"
              stroke="hsl(var(--accent-foreground))"
              strokeWidth="1.5"
            />
            {/* Cab */}
            <path
              d="M180 175 V 110 H 230 L 250 140 V 175 Z"
              fill="hsl(var(--accent))"
              stroke="hsl(var(--accent-foreground))"
              strokeWidth="1.5"
            />
            {/* Window */}
            <path
              d="M185 115 H 225 L 240 140 H 185 Z"
              fill="hsl(var(--background))"
              stroke="hsl(var(--accent-foreground))"
              strokeWidth="1"
            />
             {/* Grille */}
            <rect x="250" y="155" width="10" height="20" fill="#718096" />
             <line x1="252" y1="155" x2="252" y2="175" stroke="#4A5568" strokeWidth="1.5" />
             <line x1="255" y1="155" x2="255" y2="175" stroke="#4A5568" strokeWidth="1.5" />
             <line x1="258" y1="155" x2="258" y2="175" stroke="#4A5568" strokeWidth="1.5" />

            {/* Bumper */}
            <rect x="80" y="172" width="180" height="8" fill="#A0AEC0" />
            
            {/* Headlight */}
            <circle cx="255" cy="148" r="4" fill="#FBBF24" />
          </g>

          {/* Wheels */}
          <g className="wheel wheel-rear">
            <circle cx="110" cy="175" r="15" fill="#2D3748" />
            <circle cx="110" cy="175" r="7" fill="#718096" />
          </g>
          <g className="wheel wheel-front">
            <circle cx="225" cy="175" r="15" fill="#2D3748" />
            <circle cx="225" cy="175" r="7" fill="#718096" />
          </g>
        </g>
        <g id="smoke-puff">
            <circle cx="95" cy="170" r="5" fill="hsl(var(--muted-foreground))" opacity="0.8" />
            <circle cx="85" cy="165" r="7" fill="hsl(var(--muted-foreground))" opacity="0.6" />
            <circle cx="90" cy="160" r="6" fill="hsl(var(--muted-foreground))" opacity="0.4" />
        </g>
      </svg>
    </div>
  );
}
