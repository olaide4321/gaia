import React, {useLayoutEffect, useRef} from 'react';
import {AbsoluteFill} from 'remotion';

/**
 * A full-frame canvas that redraws synchronously whenever `deps` change.
 * Drawing happens in useLayoutEffect so the frame is complete before Remotion captures it.
 */
export const DrawCanvas: React.FC<{
  width: number;
  height: number;
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
  deps: unknown[];
  style?: React.CSSProperties;
}> = ({width, height, draw, deps, style}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    draw(ctx, width, height);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return (
    <AbsoluteFill style={{pointerEvents: 'none', ...style}}>
      <canvas ref={ref} width={width} height={height} style={{width: '100%', height: '100%'}} />
    </AbsoluteFill>
  );
};
