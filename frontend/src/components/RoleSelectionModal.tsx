'use client'

interface RoleSelectionModalProps {
  open: boolean
  onSelect: (role: 'PM' | 'FREELANCER') => void
}

export function RoleSelectionModal({
  open,
  onSelect
}: RoleSelectionModalProps) {
  if (!open) return null

  const handleSelect = (role: 'PM' | 'FREELANCER') => {
    localStorage.setItem('selectedRole', role)
    onSelect(role)
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px'
      }}
      // 바깥 클릭 비활성화 (선택 필수)
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '12px',
          overflow: 'hidden',
          maxWidth: '500px',
          width: '100%',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          position: 'relative'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '24px 28px',
          borderBottom: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#111',
            margin: 0,
            marginBottom: '8px'
          }}>
            역할 선택
          </h2>
          <p style={{
            fontSize: '14px',
            color: '#666',
            margin: 0,
            lineHeight: '1.5'
          }}>
            PM과 Freelancer 역할을 모두 보유하고 있습니다.<br />
            어떤 역할로 입장하시겠습니까?
          </p>
        </div>

        {/* Content */}
        <div style={{
          padding: '24px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {/* PM 버튼 */}
          <button
            onClick={() => handleSelect('PM')}
            style={{
              background: '#16a34a',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '16px 24px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '4px'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#15803d'}
            onMouseOut={(e) => e.currentTarget.style.background = '#16a34a'}
          >
            <span style={{ fontSize: '18px' }}>PM으로 입장</span>
            <span style={{ fontSize: '13px', opacity: 0.9 }}>
              프로젝트 관리 및 프리랜서 매칭
            </span>
          </button>

          {/* Freelancer 버튼 */}
          <button
            onClick={() => handleSelect('FREELANCER')}
            style={{
              background: '#fff',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              padding: '16px 24px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '4px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#f9fafb'
              e.currentTarget.style.borderColor = '#16a34a'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = '#fff'
              e.currentTarget.style.borderColor = '#d1d5db'
            }}
          >
            <span style={{ fontSize: '18px' }}>Freelancer로 입장</span>
            <span style={{ fontSize: '13px', opacity: 0.7 }}>
              프로젝트 제안 수신 및 지원
            </span>
          </button>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 28px',
          background: '#f9fafb',
          borderTop: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '12px',
            color: '#666',
            margin: 0
          }}>
            💡 선택한 역할은 언제든 대시보드에서 변경할 수 있습니다
          </p>
        </div>
      </div>
    </div>
  )
}
