import React, { useState } from 'react';
import { MOCK_ALLOCATIONS } from '../constants';
import { SaleAllocation } from '../types';
import { Plus, X, Shuffle } from 'lucide-react';

const SalesAllocation: React.FC = () => {
  const [allocations, setAllocations] = useState<SaleAllocation[]>(MOCK_ALLOCATIONS);

  // Simplified handler for removing a tag
  const removeTag = (id: string, type: 'products' | 'assignedSales', value: string) => {
    setAllocations(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          [type]: item[type].filter(t => t !== value)
        };
      }
      return item;
    }));
  };

  const handleAutoDistribute = () => {
    alert("Hệ thống đã tự động phân chia đều data cho các Sale đang hoạt động!");
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Phân bổ Sale</h2>
          <p className="text-slate-500 text-sm">Cấu hình tự động chia Lead theo sản phẩm và nhóm khách</p>
        </div>
        <button 
          onClick={handleAutoDistribute}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-blue-600 shadow-sm transition-colors"
        >
          <Shuffle size={18} /> Tự động chia đều Data
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
              <th className="p-4 w-24">Mã SP</th>
              <th className="p-4 w-32">Nhóm KH</th>
              <th className="p-4">Nhóm SP</th>
              <th className="p-4">Sản Phẩm (Tags)</th>
              <th className="p-4">Sale Phụ Trách (Tags)</th>
              <th className="p-4 w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {allocations.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/50">
                <td className="p-4 font-mono text-slate-500">{item.id}</td>
                <td className="p-4">
                  <select className="bg-transparent border border-slate-200 rounded px-2 py-1 text-sm focus:border-accent outline-none">
                    <option>{item.customerGroup}</option>
                  </select>
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {item.productGroups.map(pg => (
                      <span key={pg} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
                        {pg}
                      </span>
                    ))}
                    <button className="text-slate-400 hover:text-accent"><Plus size={14} /></button>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {item.products.map(p => (
                      <span key={p} className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded text-xs">
                        {p}
                        <button onClick={() => removeTag(item.id, 'products', p)} className="hover:text-red-500"><X size={12} /></button>
                      </span>
                    ))}
                     <button className="text-slate-400 hover:text-accent border border-dashed border-slate-300 rounded px-2 py-1 text-xs">+ Thêm</button>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {item.assignedSales.map(s => (
                      <span key={s} className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 border border-green-100 rounded text-xs">
                        {s}
                         <button onClick={() => removeTag(item.id, 'assignedSales', s)} className="hover:text-red-500"><X size={12} /></button>
                      </span>
                    ))}
                    <button className="text-slate-400 hover:text-accent border border-dashed border-slate-300 rounded px-2 py-1 text-xs">+ Sale</button>
                  </div>
                </td>
                <td className="p-4 text-center">
                    <button className="text-red-400 hover:text-red-600"><X size={16} /></button>
                </td>
              </tr>
            ))}
             <tr>
                 <td colSpan={6} className="p-4 text-center border-t border-slate-100">
                     <button className="text-accent hover:underline text-sm font-medium">+ Thêm dòng mới</button>
                 </td>
             </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesAllocation;