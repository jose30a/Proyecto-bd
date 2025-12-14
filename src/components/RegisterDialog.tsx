import React, { useState } from 'react';
import { X } from 'lucide-react';
import { registerUser, emailExists } from '../services/database';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function RegisterDialog({ open, onClose }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [primerNombre, setPrimerNombre] = useState('');
  const [segundoNombre, setSegundoNombre] = useState('');
  const [primerApellido, setPrimerApellido] = useState('');
  const [segundoApellido, setSegundoApellido] = useState('');
  const [ci, setCi] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState('V');
  const [nPasaporte, setNPasaporte] = useState('');
  const [visa, setVisa] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Basic validation
    if (!email || !password || !primerNombre || !primerApellido || !ci || !tipoDocumento) {
      setError('Por favor completa todos los campos obligatorios.');
      return;
    }

    setLoading(true);
    try {
      const exists = await emailExists(email);
      if (exists) {
        setError('El correo ya está registrado.');
        setLoading(false);
        return;
      }

      await registerUser({
        email,
        password,
        primer_nombre: primerNombre,
        segundo_nombre: segundoNombre || undefined,
        primer_apellido: primerApellido,
        segundo_apellido: segundoApellido || undefined,
        ci,
        tipo_documento: tipoDocumento,
        n_pasaporte: nPasaporte || '',
        visa,
        // fk_cod_rol omitted to use default Cliente role (2)
      } as any);

      setSuccess('Registro exitoso. Ya puedes iniciar sesión.');
      // Clear inputs after successful registration
      setEmail('');
      setPassword('');
      setPrimerNombre('');
      setSegundoNombre('');
      setPrimerApellido('');
      setSegundoApellido('');
      setCi('');
      setTipoDocumento('V');
      setNPasaporte('');
    } catch (err: any) {
      console.error('Register error:', err);
      setError(err?.message || 'Error al registrar usuario.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-[var(--color-card)] rounded-lg shadow-lg border border-[var(--color-border)] p-6 mx-4">
        <button className="absolute top-3 right-3" onClick={onClose} aria-label="Cerrar">
          <X className="w-5 h-5 text-[var(--color-text-primary)]" />
        </button>

        <h2 className="text-lg text-[var(--color-text-primary)] mb-2">Crear cuenta</h2>
        <p className="text-sm text-[var(--color-text-secondary)] mb-4">Regístrate como cliente</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[var(--color-text-primary)] mb-1">Correo electrónico *</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md" />
          </div>

          <div>
            <label className="block text-[var(--color-text-primary)] mb-1">Contraseña *</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-3 py-2 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[var(--color-text-primary)] mb-1">Primer nombre *</label>
              <input value={primerNombre} onChange={(e) => setPrimerNombre(e.target.value)} required className="w-full px-3 py-2 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md" />
            </div>

            <div>
              <label className="block text-[var(--color-text-primary)] mb-1">Segundo nombre</label>
              <input value={segundoNombre} onChange={(e) => setSegundoNombre(e.target.value)} className="w-full px-3 py-2 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[var(--color-text-primary)] mb-1">Primer apellido *</label>
              <input value={primerApellido} onChange={(e) => setPrimerApellido(e.target.value)} required className="w-full px-3 py-2 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md" />
            </div>

            <div>
              <label className="block text-[var(--color-text-primary)] mb-1">Segundo apellido</label>
              <input value={segundoApellido} onChange={(e) => setSegundoApellido(e.target.value)} className="w-full px-3 py-2 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[var(--color-text-primary)] mb-1">Cédula / CI *</label>
              <input value={ci} onChange={(e) => setCi(e.target.value)} required className="w-full px-3 py-2 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md" />
            </div>

            <div>
              <label className="block text-[var(--color-text-primary)] mb-1">Tipo documento *</label>
              <select value={tipoDocumento} onChange={(e) => setTipoDocumento(e.target.value)} className="w-full px-3 py-2 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md">
                <option value="V">V</option>
                <option value="E">E</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[var(--color-text-primary)] mb-1">Número de pasaporte</label>
            <input value={nPasaporte} onChange={(e) => setNPasaporte(e.target.value)} className="w-full px-3 py-2 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md" />
          </div>

          <div className="flex items-center gap-3">
            <input id="visa" type="checkbox" checked={visa} onChange={(e) => setVisa(e.target.checked)} className="w-4 h-4" />
            <label htmlFor="visa" className="text-[var(--color-text-primary)] text-sm">Posee visa</label>
          </div>



          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">{error}</div>}
          {success && <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded text-sm">{success}</div>}

          <div className="flex items-center gap-3 mt-1">
            <button type="submit" disabled={loading} className="bg-[var(--color-primary-blue)] text-white px-4 py-2 rounded-md shadow-sm disabled:opacity-50">
              {loading ? 'Registrando...' : 'Registrarme'}
            </button>
            <button type="button" onClick={onClose} className="text-sm text-[var(--color-text-secondary)]">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterDialog;
