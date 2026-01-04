import React, { useState } from 'react';
import { useDesignItems, useDesignOrders } from '../hooks/useFirebaseData';
import { DesignItem, DesignOrder } from '../types';
import {
  Plus,
  Image as ImageIcon,
  History,
  Check,
  Upload,
  Paperclip,
  Eye,
  Pencil,
  Trash2,
  FileUp
} from 'lucide-react';

const DesignLibrary: React.FC = () => {
  const { designItems: designs, addDesignItem, updateDesignItem, deleteDesignItem } = useDesignItems();
  const { designOrders } = useDesignOrders();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDesign, setNewDesign] = useState<Partial<DesignItem>>({});
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [attachmentList, setAttachmentList] = useState<{ name: string; url: string; fileType?: string }[]>([]);
  const [newOriginalFile, setNewOriginalFile] = useState<{ name: string; url: string; fileType?: string } | null>(null);

  // Usage & History State
  const [usageModal, setUsageModal] = useState<{ isOpen: boolean, design: any }>({ isOpen: false, design: null });
  const [historyModal, setHistoryModal] = useState<{ isOpen: boolean, design: any }>({ isOpen: false, design: null });
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<DesignOrder | null>(null);
  const [manualHistory, setManualHistory] = useState({ orderId: '', customerName: '' });

  // View / Edit State
  const [viewModal, setViewModal] = useState<{ isOpen: boolean, design: any }>({ isOpen: false, design: null });
  const [activeViewImage, setActiveViewImage] = useState<string>('');
  const [editModal, setEditModal] = useState<{ isOpen: boolean, design: any }>({ isOpen: false, design: null });
  const [editForm, setEditForm] = useState<Partial<DesignItem>>({});
  const [editGallery, setEditGallery] = useState<string[]>([]);
  const [editAttachments, setEditAttachments] = useState<{ name: string; url: string; fileType?: string }[]>([]);
  const [editOriginalFile, setEditOriginalFile] = useState<{ name: string; url: string; fileType?: string } | null>(null);

  const readFilesAsDataUrls = (files: File[], limit = 3): Promise<string[]> => {
    const sliced = Array.from(files).slice(0, limit);
    return Promise.all(
      sliced.map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
          })
      )
    );
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const urls = await readFilesAsDataUrls(e.target.files, 6);
    const combined = [...galleryPreviews, ...urls].slice(0, 6);
    setGalleryPreviews(combined);
    if (!newDesign.imageUrl && combined[0]) {
      setNewDesign((prev) => ({ ...prev, imageUrl: combined[0] }));
    }
    e.target.value = '';
  };

  const handleAttachmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files).slice(0, 6);
    const urls = await readFilesAsDataUrls(e.target.files, 6);
    const next = files.map((file, idx) => ({
      name: file.name,
      url: urls[idx],
      fileType: file.type,
    }));
    const combined = [...attachmentList, ...next].slice(0, 6);
    setAttachmentList(combined);
    e.target.value = '';
  };

  const handleOriginalUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    const [url] = await readFilesAsDataUrls([file], 1);
    setNewOriginalFile({ name: file.name, url, fileType: file.type });
    e.target.value = '';
  };

  const handleAddDesign = async () => {
    const mainImage = newDesign.imageUrl || galleryPreviews[0];
    if (newDesign.title && mainImage) {
      await addDesignItem({
        ...newDesign,
        imageUrl: mainImage,
        gallery: galleryPreviews,
        attachments: attachmentList,
        originalFile: newOriginalFile || undefined,
        id: `D${Date.now()}`,
        category: newDesign.category || 'Khác',
        description: newDesign.description || '',
        usageHistory: []
      } as DesignItem);
      setIsModalOpen(false);
      setNewDesign({});
      setGalleryPreviews([]);
      setAttachmentList([]);
      setNewOriginalFile(null);
      alert('Đã thêm mẫu thiết kế!');
    }
  };

  const handleUseDesign = (design: any) => {
    setUsageModal({ isOpen: true, design });
    setSelectedOrderId('');
    setOrderSearch('');
    setSelectedOrder(null);
  };

  const handleConfirmUse = async () => {
    const order = selectedOrder || designOrders.find(o => o.id === selectedOrderId);
    if (!order) return alert("Vui lòng chọn đơn hàng!");

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

  const handleAddManualHistory = async () => {
    if (!manualHistory.orderId || !manualHistory.customerName || !historyModal.design) {
      return alert('Nhập mã đơn và khách hàng');
    }

    const newEntry = {
      orderId: manualHistory.orderId,
      customerName: manualHistory.customerName,
      usedAt: new Date().toISOString()
    };

    const updatedDesign = {
      ...historyModal.design,
      usageHistory: [newEntry, ...(historyModal.design.usageHistory || [])]
    };

    await updateDesignItem(updatedDesign);
    setHistoryModal({ isOpen: true, design: updatedDesign });
    setManualHistory({ orderId: '', customerName: '' });
    alert('Đã thêm lịch sử đơn hàng');
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const openView = (design: DesignItem) => {
    const firstImage = design.gallery?.[0] || design.imageUrl;
    setViewModal({ isOpen: true, design });
    setActiveViewImage(firstImage || '');
  };

  const openEdit = (design: DesignItem) => {
    setEditModal({ isOpen: true, design });
    setEditForm({ ...design });
    setEditGallery(design.gallery?.length ? design.gallery : [design.imageUrl].filter(Boolean));
    setEditAttachments(design.attachments || []);
    setEditOriginalFile(design.originalFile || null);
  };

  const handleEditGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const urls = await readFilesAsDataUrls(e.target.files, 6);
    const combined = [...editGallery, ...urls].slice(0, 6);
    setEditGallery(combined);
    if (!editForm.imageUrl && combined[0]) {
      setEditForm(prev => ({ ...prev, imageUrl: combined[0] }));
    }
    e.target.value = '';
  };

  const handleEditAttachmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files).slice(0, 6);
    const urls = await readFilesAsDataUrls(e.target.files, 6);
    const incoming = files.map((file, idx) => ({ name: file.name, url: urls[idx], fileType: file.type }));
    const combined = [...editAttachments, ...incoming].slice(0, 6);
    setEditAttachments(combined);
    e.target.value = '';
  };

  const handleEditOriginalUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    const [url] = await readFilesAsDataUrls([file], 1);
    setEditOriginalFile({ name: file.name, url, fileType: file.type });
    e.target.value = '';
  };

  const handleSaveEdit = async () => {
    if (!editModal.design) return;
    const mainImage = editForm.imageUrl || editGallery[0] || editModal.design.imageUrl;
    if (!editForm.title || !mainImage) return alert('Nhập tiêu đề và ảnh chính');

    const updated: DesignItem = {
      ...(editModal.design as DesignItem),
      ...editForm,
      imageUrl: mainImage,
      gallery: editGallery,
      attachments: editAttachments,
      originalFile: editOriginalFile || undefined,
    };

    await updateDesignItem(updated);
    setEditModal({ isOpen: false, design: null });
    setEditGallery([]);
    setEditAttachments([]);
    setEditOriginalFile(null);
    alert('Đã lưu chỉnh sửa');
  };

  const handleDelete = async (design: DesignItem) => {
    const ok = window.confirm(`Xoá mẫu "${design.title}"?`);
    if (!ok) return;
    await deleteDesignItem(design.id);
    alert('Đã xoá mẫu');
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
          <div key={design.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group hover:shadow-md transition-shadow">
            {(() => {
              const mainImage = design.gallery?.[0] || design.imageUrl;
              const secondary = design.gallery?.slice(1, 3) || [];
              return (
                <div className="aspect-video bg-slate-100 relative overflow-hidden grid grid-cols-3 gap-1">
                  <div className="col-span-2 relative">
                    <img
                      src={mainImage}
                      alt={design.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 bg-slate-200"
                    />
                  </div>
                  <div className="grid grid-rows-2 gap-1">
                    {[0, 1].map((idx) => (
                      <div key={idx} className="relative">
                        {secondary[idx] ? (
                          <img
                            src={secondary[idx]}
                            alt={`${design.title} ${idx + 2}`}
                            className="w-full h-full object-cover bg-slate-200"
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-200" />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => openView(design)}
                      className="bg-white text-slate-900 px-3 py-1.5 rounded text-xs font-bold hover:bg-slate-100 flex items-center gap-1"
                    >
                      <Eye size={14} /> Xem
                    </button>
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
              );
            })()}
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

              {design.attachments?.length ? (
                <div className="mt-3 space-y-1">
                  <div className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                    <Paperclip size={12} /> File đính kèm
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {design.attachments.map((file: any, idx: number) => (
                      <a
                        key={idx}
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-1 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                      >
                        {file.name}
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => openView(design)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 text-sm font-semibold"
                >
                  <Eye size={16} /> Xem
                </button>
                <button
                  onClick={() => openEdit(design)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 text-sm font-semibold"
                >
                  <Pencil size={16} /> Sửa
                </button>
                <button
                  onClick={() => handleDelete(design)}
                  className="flex items-center justify-center px-3 py-2 border border-red-200 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 text-sm font-semibold"
                >
                  <Trash2 size={16} />
                </button>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tải 2-3 ảnh (jpg/png)</label>
                  <label className="flex items-center gap-2 px-3 py-2 border rounded cursor-pointer bg-slate-50 hover:bg-slate-100 text-sm text-slate-700">
                    <Upload size={16} /> Chọn ảnh
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUpload} />
                  </label>
                  {galleryPreviews.length > 0 && (
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {galleryPreviews.map((url, idx) => (
                        <img key={idx} src={url} className="w-full h-16 object-cover rounded bg-slate-100" />
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tải file đính kèm (PDF/AI/ZIP)</label>
                  <label className="flex items-center gap-2 px-3 py-2 border rounded cursor-pointer bg-slate-50 hover:bg-slate-100 text-sm text-slate-700">
                    <Paperclip size={16} /> Chọn file
                    <input type="file" multiple className="hidden" onChange={handleAttachmentUpload} />
                  </label>
                  {attachmentList.length > 0 && (
                    <div className="mt-2 space-y-1 text-xs text-slate-700">
                      {attachmentList.map((f, idx) => (
                        <div key={idx} className="px-2 py-1 rounded bg-slate-100 border border-slate-200 truncate">{f.name}</div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">File gốc (AI/PSD/...)</label>
                  <label className="flex items-center gap-2 px-3 py-2 border rounded cursor-pointer bg-slate-50 hover:bg-slate-100 text-sm text-slate-700">
                    <FileUp size={16} /> Chọn file
                    <input type="file" className="hidden" onChange={handleOriginalUpload} />
                  </label>
                  {newOriginalFile ? (
                    <div className="mt-2 text-xs text-slate-700 px-2 py-1 rounded bg-slate-100 border border-slate-200 truncate">{newOriginalFile.name}</div>
                  ) : null}
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
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setNewDesign({});
                  setGalleryPreviews([]);
                  setAttachmentList([]);
                  setNewOriginalFile(null);
                }}
                className="px-4 py-2 hover:bg-slate-100 rounded"
              >
                Hủy
              </button>
              <button onClick={handleAddDesign} className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700">Lưu mẫu</button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 z-[65] flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-[900px] max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-800">{viewModal.design?.title}</h3>
                <p className="text-sm text-slate-500">{viewModal.design?.category}</p>
              </div>
              <button onClick={() => setViewModal({ isOpen: false, design: null })} className="px-3 py-1.5 bg-slate-100 rounded-lg text-slate-600 hover:bg-slate-200">Đóng</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              <div className="lg:col-span-2 space-y-3">
                <div className="aspect-video bg-slate-100 rounded-xl overflow-hidden border">
                  {activeViewImage ? (
                    <img src={activeViewImage} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">Chưa có ảnh</div>
                  )}
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {[viewModal.design?.imageUrl, ...(viewModal.design?.gallery || [])]
                    .filter(Boolean)
                    .map((img: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => setActiveViewImage(img)}
                        className={`h-20 w-32 flex-shrink-0 rounded border ${activeViewImage === img ? 'border-accent ring-2 ring-accent/40' : 'border-slate-200'}`}
                      >
                        <img src={img} className="w-full h-full object-cover rounded" />
                      </button>
                    ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-sm text-slate-600">{viewModal.design?.description}</p>
                </div>

                {viewModal.design?.originalFile ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
                    <div className="flex items-center gap-2 font-semibold mb-1"><FileUp size={16} /> File gốc</div>
                    <a href={viewModal.design.originalFile.url} target="_blank" rel="noreferrer" className="text-amber-900 underline">
                      {viewModal.design.originalFile.name}
                    </a>
                  </div>
                ) : null}

                {viewModal.design?.attachments?.length ? (
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm">
                    <div className="font-semibold flex items-center gap-2 mb-2"><Paperclip size={14} /> File đính kèm</div>
                    <div className="flex flex-wrap gap-2">
                      {viewModal.design.attachments.map((f: any, idx: number) => (
                        <a key={idx} href={f.url} target="_blank" rel="noreferrer" className="px-3 py-1 rounded-full bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs">
                          {f.name}
                        </a>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-slate-800 flex items-center gap-2 text-sm"><History size={16} /> Lịch sử sử dụng</h4>
                <span className="text-xs text-slate-500">{viewModal.design?.usageHistory?.length || 0} lần</span>
              </div>
              <div className="max-h-[260px] overflow-y-auto border rounded-lg">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs text-slate-400 uppercase bg-slate-50 sticky top-0">
                    <tr>
                      <th className="p-3">Mã Đơn</th>
                      <th className="p-3">Khách hàng</th>
                      <th className="p-3 text-right">Thời gian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {viewModal.design?.usageHistory?.length ? (
                      viewModal.design.usageHistory.map((h: any, idx: number) => (
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
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 z-[65] flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-[600px] max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Sửa mẫu thiết kế</h3>
              <button
                onClick={() => {
                  setEditModal({ isOpen: false, design: null });
                  setEditGallery([]);
                  setEditAttachments([]);
                  setEditOriginalFile(null);
                }}
                className="px-3 py-1.5 bg-slate-100 rounded-lg text-slate-600 hover:bg-slate-200"
              >
                Đóng
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tiêu đề</label>
                <input
                  className="w-full border p-2 rounded"
                  value={editForm.title || ''}
                  onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Link Ảnh (URL)</label>
                <input
                  className="w-full border p-2 rounded"
                  value={editForm.imageUrl || ''}
                  onChange={e => setEditForm({ ...editForm, imageUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Cập nhật Ảnh</label>
                  <label className="flex items-center gap-2 px-3 py-2 border rounded cursor-pointer bg-slate-50 hover:bg-slate-100 text-sm text-slate-700">
                    <Upload size={16} /> Chọn ảnh
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleEditGalleryUpload} />
                  </label>
                  {editGallery.length > 0 && (
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {editGallery.map((url, idx) => (
                        <img key={idx} src={url} className="w-full h-16 object-cover rounded bg-slate-100" />
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Cập nhật File đính kèm</label>
                  <label className="flex items-center gap-2 px-3 py-2 border rounded cursor-pointer bg-slate-50 hover:bg-slate-100 text-sm text-slate-700">
                    <Paperclip size={16} /> Chọn file
                    <input type="file" multiple className="hidden" onChange={handleEditAttachmentUpload} />
                  </label>
                  {editAttachments.length > 0 && (
                    <div className="mt-2 space-y-1 text-xs text-slate-700">
                      {editAttachments.map((f, idx) => (
                        <div key={idx} className="px-2 py-1 rounded bg-slate-100 border border-slate-200 truncate">{f.name}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">File gốc (AI/PSD/...)</label>
                <label className="flex items-center gap-2 px-3 py-2 border rounded cursor-pointer bg-slate-50 hover:bg-slate-100 text-sm text-slate-700">
                  <FileUp size={16} /> Chọn file
                  <input type="file" className="hidden" onChange={handleEditOriginalUpload} />
                </label>
                {editOriginalFile ? (
                  <div className="mt-2 text-xs text-slate-700 px-2 py-1 rounded bg-slate-100 border border-slate-200 truncate">{editOriginalFile.name}</div>
                ) : null}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Danh mục</label>
                <select
                  className="w-full border p-2 rounded"
                  value={editForm.category || ''}
                  onChange={e => setEditForm({ ...editForm, category: e.target.value })}
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
                  value={editForm.description || ''}
                  onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setEditModal({ isOpen: false, design: null });
                  setEditGallery([]);
                  setEditAttachments([]);
                  setEditOriginalFile(null);
                }}
                className="px-4 py-2 hover:bg-slate-100 rounded"
              >
                Hủy
              </button>
              <button onClick={handleSaveEdit} className="px-4 py-2 bg-accent text-white rounded hover:bg-blue-600">Lưu chỉnh sửa</button>
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
              <div className="relative">
                <input
                  className="w-full border p-2.5 rounded-lg outline-none focus:border-accent"
                  placeholder="Gõ mã đơn hoặc tên khách"
                  value={orderSearch}
                  onChange={(e) => {
                    setOrderSearch(e.target.value);
                    setSelectedOrder(null);
                    setSelectedOrderId('');
                  }}
                />
                <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow max-h-52 overflow-y-auto z-10">
                  {(orderSearch ? designOrders.filter(o =>
                    o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
                    o.customerName.toLowerCase().includes(orderSearch.toLowerCase())
                  ) : designOrders.slice(0, 10)).map(order => (
                    <button
                      key={order.id}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50"
                      onClick={() => {
                        setSelectedOrder(order);
                        setSelectedOrderId(order.id);
                        setOrderSearch(`${order.id} - ${order.customerName}`);
                      }}
                    >
                      <div className="text-sm font-semibold text-slate-800">{order.id} - {order.customerName}</div>
                      <div className="text-xs text-slate-500">{order.productType}</div>
                    </button>
                  ))}
                </div>
              </div>
              {selectedOrder ? (
                <div className="mt-2 text-xs text-slate-500">
                  Khách hàng: <span className="font-semibold text-slate-700">{selectedOrder.customerName}</span>
                </div>
              ) : null}
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

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Mã đơn</label>
                <input
                  value={manualHistory.orderId}
                  onChange={(e) => setManualHistory({ ...manualHistory, orderId: e.target.value })}
                  className="w-full border rounded p-2 text-sm"
                  placeholder="VD: ORD001"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Khách hàng</label>
                <input
                  value={manualHistory.customerName}
                  onChange={(e) => setManualHistory({ ...manualHistory, customerName: e.target.value })}
                  className="w-full border rounded p-2 text-sm"
                  placeholder="Tên khách hàng"
                />
              </div>
              <div className="col-span-3 flex justify-end">
                <button
                  onClick={handleAddManualHistory}
                  className="px-4 py-2 bg-accent text-white rounded hover:bg-blue-600 text-sm font-semibold"
                >
                  Thêm lịch sử
                </button>
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