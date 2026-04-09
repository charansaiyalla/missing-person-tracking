export default function ZoomModal({ imgSrc, onClose }) {
  if (!imgSrc) return null;

  return (
    <div 
      className="zoom-modal-backdrop" 
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.85)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'zoom-out',
        backdropFilter: 'blur(5px)'
      }}
    >
      <div 
        className="zoom-modal-content animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          maxWidth: '90vw',
          maxHeight: '90vh',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: '0 10px 50px rgba(0,0,0,0.8), 0 0 30px rgba(0,102,255,0.2)',
          border: '1px solid var(--border-bright)'
        }}
      >
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'var(--danger)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
            zIndex: 10
          }}
        >
          ✕
        </button>
        <img 
          src={imgSrc} 
          alt="Zoomed missing person match" 
          style={{
            maxWidth: '100%',
            maxHeight: '90vh',
            display: 'block',
            objectFit: 'contain'
          }}
        />
      </div>
    </div>
  );
}
