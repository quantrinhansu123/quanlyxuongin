import React, { useState } from 'react';
import { MOCK_DESIGNS } from '../constants';
import { DesignItem } from '../types';
import { Plus, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';

const DesignLibrary: React.FC = () => {
  const [designs, setDesigns] = useState<DesignItem[]>(MOCK_DESIGNS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDesign, setNewDesign] = useState<Partial<DesignItem>>({});

  const handleAddDesign = () => {
    if (newDesign.title && newDesign.imageUrl) {
        setDesigns([...designs, { ...newDesign, id: `D${Date.now()}` } as DesignItem]);
        setIsModalOpen(false);
        setNewDesign({});
    }
  };

  return (
    <div className="p-6">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {designs.map((design) => (
            <div key={design.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden group hover:shadow-md transition-shadow">
                <div className="aspect-video bg-slate-100 relative overflow-hidden">
                    <img 
                        src={design.imageUrl} 
                        alt={design.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button className="bg-white text-slate-900 px-3 py-1.5 rounded text-xs font-bold">Xem mẫu</button>
                        <button className="bg-accent text-white px-3 py-1.5 rounded text-xs font-bold">Dùng mẫu này</button>
                    </div>
                </div>
                <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                         <h3 className="font-bold text-slate-800">{design.title}</h3>
                         <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{design.category}</span>
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-2">{design.description}</p>
                </div>
            </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white rounded-xl p-6 w-[500px] shadow-2xl">
                <h3 className="text-xl font-bold mb-4">Thêm mẫu thiết kế</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Tiêu đề</label>
                        <input 
                            className="w-full border p-2 rounded"
                            value={newDesign.title || ''}
                            onChange={e => setNewDesign({...newDesign, title: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Link Ảnh (URL)</label>
                        <div className="flex gap-2">
                            <input 
                                className="w-full border p-2 rounded"
                                placeholder="https://..."
                                value={newDesign.imageUrl || ''}
                                onChange={e => setNewDesign({...newDesign, imageUrl: e.target.value})}
                            />
                            <button className="p-2 bg-slate-100 rounded text-slate-600"><ImageIcon size={20}/></button>
                        </div>
                    </div>
                    <div>
                         <label className="block text-sm font-medium mb-1">Danh mục</label>
                         <select 
                            className="w-full border p-2 rounded"
                            onChange={e => setNewDesign({...newDesign, category: e.target.value})}
                        >
                            <option value="">Chọn danh mục</option>
                            <option value="Mỹ phẩm">Mỹ phẩm</option>
                            <option value="Nội thất">Nội thất</option>
                            <option value="Gia dụng">Gia dụng</option>
                         </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Mô tả</label>
                        <textarea 
                             className="w-full border p-2 rounded h-20"
                             value={newDesign.description || ''}
                             onChange={e => setNewDesign({...newDesign, description: e.target.value})}
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 hover:bg-slate-100 rounded">Hủy</button>
                    <button onClick={handleAddDesign} className="px-4 py-2 bg-accent text-white rounded">Lưu mẫu</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default DesignLibrary;