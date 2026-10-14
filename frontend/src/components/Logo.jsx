import React from 'react';

export default function Logo({ size = 'md', variant = 'dark', showSubtext = true, layout = 'row' }) {
  // Dimensions based on size prop
  const iconSizes = {
    sm: { box: 38, radius: 8 },
    md: { box: 48, radius: 10 },
    lg: { box: 64, radius: 14 }
  };

  const currentSize = iconSizes[size] || iconSizes.md;

  const isLight = variant === 'light'; // For dark backgrounds like footer or admin sidebar

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size === 'lg' ? '1rem' : '0.75rem',
        flexDirection: layout === 'column' ? 'column' : 'row',
        textAlign: layout === 'column' ? 'center' : 'left',
        cursor: 'pointer',
        userSelect: 'none'
      }}
    >
      {/* Luxury White & Gold Emblem */}
      <div
        style={{
          width: `${currentSize.box}px`,
          height: `${currentSize.box}px`,
          borderRadius: `${currentSize.radius}px`,
          overflow: 'hidden',
          flexShrink: 0,
          boxShadow: isLight
            ? '0 3px 12px rgba(0, 0, 0, 0.3), 0 0 10px rgba(200, 162, 77, 0.25)'
            : '0 3px 10px rgba(200, 162, 77, 0.2), 0 1px 4px rgba(0, 0, 0, 0.05)',
          border: '1.5px solid var(--color-gold)',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2px',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease'
        }}
      >
        <img
          src="/logo-emblem.jpg"
          alt="Saravanan Builders Royal Gold Emblem"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block'
          }}
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </div>

      {/* Brand Typography */}
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
        <div
          style={{
            fontSize: size === 'lg' ? '1.5rem' : size === 'sm' ? '1.05rem' : '1.3rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
            color: isLight ? '#FFFFFF' : 'var(--color-navy)',
            fontFamily: 'var(--font-main)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
        >
          <span>SARAVANAN</span>
          <span style={{ color: 'var(--color-gold)' }}>BUILDERS</span>
        </div>

        {showSubtext && (
          <span
            style={{
              fontSize: size === 'lg' ? '0.8rem' : size === 'sm' ? '0.65rem' : '0.72rem',
              fontWeight: 600,
              color: isLight ? 'var(--color-gold-light)' : 'var(--color-gold)',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              marginTop: '3px'
            }}
          >
            Luxury Residential Construction
          </span>
        )}
      </div>
    </div>
  );
}
