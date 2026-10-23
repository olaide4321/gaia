import React from 'react';
import {getStaticFiles, Img, staticFile} from 'remotion';
import {LOGO} from '../config';
import {C, FONT} from '../theme';

const AUTO_CANDIDATES = ['ionet-logo.svg', 'ionet-logo.png', 'ionet-logo.webp'];

/** Resolves the official logo file in public/, or null to use the placeholder wordmark. */
const resolveLogo = (): string | null => {
  if (LOGO.file === null) return null;
  if (LOGO.file !== 'auto') return LOGO.file;
  const files = new Set(getStaticFiles().map((f) => f.name));
  return AUTO_CANDIDATES.find((c) => files.has(c)) ?? null;
};

const sweepGradient = (sweep: number) =>
  `linear-gradient(105deg, transparent ${sweep * 140 - 30}%, rgba(255,246,220,0.95) ${sweep * 140 - 15}%, transparent ${sweep * 140}%)`;

/**
 * io.net brand mark, used wherever io.net appears on screen.
 * Uses the official logo file when present (see LOGO in src/config.ts),
 * otherwise a typographic placeholder.
 */
export const BrandLogo: React.FC<{scale?: number; glow?: number; sweep?: number}> = ({
  scale = 1,
  glow = 1,
  sweep = -1,
}) => {
  const file = resolveLogo();
  const sweeping = sweep >= 0 && sweep <= 1;

  if (file) {
    const src = staticFile(file);
    const tint = LOGO.tint === 'ivory' ? 'brightness(0) invert(0.94) sepia(0.2) ' : '';
    return (
      <div style={{position: 'relative', display: 'inline-block', lineHeight: 0}}>
        <Img
          src={src}
          style={{
            height: LOGO.height * scale,
            filter: `${tint}drop-shadow(0 0 ${30 * glow}px rgba(243,201,107,${0.5 * glow})) drop-shadow(0 0 ${90 * glow}px rgba(232,138,42,${0.3 * glow}))`,
          }}
        />
        {sweeping ? (
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              background: sweepGradient(sweep),
              WebkitMaskImage: `url("${src}")`,
              maskImage: `url("${src}")`,
              WebkitMaskSize: '100% 100%',
              maskSize: '100% 100%',
              WebkitMaskRepeat: 'no-repeat',
              maskRepeat: 'no-repeat',
            }}
          />
        ) : null}
      </div>
    );
  }

  // Placeholder wordmark (replace by adding the official logo file — see src/config.ts)
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
      {sweeping ? (
        <span
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: sweepGradient(sweep),
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
