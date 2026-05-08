import { createSignal, onMount, onCleanup } from 'solid-js';
import pb from '../lib/pocketbase';

export default function Header(props) {
  const tabs = [
    { id: 'map', label: 'Case Map', icon: mapIcon },
    { id: 'history', label: 'Case History', icon: listIcon },
    { id: 'model', label: 'SIR+ Model', icon: chartIcon },
  ];

  const [isLoggedIn, setIsLoggedIn] = createSignal(pb.authStore.isValid);
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [showLogin, setShowLogin] = createSignal(false);
  const [loginError, setLoginError] = createSignal('');

  onMount(() => {
    const unsub = pb.authStore.onChange(() => {
      setIsLoggedIn(pb.authStore.isValid);
    });
    onCleanup(() => {
      if (typeof unsub === 'function') unsub();
    });
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      // Try superuser first, then regular user
      try {
        await pb.collection('_superusers').authWithPassword(email(), password());
      } catch (err) {
        await pb.collection('users').authWithPassword(email(), password());
      }
      setShowLogin(false);
      setEmail('');
      setPassword('');
    } catch (err) {
      setLoginError('Credenciales incorrectas');
    }
  };

  const handleLogout = () => {
    pb.authStore.clear();
  };

  const handleRegister = () => {
    alert('Please contact me at @iagovar (X/Twitter) for requesting an account.');
  };

  return (
    <header class="bg-white border-b border-surface-200 sticky top-0 z-50 shadow-sm relative">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          {/* Logo / Title */}
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-sm">
              <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 class="text-lg font-bold text-surface-900 leading-tight">
                Hantavirus 2026
              </h1>
              <p class="text-xs text-surface-400 -mt-0.5 hidden sm:block">
                Global Case Tracker
              </p>
            </div>
          </div>

          <div class="flex items-center gap-4">
            {/* Tab navigation */}
            <nav class="flex gap-1 bg-surface-100 rounded-xl p-1" id="main-nav">
              {tabs.map((tab) => (
                <button
                  id={`tab-${tab.id}`}
                  onClick={() => props.setActiveTab(tab.id)}
                  class={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${props.activeTab() === tab.id
                    ? 'bg-white text-brand-600 shadow-sm'
                    : 'text-surface-500 hover:text-surface-700 hover:bg-surface-50'
                    }`}
                >
                  <span class="w-4 h-4" innerHTML={tab.icon} />
                  <span class="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </nav>

            {/* Auth Buttons */}
            <div class="flex items-center gap-2 border-l border-surface-200 pl-4">
              {isLoggedIn() ? (
                <button
                  onClick={handleLogout}
                  class="px-3 py-1.5 text-sm font-medium text-danger-600 hover:bg-danger-50 rounded-lg transition-colors cursor-pointer"
                >
                  Logout
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setShowLogin(!showLogin())}
                    class="px-3 py-1.5 text-sm font-medium text-surface-700 hover:bg-surface-100 rounded-lg transition-colors cursor-pointer"
                  >
                    Login
                  </button>
                  <button
                    onClick={handleRegister}
                    class="hidden sm:block px-3 py-1.5 text-sm font-medium text-brand-600 hover:bg-brand-50 rounded-lg transition-colors cursor-pointer"
                  >
                    Register
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Login Dropdown Form */}
      {showLogin() && !isLoggedIn() && (
        <div class="absolute right-4 top-14 mt-2 w-72 bg-white border border-surface-200 rounded-xl shadow-lg p-4 z-50">
          <form onSubmit={handleLogin} class="space-y-3">
            <h3 class="text-sm font-semibold text-surface-800 mb-2">Acceso a la plataforma</h3>
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email()}
                onInput={(e) => setEmail(e.target.value)}
                class="w-full px-3 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400"
                required
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Contraseña"
                value={password()}
                onInput={(e) => setPassword(e.target.value)}
                class="w-full px-3 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400"
                required
              />
            </div>
            {loginError() && <p class="text-xs text-danger-600">{loginError()}</p>}
            <button
              type="submit"
              class="w-full py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >
              Iniciar sesión
            </button>
            <div class="text-center pt-2 border-t border-surface-100 mt-2">
              <button type="button" onClick={handleRegister} class="text-xs text-surface-500 hover:text-brand-600 cursor-pointer">
                ¿No tienes cuenta? Regístrate
              </button>
            </div>
          </form>
        </div>
      )}
    </header>
  );
}

/* ─── Inline SVG icons ───────────────────────────────── */
const mapIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>`;

const chartIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`;

const listIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`;
