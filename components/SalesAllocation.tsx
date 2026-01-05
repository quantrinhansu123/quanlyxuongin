import React, { useState, useEffect, useRef } from 'react';
import { useSaleAllocations, useProducts, useEmployees, useLeads } from '../hooks/useFirebaseData';
import { SaleAllocation } from '../types';
import { Plus, X, Shuffle, ChevronDown } from 'lucide-react';
import { CUSTOMER_GROUPS } from '../constants';

const SalesAllocation: React.FC = () => {
  const { allocations, addAllocation, updateAllocation, deleteAllocation } = useSaleAllocations();
  const { products: allProducts } = useProducts();
  const { employees } = useEmployees();
  const { leads, updateLead } = useLeads();

  // Filter only Sale employees
  const saleAgents = employees
    .filter(e => e.department === 'Kinh Doanh' || e.position.includes('Sale'))
    .map(e => e.name);

  // Derive unique product groups from product list
  const availableProductGroups = Array.from(new Set(allProducts.map(p => p.group)));

  // Custom product groups and products from localStorage
  const [customProductGroups, setCustomProductGroups] = useState<string[]>(() => {
    const saved = localStorage.getItem('customProductGroups');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [customProducts, setCustomProducts] = useState<string[]>(() => {
    const saved = localStorage.getItem('customProducts');
    return saved ? JSON.parse(saved) : [];
  });

  // Combine available options with custom ones
  const allProductGroups = [...new Set([...availableProductGroups, ...customProductGroups])];
  const allProductOptions = [...new Set([...allProducts.map(p => p.name), ...customProducts])];

  // Popover State for adding tags
  const [activePopover, setActivePopover] = useState<{ id: string, type: 'product' | 'sale' | 'group' } | null>(null);

  // Close popover on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.popover-container')) {
        setActivePopover(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDeleteRow = async (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa dòng phân bổ này?')) {
      await deleteAllocation(id);
    }
  };

  const handleAddRow = async () => {
    const newId = `SP${Date.now().toString().slice(-4)}`;
    await addAllocation({
      id: newId,
      customerGroup: CUSTOMER_GROUPS[0],
      productGroups: [],
      products: [],
      assignedSales: []
    });
  };

  const updateField = async (id: string, field: keyof SaleAllocation, value: any) => {
    const item = allocations.find(a => a.id === id);
    if (!item) return;
    await updateAllocation({ ...item, [field]: value });
  };

  const addTag = async (id: string, type: 'products' | 'assignedSales' | 'productGroups', value: string) => {
    const item = allocations.find(a => a.id === id);
    if (!item) return;

    // Check duplicate
    if (item[type].includes(value)) return;

    await updateAllocation({
      ...item,
      [type]: [...item[type], value]
    });
    setActivePopover(null);
  };

  const removeTag = async (id: string, type: 'products' | 'assignedSales' | 'productGroups', value: string) => {
    const item = allocations.find(a => a.id === id);
    if (!item) return;
    await updateAllocation({
      ...item,
      [type]: item[type].filter(t => t !== value)
    });
  };

  const addCustomProductGroup = (value: string) => {
    if (!value.trim() || customProductGroups.includes(value)) return;
    const updated = [...customProductGroups, value.trim()];
    setCustomProductGroups(updated);
    localStorage.setItem('customProductGroups', JSON.stringify(updated));
  };

  const addCustomProduct = (value: string) => {
    if (!value.trim() || customProducts.includes(value)) return;
    const updated = [...customProducts, value.trim()];
    setCustomProducts(updated);
    localStorage.setItem('customProducts', JSON.stringify(updated));
  };

  const handleAutoDistribute = async () => {
    if (!window.confirm('Bạn có chắc muốn phân bổ Sale tự động cho các khách hàng dựa trên Loại sản phẩm?')) {
      return;
    }

    let assignedCount = 0;
    let skippedCount = 0;

    // Lọc leads chưa có đơn hàng và ò trạng thái Mới hoặc Đã gọi
    const unassignedLeads = leads.filter(lead => 
      !lead.isOrderCreated && 
      lead.productType && 
      (lead.status === 'Mới' || lead.status === 'Đã gọi')
    );

    for (const lead of unassignedLeads) {
      // Tìm allocation phù hợp với nhóm khách hàng và sản phẩm
      const matchedAllocation = allocations.find(alloc => 
        alloc.customerGroup === lead.group &&
        (alloc.products.includes(lead.productType) || 
         alloc.productGroups.some(pg => lead.productType.includes(pg)))
      );

      if (matchedAllocation && matchedAllocation.assignedSales.length > 0) {
        // Chọn sale ngẫu nhiên từ danh sách sale được phân bổ
        const randomSale = matchedAllocation.assignedSales[
          Math.floor(Math.random() * matchedAllocation.assignedSales.length)
        ];

        // Cập nhật lead với sale được phân bổ
        try {
          await updateLead({
            ...lead,
            saleName: randomSale
          });
          assignedCount++;
        } catch (error) {
          console.error(`Lỗi khi phân bổ sale cho lead ${lead.id}:`, error);
          skippedCount++;
        }
      } else {
        skippedCount++;
      }
    }

    alert(`Đã phân bổ thành công ${assignedCount} khách hàng!\n` +
          `Bỏ qua ${skippedCount} khách hàng (không khớp hoặc không có sale phụ trách).`);
  };

  return (
    <div className="p-6 h-screen overflow-y-auto">
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

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 pb-20 overflow-visible">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
              <th className="p-4 w-24">Mã SP</th>
              <th className="p-4 w-40">Nhóm KH</th>
              <th className="p-4 w-1/4">Nhóm SP</th>
              <th className="p-4 w-1/4">Sản Phẩm (Chi tiết)</th>
              <th className="p-4 w-1/4">Sale Phụ Trách</th>
              <th className="p-4 w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {allocations.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/50 group">
                <td className="p-4 font-mono text-slate-500 text-sm">{item.id}</td>

                {/* 1. Nhóm Khách Hàng - Select */}
                <td className="p-4">
                  <select
                    value={item.customerGroup}
                    onChange={(e) => updateField(item.id, 'customerGroup', e.target.value)}
                    className="bg-transparent border border-slate-200 rounded px-2 py-1 text-sm focus:border-accent outline-none w-full"
                  >
                    {CUSTOMER_GROUPS.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </td>

                {/* 2. Nhóm Sản Phẩm - Tags */}
                <td className="p-4 relative popover-container">
                  <div className="flex flex-wrap gap-1">
                    {item.productGroups.map(pg => (
                      <span key={pg} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs flex items-center gap-1">
                        {pg}
                        <button onClick={() => removeTag(item.id, 'productGroups', pg)} className="hover:text-red-500"><X size={10} /></button>
                      </span>
                    ))}
                    <button
                      onClick={() => setActivePopover({ id: item.id, type: 'group' })}
                      className="text-slate-400 hover:text-accent border border-dashed border-slate-300 rounded px-2 py-1 text-xs hover:border-accent"
                    >
                      + Thêm
                    </button>
                  </div>
                  {/* Dropdown for Groups */}
                  {activePopover?.id === item.id && activePopover.type === 'group' && (
                    <div className="absolute z-10 mt-2 w-64 bg-white rounded-lg shadow-xl border border-slate-100 p-2 animate-in fade-in zoom-in-95 max-h-80 overflow-y-auto">
                      <div className="text-xs font-semibold text-slate-400 px-2 py-1 mb-1">Chọn hoặc thêm mới nhóm SP</div>
                      
                      {/* Input thêm mới */}
                      <div className="mb-2 px-2">
                        <input
                          type="text"
                          placeholder="Nhập tên nhóm mới..."
                          className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:border-accent outline-none"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                              const newValue = e.currentTarget.value.trim();
                              addCustomProductGroup(newValue);
                              addTag(item.id, 'productGroups', newValue);
                              e.currentTarget.value = '';
                            }
                          }}
                        />
                        <p className="text-xs text-slate-400 mt-1">Nhấn Enter để thêm</p>
                      </div>

                      <div className="border-t border-slate-100 pt-1">
                        {allProductGroups.map(g => (
                          <button
                            key={g}
                            onClick={() => addTag(item.id, 'productGroups', g)}
                            className="w-full text-left px-2 py-1.5 text-sm hover:bg-slate-50 rounded text-slate-700"
                          >
                            {g}
                          </button>
                        ))}
                        {allProductGroups.length === 0 && <div className="p-2 text-xs text-slate-400">Chưa có nhóm nào</div>}
                      </div>
                    </div>
                  )}
                </td>

                {/* 3. Sản Phẩm - Tags */}
                <td className="p-4 relative popover-container">
                  <div className="flex flex-wrap gap-2">
                    {item.products.map(p => (
                      <span key={p} className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded text-xs">
                        {p}
                        <button onClick={() => removeTag(item.id, 'products', p)} className="hover:text-red-500"><X size={12} /></button>
                      </span>
                    ))}
                    <button
                      onClick={() => setActivePopover({ id: item.id, type: 'product' })}
                      className="text-slate-400 hover:text-accent border border-dashed border-slate-300 rounded px-2 py-1 text-xs hover:border-accent"
                    >
                      + SP
                    </button>
                  </div>
                  {/* Dropdown for Products */}
                  {activePopover?.id === item.id && activePopover.type === 'product' && (
                    <div className="absolute z-10 mt-2 w-64 bg-white rounded-lg shadow-xl border border-slate-100 p-2 animate-in fade-in zoom-in-95 max-h-80 overflow-y-auto">
                      <div className="text-xs font-semibold text-slate-400 px-2 py-1 mb-1">Chọn hoặc thêm mới sản phẩm</div>
                      
                      {/* Input thêm mới */}
                      <div className="mb-2 px-2">
                        <input
                          type="text"
                          placeholder="Nhập tên sản phẩm mới..."
                          className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:border-accent outline-none"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                              const newValue = e.currentTarget.value.trim();
                              addCustomProduct(newValue);
                              addTag(item.id, 'products', newValue);
                              e.currentTarget.value = '';
                            }
                          }}
                        />
                        <p className="text-xs text-slate-400 mt-1">Nhấn Enter để thêm</p>
                      </div>

                      <div className="border-t border-slate-100 pt-1">
                        {allProductOptions.map(p => (
                          <button
                            key={p}
                            onClick={() => addTag(item.id, 'products', p)}
                            className="w-full text-left px-2 py-1.5 text-sm hover:bg-slate-50 rounded text-slate-700"
                          >
                            {p}
                          </button>
                        ))}
                        {allProductOptions.length === 0 && <div className="p-2 text-xs text-slate-400">Chưa có sản phẩm nào</div>}
                      </div>
                    </div>
                  )}
                </td>

                {/* 4. Sale Phụ Trách - Tags */}
                <td className="p-4 relative popover-container">
                  <div className="flex flex-wrap gap-2">
                    {item.assignedSales.map(s => (
                      <span key={s} className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 border border-green-100 rounded text-xs">
                        {s}
                        <button onClick={() => removeTag(item.id, 'assignedSales', s)} className="hover:text-red-500"><X size={12} /></button>
                      </span>
                    ))}
                    <button
                      onClick={() => setActivePopover({ id: item.id, type: 'sale' })}
                      className="text-slate-400 hover:text-accent border border-dashed border-slate-300 rounded px-2 py-1 text-xs hover:border-accent"
                    >
                      + Sale
                    </button>
                  </div>
                  {/* Dropdown for Sales */}
                  {activePopover?.id === item.id && activePopover.type === 'sale' && (
                    <div className="absolute right-0 z-10 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-100 p-1 animate-in fade-in zoom-in-95 max-h-60 overflow-y-auto">
                      <div className="text-xs font-semibold text-slate-400 px-2 py-1">Chọn nhân sự</div>
                      {saleAgents.map(name => (
                        <button
                          key={name}
                          onClick={() => addTag(item.id, 'assignedSales', name)}
                          className="w-full text-left px-2 py-1.5 text-sm hover:bg-slate-50 rounded text-slate-700"
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  )}
                </td>

                <td className="p-4 text-center">
                  <button onClick={() => handleDeleteRow(item.id)} className="text-red-400 hover:text-red-600 p-2 rounded hover:bg-red-50 transition-colors">
                    <X size={16} />
                  </button>
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan={6} className="p-4 text-center border-t border-slate-100">
                <button
                  onClick={handleAddRow}
                  className="flex items-center justify-center gap-2 mx-auto text-accent hover:underline text-sm font-medium px-4 py-2 hover:bg-blue-50 rounded transition-colors"
                >
                  <Plus size={16} /> Thêm dòng phân bổ mới
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesAllocation;