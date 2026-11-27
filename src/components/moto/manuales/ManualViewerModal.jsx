import React, { useState } from 'react';
import { CheckIcon, DownloadIcon, XIcon } from '../../shared/Icons';

export default function ManualViewerModal({
  manual,
  motoName = '',
  onClose,
  onToggleStep,
  onResetSteps,
  onRegisterMaintenance,
}) {
  const [registeredMsg, setRegisteredMsg] = useState('');

  if (!manual) return null;

  const steps = Array.isArray(manual.steps) ? manual.steps : [];
  const completedCount = steps.filter((s) => s.done).length;
  const progress = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;

  const isPdf = manual.fileType?.includes('pdf') || manual.fileName?.toLowerCase().endsWith('.pdf');
  const isImage = manual.fileType?.startsWith('image/');

  const handleRegister = async () => {
    await onRegisterMaintenance(manual);
    setRegisteredMsg('Mantenimiento registrado en el historial de la moto.');
    setTimeout(() => setRegisteredMsg(''), 4000);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.75)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '960px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '1.5rem',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary)', fontWeight: 600 }}>
              {manual.category} {motoName ? `· ${motoName}` : ''}
            </span>
            <h2 style={{ margin: '0.25rem 0 0', color: 'var(--color-text-primary)' }}>{manual.title}</h2>
          </div>
          <button type="button" className="btn btn-secondary" onClick={onClose} title="Cerrar">
            <XIcon width={18} height={18} />
          </button>
        </div>

        {/* Datos técnicos */}
        {(manual.pageRef || manual.torqueSpecs || manual.notes) && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '0.75rem',
              padding: '0.9rem 1rem',
              borderRadius: '10px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--color-card-border)',
              marginBottom: '1.25rem',
              fontSize: '0.875rem',
            }}
          >
            {manual.pageRef && (
              <div>
                <strong style={{ color: 'var(--color-text-secondary)' }}>Referencia manual:</strong>
                <div style={{ color: 'var(--color-text-primary)', marginTop: '0.2rem' }}>{manual.pageRef}</div>
              </div>
            )}
            {manual.torqueSpecs && (
              <div>
                <strong style={{ color: 'var(--color-text-secondary)' }}>Pares de apriete / Datos:</strong>
                <div style={{ color: 'var(--color-text-primary)', marginTop: '0.2rem' }}>{manual.torqueSpecs}</div>
              </div>
            )}
            {manual.notes && (
              <div style={{ gridColumn: '1 / -1' }}>
                <strong style={{ color: 'var(--color-text-secondary)' }}>Notas:</strong>
                <div style={{ color: 'var(--color-text-primary)', marginTop: '0.2rem' }}>{manual.notes}</div>
              </div>
            )}
          </div>
        )}

        {/* Checklist interactivo */}
        {steps.length > 0 && (
          <div style={{ marginBottom: '1.25rem', padding: '1rem', borderRadius: '10px', border: '1px solid var(--color-card-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <strong style={{ color: 'var(--color-text-primary)' }}>
                Checklist de mantenimiento ({completedCount}/{steps.length} · {progress}%)
              </strong>
              {completedCount > 0 && (
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => onResetSteps(manual)}>
                  Reiniciar pasos
                </button>
              )}
            </div>

            <div style={{ height: '6px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)', marginBottom: '0.85rem', overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: 'var(--color-primary)', transition: 'width 0.2s' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {steps.map((step, idx) => (
                <label
                  key={step.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    background: step.done ? 'rgba(34, 197, 94, 0.08)' : 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--color-card-border)',
                    cursor: 'pointer',
                    textDecoration: step.done ? 'line-through' : 'none',
                    opacity: step.done ? 0.75 : 1,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={!!step.done}
                    onChange={() => onToggleStep(manual, step.id)}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
                  />
                  <span>
                    <strong style={{ marginRight: '0.35rem' }}>{idx + 1}.</strong>
                    {step.text}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Visor de PDF o Imagen */}
        {manual.fileData && (
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                Documento adjunto: <strong>{manual.fileName}</strong>
              </span>
              <a href={manual.fileData} download={manual.fileName || 'manual.pdf'} className="btn btn-secondary btn-sm">
                <DownloadIcon width={15} height={15} /> Descargar
              </a>
            </div>
            {isPdf ? (
              <iframe
                src={manual.fileData}
                title={manual.title}
                style={{ width: '100%', height: '480px', borderRadius: '8px', border: '1px solid var(--color-card-border)' }}
              />
            ) : isImage ? (
              <img
                src={manual.fileData}
                alt={manual.title}
                style={{ maxWidth: '100%', maxHeight: '480px', borderRadius: '8px', display: 'block', margin: '0 auto' }}
              />
            ) : null}
          </div>
        )}

        {registeredMsg && (
          <div style={{ padding: '0.65rem 0.9rem', borderRadius: '8px', background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', marginBottom: '1rem', fontSize: '0.875rem' }}>
            {registeredMsg}
          </div>
        )}

        {/* Pie */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-primary" onClick={handleRegister}>
            <CheckIcon width={16} height={16} /> Registrar mantenimiento realizado
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
