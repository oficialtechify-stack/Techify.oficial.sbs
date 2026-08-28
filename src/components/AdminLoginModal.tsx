import React, { useState } from 'react';
import { X, ShieldCheck, KeyRound } from 'lucide-react';
import { useAdminAuth } from '../lib/adminAuth';
import { toast } from './Toast';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AdminLoginModal({ isOpen, onClose, onSuccess }: AdminLoginModalProps) {
  const { login } = useAdminAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Por favor, insira a senha.');
      toast.warning('Atenção', 'Por favor, digite sua chave de acesso.');
      return;
    }

    setLoading(true);
    try {
      const success = await login(password);
      if (success) {
        setPassword('');
        setError('');
        toast.success('Acesso Autorizado', 'Bem-vindo! Painel administrativo e modo de edição ativos.');
        onClose();
        if (onSuccess) onSuccess();
      } else {
        setError('Senha incorreta. Tente novamente.');
        toast.error('Chave Incorreta', 'Credencial de administrador não autorizada.');
      }
    } catch {
      setError('Erro ao validar credencial.');
      toast.error('Falha na Validação', 'Ocorreu um erro ao verificar sua chave de acesso.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm rounded-2xl border border-neutral-800 bg-[#121312] p-6 text-white shadow-2xl text-center">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#a3e635]/10 text-[#a3e635] border border-[#a3e635]/30">
          <KeyRound className="h-6 w-6" />
        </div>

        <h3 className="text-lg font-bold text-white font-display">Acesso de Administrador</h3>
        <p className="text-xs text-neutral-400 mt-1 mb-5">
          Painel de controle Techify. Insira sua chave de acesso.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <input
              type="password"
              placeholder="Chave de acesso..."
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
              autoFocus
              className="w-full rounded-xl border border-neutral-800 bg-[#0a0a0a] py-3 px-4 text-sm text-white text-center focus:border-[#a3e635] focus:outline-none placeholder-neutral-600 font-mono tracking-wider"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 font-medium">{error}</p>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-neutral-800 py-2.5 text-xs font-semibold text-neutral-400 hover:bg-neutral-900 cursor-pointer transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-[#a3e635] hover:bg-[#84cc16] text-black font-extrabold py-2.5 text-xs cursor-pointer shadow-[0_0_15px_rgba(163,230,53,0.2)] transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>{loading ? 'Verificando...' : 'Entrar'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
