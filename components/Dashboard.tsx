import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  ComposedChart,
  LineChart,
  Line, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { 
  Search, 
  Download, 
  Upload, 
  ArrowLeft,
  ChevronDown,
  Check,
  RotateCcw,
  Trophy,
  TrendingDown,
  User,
  MoreVertical,
  Target,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LEAD_SOURCES, SALE_AGENTS, CUSTOMER_GROUPS } from '../constants';
import { LeadStatus } from '../types';
import { useLeads, useOrders } from '../hooks/useFirebaseData';

// --- Helper: MultiSelect Dropdown ---
interface MultiSelectProps {
  label: string;
  options: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
}

const MultiSelect: React.FC<MultiSelectProps> = ({ label, options, selectedValues, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (option: string) => {
    if (selectedValues.includes(option)) {
      onChange(selectedValues.filter(v => v !== option));
    } else {
      onChange([...selectedValues, option]);
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full px-3 py-2 text-sm border rounded-lg outline-none transition-all shadow-sm ${
          selectedValues.length > 0 
            ? 'border-accent bg-blue-50 text-accent font-medium' 
            : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400'
        }`}
      >
        <span className="truncate mr-2">
          {selectedValues.length > 0 ? `${label}: ${selectedValues.length}` : label}
        </span>
        <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full min-w-[200px] bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
           <div className="p-2 bg-slate-50 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Chọn {label}</span>
              {selectedValues.length > 0 && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onChange([]); }}
                  className="text-xs text-red-500 hover:text-red-600 font-medium hover:underline"
                >
                  Bỏ chọn
                </button>
              )}
           </div>
          <div className="p-1">
            {options.map((option) => (
              <div
                key={option}
                className="flex items-center px-3 py-2 rounded-md hover:bg-slate-100 cursor-pointer transition-colors"
                onClick={() => toggleOption(option)}
              >
                <div className={`w-4 h-4 mr-3 rounded border flex items-center justify-center transition-colors ${
                  selectedValues.includes(option) ? 'bg-accent border-accent' : 'border-slate-300 bg-white'
                }`}>
                  {selectedValues.includes(option) && <Check size={10} className="text-white" />}
                </div>
                <span className={`text-sm ${selectedValues.includes(option) ? 'text-slate-900 font-medium' : 'text-slate-600'}`}>
                  {option}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Mock Data Generation ---
const generateEmployeeData = () => {
    return SALE_AGENTS.map((agent, index) => {
        const baseLead = 40 + Math.floor(Math.random() * 60); // 40-100 leads
        const conversionRate = 0.2 + (Math.random() * 0.3); // 20% - 50%
        const orders = Math.floor(baseLead * conversionRate);
        const revenue = orders * 850000; // ~850k/order
        const cskh = Math.floor(orders * 0.5); // Feedback count
        const target = 40000000; // KPI Target 40M
        
        // Mock Average Processing Time (in minutes)
        // Random between 15 mins to 180 mins (3 hours)
        const avgTime = 15 + Math.floor(Math.random() * 165); 

        return {
            id: `S${index}`,
            name: agent,
            leads: baseLead,
            orders: orders,
            cskh: cskh,
            revenue: revenue,
            target: target,
            conversion: (orders / baseLead) * 100,
            avgTime: avgTime 
        };
    });
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGroups, setFilterGroups] = useState<string[]>([]);
  const [filterSources, setFilterSources] = useState<string[]>([]);
  const [filterSales, setFilterSales] = useState<string[]>([]);
  const [filterStatuses, setFilterStatuses] = useState<string[]>([]);
  const [filterCallCounts, setFilterCallCounts] = useState<string[]>([]);

  // Data State
  const [employeeData] = useState(generateEmployeeData());

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatTime = (minutes: number) => {
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      if (h > 0) return `${h}h ${m}p`;
      return `${m}p`;
  };

  // --- Metrics Calculation ---
  const metrics = useMemo(() => {
    return employeeData.reduce((acc, curr) => ({
        leads: acc.leads + curr.leads,
        orders: acc.orders + curr.orders,
        revenue: acc.revenue + curr.revenue,
        cskh: acc.cskh + curr.cskh
    }), { leads: 0, orders: 0, revenue: 0, cskh: 0 });
  }, [employeeData]);

  // --- Ranking ---
  const sortedByRevenue = [...employeeData].sort((a, b) => b.revenue - a.revenue);
  const top3Sales = sortedByRevenue.slice(0, 3);
  const bottom3Sales = sortedByRevenue.slice(-3).reverse();

  // Get real data from Firebase
  const { leads } = useLeads();
  const { orders } = useOrders();

  // Calculate MACD-style chart data (Lead vs Orders over time)
  const macdChartData = useMemo(() => {
    // Group by date (last 7 days)
    const days = 7;
    const today = new Date();
    const data: Array<{ name: string; date: string; leads: number; orders: number; leadMA: number; orderMA: number }> = [];
    
    // Calculate data for last 7 days
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][date.getDay()];
      
      // Count leads created on this date
      const dayLeads = leads.filter(lead => {
        const leadDate = new Date(lead.assignedAt).toISOString().split('T')[0];
        return leadDate === dateStr;
      }).length;
      
      // Count orders created on this date
      const dayOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
        return orderDate === dateStr;
      }).length;
      
      data.push({
        name: dayName,
        date: dateStr,
        leads: dayLeads,
        orders: dayOrders,
        leadMA: 0, // Will calculate moving average
        orderMA: 0
      });
    }
    
    // Calculate Moving Averages (3-day MA for MACD effect)
    const maPeriod = 3;
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - maPeriod + 1);
      const end = i + 1;
      const leadSum = data.slice(start, end).reduce((sum, d) => sum + d.leads, 0);
      const orderSum = data.slice(start, end).reduce((sum, d) => sum + d.orders, 0);
      const count = end - start;
      
      data[i].leadMA = count > 0 ? Math.round(leadSum / count * 10) / 10 : data[i].leads;
      data[i].orderMA = count > 0 ? Math.round(orderSum / count * 10) / 10 : data[i].orders;
    }
    
    return data;
  }, [leads, orders]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterGroups([]);
    setFilterSources([]);
    setFilterSales([]);
    setFilterStatuses([]);
    setFilterCallCounts([]);
  };

  return (
    <div className="p-6 h-full overflow-y-auto flex flex-col pb-20">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Báo cáo KPIs</h2>
        <p className="text-slate-500 text-sm">Tổng quan hiệu suất Sales & CSKH</p>
      </div>

      {/* 1. Bộ lọc (Filter Panel) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6 space-y-4">
        
        {/* Dòng 1: Tìm kiếm & Actions */}
        <div className="flex flex-wrap gap-3 justify-between items-center">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm kiếm tổng..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
              <Download size={16} /> Excel
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
              <Upload size={16} /> Import
            </button>
            <button 
                onClick={handleResetFilters}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                title="Đặt lại"
            >
              <RotateCcw size={16} />
            </button>
            <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <ArrowLeft size={16} />
            </button>
          </div>
        </div>

        {/* Dòng 2: Bộ lọc Checkbox đa chọn */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <MultiSelect label="Nhóm KH" options={CUSTOMER_GROUPS} selectedValues={filterGroups} onChange={setFilterGroups} />
            <MultiSelect label="Nguồn tới" options={LEAD_SOURCES} selectedValues={filterSources} onChange={setFilterSources} />
            <MultiSelect label="NV Sale" options={SALE_AGENTS} selectedValues={filterSales} onChange={setFilterSales} />
            <MultiSelect label="Lần gọi" options={['0','1','2','3','4+']} selectedValues={filterCallCounts} onChange={setFilterCallCounts} />
            <MultiSelect label="Trạng thái" options={Object.values(LeadStatus)} selectedValues={filterStatuses} onChange={setFilterStatuses} />
        </div>

        {/* Dòng 3: Bộ đếm Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-slate-100 pt-4">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 uppercase font-semibold">Số Lead (Hôm nay)</span>
            <span className="text-xl font-bold text-slate-800">{metrics.leads}</span>
          </div>
          <div className="flex flex-col border-l pl-6 border-slate-100">
            <span className="text-xs text-slate-500 uppercase font-semibold">Số đơn (Đã chốt)</span>
            <span className="text-xl font-bold text-accent">{metrics.orders}</span>
          </div>
          <div className="flex flex-col border-l pl-6 border-slate-100">
            <span className="text-xs text-slate-500 uppercase font-semibold">Doanh số</span>
            <span className="text-xl font-bold text-green-600">{formatCurrency(metrics.revenue)}</span>
          </div>
           <div className="flex flex-col border-l pl-6 border-slate-100">
            <span className="text-xs text-slate-500 uppercase font-semibold" title="Số khách phản hồi">CSKH</span>
            <span className="text-xl font-bold text-orange-500">{metrics.cskh}</span>
          </div>
        </div>
      </div>

      {/* 2. Biểu đồ & Xếp hạng */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
        
        {/* Biểu đồ MACD: Tương quan Lead & Đơn hàng */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-[400px]">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-700">Tương quan Lead & Đơn hàng (MACD)</h3>
            <p className="text-xs text-slate-500 mt-1">2 đường di chuyển và cắt nhau theo thời gian</p>
          </div>
          <ResponsiveContainer width="100%" height="calc(100% - 50px)">
            <ComposedChart 
              data={macdChartData} 
              margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#64748b', fontSize: 12 }}
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <YAxis 
                yAxisId="left"
                tick={{ fill: '#64748b', fontSize: 12 }}
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                tick={{ fill: '#64748b', fontSize: 12 }}
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '8px', 
                  border: '1px solid #e2e8f0', 
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  backgroundColor: 'white'
                }}
                formatter={(value: any, name: string) => {
                  if (name === 'leadMA' || name === 'orderMA') {
                    return [value.toFixed(1), name === 'leadMA' ? 'Lead MA (3 ngày)' : 'Đơn MA (3 ngày)'];
                  }
                  return [value, name === 'leads' ? 'Số Lead' : 'Số Đơn'];
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '10px' }}
                iconType="line"
              />
              
              {/* Bar chart for actual values */}
              <Bar 
                yAxisId="left"
                dataKey="leads" 
                fill="#94a3b8" 
                name="Số Lead" 
                radius={[2, 2, 0, 0]} 
                barSize={15}
                opacity={0.3}
              />
              <Bar 
                yAxisId="left"
                dataKey="orders" 
                fill="#3b82f6" 
                name="Số Đơn" 
                radius={[2, 2, 0, 0]} 
                barSize={15}
                opacity={0.3}
              />
              
              {/* MACD Lines - Moving Averages that cross each other */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="leadMA"
                stroke="#ef4444"
                strokeWidth={3}
                dot={{ fill: '#ef4444', r: 4 }}
                activeDot={{ r: 6 }}
                name="Lead MA"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="orderMA"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: '#10b981', r: 4 }}
                activeDot={{ r: 6 }}
                name="Đơn MA"
              />
              
              {/* Reference line at 0 for better visualization */}
              <ReferenceLine yAxisId="right" y={0} stroke="#cbd5e1" strokeDasharray="2 2" />
            </ComposedChart>
          </ResponsiveContainer>
          
          {/* Legend explanation */}
          <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Đường Lead MA (đỏ)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Đường Đơn MA (xanh)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-1.5 bg-slate-400 opacity-30"></div>
              <span>Cột giá trị thực</span>
            </div>
          </div>
        </div>

        {/* Bảng xếp hạng */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-[350px] flex flex-col">
          <h3 className="text-lg font-bold mb-4 text-slate-700">Xếp hạng nhân viên</h3>
          <div className="flex-1 grid grid-cols-2 gap-4 overflow-hidden">
              {/* Top 3 */}
              <div className="bg-yellow-50/50 rounded-lg p-3 border border-yellow-100 flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-3 text-yellow-700 font-bold text-sm uppercase">
                      <Trophy size={16} /> Top 3 Xuất Sắc
                  </div>
                  <div className="space-y-3 overflow-y-auto pr-1 flex-1 scrollbar-thin scrollbar-thumb-yellow-200">
                      {top3Sales.map((sale, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-white p-2 rounded shadow-sm border border-yellow-100">
                              <div className="flex items-center gap-2">
                                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white
                                      ${idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-slate-400' : 'bg-amber-700'}
                                  `}>
                                      {idx + 1}
                                  </div>
                                  <span className="text-xs font-medium text-slate-700 truncate max-w-[70px]">{sale.name}</span>
                              </div>
                              <span className="text-[10px] font-bold text-green-600">{formatCurrency(sale.revenue)}</span>
                          </div>
                      ))}
                  </div>
              </div>

              {/* Bottom 3 */}
              <div className="bg-red-50/50 rounded-lg p-3 border border-red-100 flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-3 text-red-700 font-bold text-sm uppercase">
                      <TrendingDown size={16} /> Cần Cố Gắng
                  </div>
                   <div className="space-y-3 overflow-y-auto pr-1 flex-1 scrollbar-thin scrollbar-thumb-red-200">
                      {bottom3Sales.map((sale, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-white p-2 rounded shadow-sm border border-red-100">
                              <div className="flex items-center gap-2">
                                  <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                      <User size={12}/>
                                  </div>
                                  <span className="text-xs font-medium text-slate-700 truncate max-w-[70px]">{sale.name}</span>
                              </div>
                              <span className="text-[10px] font-bold text-slate-500">{formatCurrency(sale.revenue)}</span>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
        </div>
      </div>

      {/* 3. Bảng nhân viên các thông số */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6 flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
             <div className="flex items-center gap-2">
                <Target className="text-accent" size={20} />
                <h3 className="text-lg font-bold text-slate-800">Bảng nhân viên các thông số</h3>
             </div>
             <button className="text-slate-400 hover:text-slate-600">
                <MoreVertical size={20} />
             </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                    <tr className="bg-white text-slate-600 text-xs uppercase font-bold border-b border-slate-200">
                        <th className="p-4 border-r border-slate-100 w-[15%]">Sale</th>
                        <th className="p-4 text-center border-r border-slate-100 w-[10%]">Số Lead</th>
                        <th className="p-4 text-center border-r border-slate-100 w-[10%]">Số đơn</th>
                        {/* New Column Header */}
                        <th className="p-4 text-center border-r border-slate-100 w-[10%]">Thời gian TB</th>
                        <th className="p-4 text-center border-r border-slate-100 w-[10%]">Tỉ lệ chốt</th>
                        <th className="p-4 text-center border-r border-slate-100 w-[15%]">CSKH</th>
                        <th className="p-4 text-right border-r border-slate-100 w-[15%]">Doanh số</th>
                        <th className="p-4 w-[15%]">Tiến độ</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                    {employeeData.map((emp) => {
                        const progressPercent = Math.min(100, (emp.revenue / emp.target) * 100);
                        return (
                            <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4 font-medium text-slate-800 border-r border-slate-100">
                                    {emp.name}
                                    <div className="text-[10px] text-slate-400 font-normal">Mã: {emp.id}</div>
                                </td>
                                <td className="p-4 text-center text-slate-600 border-r border-slate-100 bg-slate-50/30">
                                    {emp.leads}
                                </td>
                                <td className="p-4 text-center font-bold text-accent border-r border-slate-100 bg-blue-50/20">
                                    {emp.orders}
                                </td>
                                {/* New Column Data */}
                                <td className="p-4 text-center border-r border-slate-100 text-slate-600">
                                   <div className="flex items-center justify-center gap-1">
                                      <Clock size={14} className="text-slate-400" />
                                      <span>{formatTime(emp.avgTime)}</span>
                                   </div>
                                </td>
                                <td className="p-4 text-center border-r border-slate-100">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold border
                                        ${emp.conversion >= 30 
                                            ? 'bg-green-50 text-green-700 border-green-200' 
                                            : emp.conversion >= 20 
                                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                : 'bg-red-50 text-red-700 border-red-200'}
                                    `}>
                                        {emp.conversion.toFixed(1)}%
                                    </span>
                                </td>
                                <td className="p-4 text-center text-slate-600 border-r border-slate-100">
                                    <div className="flex flex-col items-center">
                                        <span className="font-bold text-orange-500">{emp.cskh}</span>
                                        <span className="text-[10px] text-slate-400">phản hồi</span>
                                    </div>
                                </td>
                                <td className="p-4 text-right font-medium text-green-600 border-r border-slate-100">
                                    {formatCurrency(emp.revenue)}
                                </td>
                                <td className="p-4">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                                            <span>{progressPercent.toFixed(0)}%</span>
                                            <span>Mục tiêu: {formatCurrency(emp.target).replace('₫','')}</span>
                                        </div>
                                        <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                                            <div 
                                                className={`h-2.5 rounded-full transition-all duration-500 relative overflow-hidden
                                                    ${progressPercent >= 100 ? 'bg-green-500' : progressPercent >= 50 ? 'bg-blue-500' : 'bg-orange-500'}
                                                `} 
                                                style={{ width: `${progressPercent}%` }}
                                            >
                                                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;