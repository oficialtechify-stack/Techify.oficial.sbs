import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Sparkles, 
  RotateCcw, 
  CheckCircle2, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import { 
  ServiceCatalogItem, 
  saveServiceCatalogItem, 
  deleteServiceCatalogItem, 
  resetServicesCatalogToDefault 
} from '../lib/servicesCatalog';
import { toast } from './Toast';

interface ServicesCatalogManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  catalog: ServiceCatalogItem[];
}

export default function ServicesCatalogManagerModal({
  isOpen,
  onClose,
  catalog
}: ServicesCatalogManagerModalProps) {
  const [editingItem, setEditingItem] = useState<ServiceCatalogItem | null>(null);
  const [isEditingModalOpen, setIsEditingModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Form Fields
  const [formId, setFormId] = useState('');
  const [formLabel, setFormLabel] = useState('');
  const [formBadge, setFormBadge] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formPopular, setFormPopular] = useState(false);

  if (!isOpen) return null;

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormId(`serv_${Date.now()}`);
    setFormLabel('');
    setFormBadge('Novo');
    setFormPrice('Sob Medida');
    setFormPopular(false);
    setIsEditingModalOpen(true);
  };

  const handleOpenEdit = (item: ServiceCatalogItem) => {
    setEditingItem(item);
    setFormId(item.id);
    setFormLabel(item.label);
    setFormBadge(item.badge || '');
    setFormPrice(item.price || '');
    setFormPopular(!!item.popular);
    setIsEditingModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formLabel.trim()) {
      toast.error('Título Obrigatório', 'Informe o nome/título do serviço ou pacote.');
      return;
    }

    setIsSaving(true);
    try {
      const itemToSave: ServiceCatalogItem = {
        id: formId || (editingItem ? editingItem.id : `serv_${Date.now()}`),
        label: formLabel.trim(),
        badge: formBadge.trim() || 'Destaque',
        price: formPrice.trim() || 'Sob Medida',
        popular: formPopular,
        order: editingItem?.order ?? catalog.length + 1
      };

      await saveServiceCatalogItem(itemToSave);
      toast.success('Opção Salva!', `"${itemToSave.label}" foi atualizado no catálogo.`);
      setIsEditingModalOpen(false);
    } catch (err) {
      console.error('Error saving service catalog item:', err);
      toast.error('Erro ao Salvar', 'Não foi possível salvar o serviço no banco de dados.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, label: string) => {
    setIsDeleting(true);
    try {
      await deleteServiceCatalogItem(id);
      toast.success('Opção Removida', `"${label}" foi excluído do catálogo.`);
      setDeletingId(null);
    } catch (err) {
      console.error('Error deleting service catalog item:', err);
      toast.error('Erro ao Excluir', 'Não foi possível excluir o item.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Deseja restaurar as opções padrões de serviços e pacotes?')) return;
    setIsResetting(true);
    try {
      await resetServicesCatalogToDefault();
      toast.success('Catálogo Restaurado', 'As opções padrões foram reinseridas com sucesso.');
    } catch (err) {
      console.error('Error resetting catalog:', err);
      toast.error('Erro ao Restaurar', 'Não foi possível restaurar o catálogo padrão.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        data-lenis-prevent
        className="relative w-full max-w-2xl rounded-3xl border border-neutral-800 bg-[#0a0d0a] p-5 sm:p-7 text-white shadow-2xl max-h-[90vh] flex flex-col"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#22c55e]/15 border border-[#22c55e]/30 text-[#22c55e]">
                <Edit3 className="h-4 w-4" />
              </span>
              <h3 className="font-display text-lg font-bold text-white">
                Gerenciar Opções do Formulário
              </h3>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Edite, adicione ou exclua qualquer opção de pacote e serviço que aparece no agendamento
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-black font-extrabold text-xs px-3.5 py-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(34,197,94,0.3)]"
            >
              <Plus className="h-3.5 w-3.5 stroke-[3]" />
              <span>Adicionar Opção</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* List of services */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3 custom-scrollbar pr-1">
          {catalog.map((item, idx) => (
            <div 
              key={item.id}
              className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-neutral-800/80 bg-neutral-950/80 p-3.5 hover:border-neutral-700 transition-all"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-[11px] font-mono text-neutral-500">#{idx + 1}</span>
                  <span className="font-bold text-white text-xs sm:text-sm truncate">
                    {item.label}
                  </span>
                  {item.popular && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-black text-amber-400">
                      <Sparkles className="h-2.5 w-2.5" /> Destaque
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-[11px] text-neutral-400">
                  <span className="inline-flex items-center gap-1 text-[#4ade80] font-semibold">
                    <CheckCircle2 className="h-3 w-3" /> {item.badge || 'Opção'}
                  </span>
                  <span>•</span>
                  <span className="text-neutral-300 font-medium">{item.price}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(item)}
                  className="flex items-center gap-1 rounded-lg bg-neutral-900 border border-neutral-700 hover:border-[#22c55e] px-2.5 py-1.5 text-xs font-semibold text-neutral-300 hover:text-white transition-colors cursor-pointer"
                  title="Editar opção"
                >
                  <Edit3 className="h-3.5 w-3.5 text-[#22c55e]" />
                  <span>Editar</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeletingId(item.id)}
                  className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-red-500/20 hover:border-red-500/40 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
                  title="Excluir opção"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}

          {catalog.length === 0 && (
            <div className="py-12 text-center text-neutral-500 text-xs">
              Nenhuma opção cadastrada. Clique em "Adicionar Opção" ou "Restaurar Padrões".
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-neutral-800 flex items-center justify-between shrink-0">
          <button
            type="button"
            disabled={isResetting}
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Restaurar Catálogo Padrão</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-bold text-xs px-5 py-2 transition-colors cursor-pointer"
          >
            Concluir
          </button>
        </div>

        {/* SUB-MODAL: EDIT / CREATE OPTION */}
        {isEditingModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-lg">
            <div className="w-full max-w-md rounded-3xl border border-neutral-700 bg-[#121612] p-5 sm:p-6 text-white shadow-2xl">
              
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
                <h4 className="font-display font-extrabold text-base text-white">
                  {editingItem ? 'Editar Opção de Serviço' : 'Nova Opção de Serviço'}
                </h4>
                <button
                  type="button"
                  onClick={() => setIsEditingModalOpen(false)}
                  className="p-1 text-neutral-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    Nome / Título da Opção *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Ex: ⭐ Pacote Full Growth 360°"
                    value={formLabel}
                    onChange={(e) => setFormLabel(e.target.value)}
                    className="w-full rounded-xl border border-neutral-700 bg-black/60 py-2.5 px-3 text-xs text-white placeholder-neutral-500 focus:border-[#22c55e] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1">
                      Preço ou Condição
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: De R$ 2.300 por R$ 580"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      className="w-full rounded-xl border border-neutral-700 bg-black/60 py-2.5 px-3 text-xs text-white placeholder-neutral-500 focus:border-[#22c55e] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1">
                      Badge / Selo
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Mais Escolhido • 75% OFF"
                      value={formBadge}
                      onChange={(e) => setFormBadge(e.target.value)}
                      className="w-full rounded-xl border border-neutral-700 bg-black/60 py-2.5 px-3 text-xs text-white placeholder-neutral-500 focus:border-[#22c55e] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="popular-check"
                    checked={formPopular}
                    onChange={(e) => setFormPopular(e.target.checked)}
                    className="h-4 w-4 rounded accent-[#22c55e] cursor-pointer"
                  />
                  <label htmlFor="popular-check" className="text-xs text-neutral-300 font-medium cursor-pointer">
                    Marcar como pacote popular / mais recomendado
                  </label>
                </div>

                <div className="pt-3 border-t border-neutral-800 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingModalOpen(false)}
                    className="flex-1 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-2 text-xs transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-black font-extrabold py-2 text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Salvando...</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                        <span>Salvar Opção</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

        {/* DELETE CONFIRMATION MODAL */}
        {deletingId && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl border border-red-500/30 bg-[#141212] p-5 text-white shadow-2xl">
              <div className="flex items-center gap-2.5 text-red-400 mb-3">
                <AlertCircle className="h-5 w-5" />
                <h4 className="font-bold text-sm">Excluir Opção?</h4>
              </div>
              <p className="text-xs text-neutral-300 mb-4 leading-relaxed">
                Tem certeza que deseja remover esta opção do formulário? Ela não aparecerá mais no dropdown de agendamento.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setDeletingId(null)}
                  className="flex-1 rounded-xl bg-neutral-800 hover:bg-neutral-700 py-2 text-xs font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => {
                    const item = catalog.find(c => c.id === deletingId);
                    if (item) handleDelete(item.id, item.label);
                  }}
                  className="flex-1 rounded-xl bg-red-600 hover:bg-red-500 py-2 text-xs font-extrabold text-white transition-colors flex items-center justify-center gap-1.5"
                >
                  {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  <span>Excluir</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
