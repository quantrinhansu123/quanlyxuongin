import React, { useState } from 'react';
import { useDesignItems, useDesignOrders } from '../hooks/useFirebaseData';
import { DesignItem } from '../types';
import { Plus, Link as LinkIcon, Image as ImageIcon, History, Check } from 'lucide-react';

const DesignLibrary: React.FC = () => {
  const { designItems: designs, addDesignItem, updateDesignItem } = useDesignItems();
  const { designOrders } = useDesignOrders();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDesign, setNewDesign] = useState<Partial<DesignItem>>({});

  // Usage & History State
  const [usageModal, setUsageModal] = useState<{ isOpen: boolean, design: any }>({ isOpen: false, design: null });
  const [historyModal, setHistoryModal] = useState<{ isOpen: boolean, design: any }>({ isOpen: false, design: null });
  const [selectedOrderId, setSelectedOrderId] = useState('');

  const handleAddDesign = async () => {
    if (newDesign.title && newDesign.imageUrl) {
      await addDesignItem({
        ...newDesign,
        id: `D${Date.now()}`,
        category: newDesign.category || 'Khác',
        description: newDesign.description || '',
        usageHistory: []
      } as DesignItem);
      setIsModalOpen(false);
      setNewDesign({});
      alert('Đã thêm mẫu thiết kế!');
    }
  };

  const handleUseDesign = (design: any) => {
    setUsageModal({ isOpen: true, design });
    setSelectedOrderId('');
  };

  const handleConfirmUse = async () => {
    if (!selectedOrderId) return alert("Vui lòng chọn đơn hàng!");

    const order = designOrders.find(o => o.id === selectedOrderId);
    if (!order) return;

    const historyItem = {
      orderId: order.id,
      customerName: order.customerName,
      usedAt: new Date().toISOString()
    };

    const updatedDesign = {
      ...usageModal.design,
      usageHistory: [historyItem, ...(usageModal.design.usageHistory || [])]
    };

    await updateDesignItem(updatedDesign);
    alert(`Đã áp dụng mẫu vào đơn hàng ${order.id}`);
    setUsageModal({ isOpen: false, design: null });
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="p-6 h-screen overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Kho Mẫu Thiết Kế</h2>
          <p className="text-slate-500 text-sm">Landing page và các ấn phẩm marketing</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 shadow-sm transition-colors"
        >
          <Plus size={18} /> Thêm Mẫu Mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
        {designs.map((design: any) => ( // Using any to support usageHistory
          <div key={design.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden group hover:shadow-md transition-shadow">
            <div className="aspect-video bg-slate-100 relative overflow-hidden">
              <img
                src={design.imageUrl}
                alt={design.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 bg-slate-200"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => setHistoryModal({ isOpen: true, design })}
                  className="bg-white text-slate-900 px-3 py-1.5 rounded text-xs font-bold hover:bg-slate-100 flex items-center gap-1"
                >
                  <History size={14} /> Lịch sử ({design.usageHistory?.length || 0})
                </button>
                <button
                  onClick={() => handleUseDesign(design)}
                  className="bg-accent text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-blue-600 flex items-center gap-1"
                >
                  <Check size={14} /> Dùng mẫu này
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-slate-800 truncate pr-2" title={design.title}>{design.title}</h3>
                <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded whitespace-nowrap">{design.category}</span>
              </div>
              <p className="text-sm text-slate-500 line-clamp-2 min-h-[40px]">{design.description}</p>

              {/* Mini stats */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-400">
                <History size={12} />
                <span>Đã dùng: {design.usageHistory?.length || 0} lần</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-[500px] shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold mb-4">Thêm mẫu thiết kế</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tiêu đề</label>
                <input
                  className="w-full border p-2 rounded"
                  value={newDesign.title || ''}
                  onChange={e => setNewDesign({ ...newDesign, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Link Ảnh (URL)</label>
                <div className="flex gap-2">
                  <input
                    className="w-full border p-2 rounded"
                    placeholder="https://..."
                    value={newDesign.imageUrl || ''}
                    onChange={e => setNewDesign({ ...newDesign, imageUrl: e.target.value })}
                  />
                  <button className="p-2 bg-slate-100 rounded text-slate-600"><ImageIcon size={20} /></button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Danh mục</label>
                <select
                  className="w-full border p-2 rounded"
                  onChange={e => setNewDesign({ ...newDesign, category: e.target.value })}
                >
                  <option value="">Chọn danh mục</option>
                  <option value="Mỹ phẩm">Mỹ phẩm</option>
                  <option value="Nội thất">Nội thất</option>
                  <option value="Gia dụng">Gia dụng</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mô tả</label>
                <textarea
                  className="w-full border p-2 rounded h-20"
                  value={newDesign.description || ''}
                  onChange={e => setNewDesign({ ...newDesign, description: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 hover:bg-slate-100 rounded">Hủy</button>
              <button onClick={handleAddDesign} className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700">Lưu mẫu</button>
            </div>
          </div>
        </div>
      )}

      {/* Usage Modal - Select Order */}
      {usageModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-[400px] shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold mb-4">Chọn đơn hàng áp dụng</h3>
            <p className="text-sm text-slate-500 mb-4">Mẫu: <span className="font-semibold">{usageModal.design?.title}</span></p>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Đơn hàng / Yêu cầu thiết kế</label>
              <select
                className="w-full border p-2.5 rounded-lg outline-none focus:border-accent"
                value={selectedOrderId}
                onChange={(e) => setSelectedOrderId(e.target.value)}
              >
                <option value="">-- Chọn đơn hàng --</option>
                {designOrders.map(order => (
                  <option key={order.id} value={order.id}>
                    {order.id} - {order.customerName} ({order.productType})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setUsageModal({ isOpen: false, design: null })} className="px-4 py-2 hover:bg-slate-100 rounded">Hủy bỏ</button>
              <button onClick={handleConfirmUse} className="px-4 py-2 bg-accent text-white rounded hover:bg-blue-600">Xác nhận dùng</button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {historyModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-[500px] shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold mb-4">Lịch sử sử dụng mẫu</h3>
            <div className="bg-slate-50 rounded-lg p-3 mb-4 flex gap-3">
              <img src={historyModal.design?.imageUrl} className="w-16 h-12 object-cover rounded bg-white border" />
              <div>
                <p className="font-bold text-sm text-slate-800">{historyModal.design?.title}</p>
                <p className="text-xs text-slate-500">{historyModal.design?.category}</p>
              </div>
            </div>

            <div className="max-h-[300px] overflow-y-auto border-t border-slate-100">
              <table className="w-full text-left text-sm">
                <thead className="text-xs text-slate-400 uppercase bg-slate-50 sticky top-0">
                  <tr>
                    <th className="p-3">Mã Đơn</th>
                    <th className="p-3">Khách hàng</th>
                    <th className="p-3 text-right">Thời gian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {historyModal.design?.usageHistory?.length > 0 ? (
                    historyModal.design.usageHistory.map((h: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-3 font-mono text-slate-600">{h.orderId}</td>
                        <td className="p-3 font-medium">{h.customerName}</td>
                        <td className="p-3 text-right text-slate-500">{formatDate(h.usedAt)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="p-6 text-center text-slate-400">Chưa có lịch sử sử dụng</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
              <button onClick={() => setHistoryModal({ isOpen: false, design: null })} className="px-4 py-2 bg-slate-100 text-slate-600 rounded hover:bg-slate-200 font-medium">Đóng</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DesignLibrary;