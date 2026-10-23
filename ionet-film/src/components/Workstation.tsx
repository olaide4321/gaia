import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C} from '../theme';
import {LagosSkyline} from './Lagos';
import {Bokeh} from './Atmosphere';
import {GlassDroplets, RainStreaks} from './Rain';
import {Engineer} from './Engineer';

/** Interior: the engineer at her desk by a rain-streaked window over Lagos. */
export const Workstation: React.FC<{
  frame: number;
  screen: React.ReactNode;
  light: number;
  flicker?: number;
  lean?: number;
  dawn?: number;
  rain?: number;
  lightning?: number;
}> = ({frame, screen, light, flicker = 0, lean = 0, dawn = 0, rain = 1, lightning = 0}) => (
  <AbsoluteFill style={{background: C.black}}>
    {/* Window view, defocused */}
    <AbsoluteFill style={{filter: 'blur(5px)', transform: 'scale(1.15) translateY(-60px)', opacity: 0.8}}>
      <LagosSkyline dawn={dawn} lightning={lightning} />
    </AbsoluteFill>
    <Bokeh count={36} seed={21} opacity={0.65} yRange={[0.25, 0.75]} drift={0.08} />
    <RainStreaks count={Math.round(260 * rain)} seed={4} opacity={0.22 * rain} speed={30} />
    <GlassDroplets count={Math.round(240 * Math.max(0.3, rain))} seed={13} opacity={0.75} />
    {/* window mullions */}
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 60, background: '#0a0807'}} />
    <div style={{position: 'absolute', left: 940, top: 0, bottom: 0, width: 26, background: '#0b0908'}} />
    {/* room darkness gradient */}
    <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(6,5,4,0.75) 0%, rgba(6,5,4,0.15) 45%, rgba(6,5,4,0.4) 100%)'}} />
    {/* desk */}
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 820,
        bottom: 0,
        background: 'linear-gradient(180deg, #1e1812 0%, #0c0a08 60%)',
        borderTop: `1px solid rgba(243,201,107,${0.25 * light})`,
      }}
    />
    {/* screen spill on desk */}
    <div
      style={{
        position: 'absolute',
        left: 900,
        top: 790,
        width: 900,
        height: 160,
        background: `radial-gradient(ellipse at 50% 20%, rgba(232,138,42,${0.35 * light}) 0%, rgba(0,0,0,0) 70%)`,
      }}
    />
    {/* mug with steam */}
    <svg style={{position: 'absolute', left: 820, top: 730}} width={120} height={120}>
      <rect x={20} y={40} width={56} height={62} rx={8} fill="#120e0b" stroke={C.gold} strokeOpacity={0.25 * light} />
      <path d="M76 55 Q100 60 76 85" stroke="#120e0b" strokeWidth={8} fill="none" />
      {[0, 1].map((k) => (
        <path
          key={k}
          d={`M${40 + k * 16} 36 C ${30 + k * 16 + Math.sin(frame / 14 + k) * 8} 18, ${52 + k * 16} 8, ${42 + k * 16 + Math.sin(frame / 10 + k) * 6} -10`}
          stroke={C.ivory}
          strokeOpacity={0.12}
          strokeWidth={3}
          fill="none"
        />
      ))}
    </svg>
    {/* monitor */}
    <div style={{position: 'absolute', left: 1080, top: 300, perspective: 1600}}>
      <div
        style={{
          width: 1600,
          height: 900,
          transform: 'rotateY(-30deg) scale(0.46)',
          transformOrigin: '0 0',
          border: '18px solid #0b0908',
          borderRadius: 18,
          boxShadow: `0 0 ${140 * light}px rgba(232,138,42,${0.45 * light})`,
        }}
      >
        {screen}
      </div>
    </div>
    <div style={{position: 'absolute', left: 1330, top: 720, width: 60, height: 110, background: '#0b0908'}} />
    {/* engineer */}
    <div style={{position: 'absolute', left: 330, top: 160, width: 770, height: 1100}}>
      <Engineer frame={frame} light={light} flicker={flicker} leanForward={lean} blinkAt={[40, 150, 260]} />
    </div>
  </AbsoluteFill>
);
