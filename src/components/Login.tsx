import { useState } from 'react';
import { Building2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { authenticateUser } from '../services/database';
import RegisterDialog from './RegisterDialog';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showRegister, setShowRegister] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Call stored procedure to authenticate user using email and password
      const user = await authenticateUser({ email, password });
      
      // Store user info in sessionStorage (you can use localStorage or a context instead)
      sessionStorage.setItem('user', JSON.stringify(user));
      sessionStorage.setItem('isAuthenticated', 'true');
      
      // Navigate to dashboard after successful login
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] px-4">
      <div className="w-full max-w-md">
        <div className="bg-[var(--color-card)] rounded-lg shadow-lg border border-[var(--color-border)] p-8">
          {/* Logo Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-[var(--color-primary-blue)] rounded-lg flex items-center justify-center mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-[var(--color-text-primary)] text-center">
              ViajesUCAB
            </h1>
            <p className="text-[var(--color-text-secondary)] text-center mt-2">
              Inicia sesión en tu cuenta
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label 
                htmlFor="email" 
                className="block text-[var(--color-text-primary)] mb-2"
              >
                Correo Electrónico
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] focus:border-transparent transition-all"
                placeholder="Ingresa tu correo electrónico"
                required
              />
            </div>

            <div>
              <label 
                htmlFor="password" 
                className="block text-[var(--color-text-primary)] mb-2"
              >
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] focus:border-transparent transition-all"
                placeholder="Ingresa tu contraseña"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--color-primary-blue)] hover:bg-[var(--color-primary-blue-hover)] text-white py-2.5 rounded-md transition-colors duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Additional Security Text */}
          <div className="mt-6 text-center">
            <p className="text-[var(--color-text-secondary)] text-xs">
              Inicio de sesión seguro protegido con encriptación estándar de la industria
            </p>
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setShowRegister(true)}
                className="text-[var(--color-primary-blue)] hover:underline text-sm"
              >
                ¿No tienes cuenta? Registrarse
              </button>
            </div>
          </div>
        
        {showRegister && <RegisterDialog open={showRegister} onClose={() => setShowRegister(false)} />}
        </div>
      </div>
    </div>
  );
}