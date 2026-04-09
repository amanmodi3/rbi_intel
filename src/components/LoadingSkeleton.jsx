const S = ({ w = '100%', h = 12, r = 6, opacity = 0.06 }) => (
  <div style={{
    width: w, height: h, borderRadius: r,
    background: `rgba(255,255,255,${opacity})`,
    flexShrink: 0,
  }} />
);

export default function LoadingSkeleton({ isSidebar, isMainArea }) {
  if (isSidebar) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Stats skeleton */}
        <div>
          <S w={60} h={10} r={4} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
            {[0, 1].map((i) => (
              <div key={i} style={{ padding: '14px', borderRadius: 10, border: '1px solid #1F1F1F' }}>
                <S w={48} h={28} r={4} opacity={0.09} />
                <S w={56} h={8} r={3} opacity={0.05} />
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #1F1F1F' }}>
                <S w={36} h={18} r={3} opacity={0.08} />
                <S w={44} h={8} r={3} opacity={0.04} />
              </div>
            ))}
          </div>
        </div>

        {/* Chart skeleton */}
        <div>
          <S w={80} h={10} r={4} />
          <div style={{ marginTop: 14, height: 200, borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid #1F1F1F' }} />
        </div>
      </div>
    );
  }

  if (isMainArea) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            style={{
              borderRadius: 12, border: '1px solid #1F1F1F',
              padding: 16, display: 'flex', flexDirection: 'column', gap: 12,
              animationDelay: `${i * 60}ms`,
            }}
            className="fade-in"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <S w={80}  h={9}  r={3} />
              <S w={60}  h={9}  r={3} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <S w="100%" h={13} r={4} opacity={0.08} />
              <S w="80%"  h={13} r={4} opacity={0.08} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <S w="100%" h={9} r={3} />
              <S w="90%"  h={9} r={3} />
              <S w="70%"  h={9} r={3} />
            </div>
            <div style={{ display: 'flex', gap: 5 }}>
              <S w={52} h={18} r={999} opacity={0.07} />
              <S w={60} h={18} r={999} opacity={0.07} />
            </div>
            <div style={{ display: 'flex', gap: 8, paddingTop: 10, borderTop: '1px solid #1F1F1F', marginTop: 4 }}>
              <S w="50%" h={28} r={8} opacity={0.05} />
              <S w="50%" h={28} r={8} opacity={0.05} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
}
