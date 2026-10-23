import React from 'react';
import {Img, staticFile} from 'remotion';
import {LOGO} from '../config';
import {C, FONT} from '../theme';

/**
 * io.net brand mark.
 * PLACEHOLDER: a typographic wordmark is drawn unless LOGO.file is set in src/config.ts.
 * Replace it with the official io.net logo file only if you have the right to use it.
 */
export const BrandLogo: React.FC<{scale?: number; glow?: number; sweep?: number}> = ({
  scale = 1,
  glow = 1,
  sweep = -1,
}) => {
  if (LOGO.file) {
    return (
      <Img
        src={staticFile(LOGO.file)}
        style={{height: LOGO.height * scale, filter: `drop-shadow(0 0 ${30 * glow}px rgba(243,201,107,0.45))`}}
      />
    );
  }
  const size = 168 * scale;
  return (
    <div
      style={{
        position: 'relative',
        fontFamily: FONT.sans,
        fontWeight: 600,
        fontSize: size,
        letterSpacing: -size * 0.035,
        lineHeight: 1,
        color: C.ivory,
        textShadow: `0 0 ${40 * glow}px rgba(243,201,107,${0.55 * glow}), 0 0 ${110 * glow}px rgba(232,138,42,${0.35 * glow})`,
      }}
    >
      <span>io</span>
      <span style={{color: C.goldBright}}>.</span>
      <span>net</span>
      {sweep >= 0 && sweep <= 1 ? (
        <span
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(105deg, transparent ${sweep * 140 - 30}%, rgba(255,246,220,0.95) ${
              sweep * 140 - 15
            }%, transparent ${sweep * 140}%)`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          io.net
        </span>
      ) : null}
    </div>
  );
};
