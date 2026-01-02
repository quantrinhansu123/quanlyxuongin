import React, { useState, useMemo } from 'react';
import { 
  Search, 
  PenTool, 
  DollarSign, 
  Calendar, 
  FileText,
  Filter,
  MoreVertical,
  PlusCircle,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { DesignOrder, DesignOrderStatus } from '../types';
import { MOCK_DESIGN_ORDERS } from '../constants';

const DesignTasks: React.FC = () => {
  const [orders, setOrders] = useState<DesignOrder[]>(MOCK_DESIGN_ORDERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // Calculate stats
  const stats = useMemo(() => {
    return orders.reduce((acc, curr) => ({
      count: acc.count + 1,
      revenue: acc.revenue + curr.revenue,
      pending: curr.status === DesignOrderStatus.PENDING ? acc.pending + 1 : acc.pending
    }), { count: 0, revenue: 0, pending: 0 });
  }, [orders]);

  // Filter logic
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = 
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.productType.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = filterStatus === 'All' || order.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, filterStatus]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getStatusColor = (status: DesignOrderStatus) => {
    switch(status) {
      case DesignOrderStatus.PENDING: return 'bg-amber-50 text-amber-700 border-amber-200';
      case DesignOrderStatus.IN_PROGRESS: return 'bg-blue-50 text-blue-700 border-blue-200';
      case DesignOrderStatus.REVIEW: return 'bg-purple-50 text-purple-700 border-purple-200';
      case DesignOrderStatus.COMPLETED: return 'bg-green-50 text-green-700 border-green-200';
      case DesignOrderStatus.CANCELLED: return 'bg-slate-50 text-slate-500 border-slate-200';
      default: return 'bg-slate-50 text-slate-600';
    }
  };

  return (
    <div className="p-6 h-screen overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
                <PenTool size={24} />
            </div>
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Yêu cầu thiết kế</h2>
                <p className="text-slate-500 text-sm">Quản lý đơn hàng & Yêu cầu của khách</p>
            </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-blue-600 shadow-sm transition-colors">
            <PlusCircle size={18} /> Tạo yêu cầu mới
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
         <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                <FileText size={24} />
            </div>
            <div>
                <p className="text-slate-500 text-sm">Tổng đơn thiết kế</p>
                <p className="text-2xl font-bold text-slate-800">{stats.count}</p>
            </div>
         </div>
         <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-full">
                <DollarSign size={24} />
            </div>
            <div>
                <p className="text-slate-500 text-sm">Doanh thu thiết kế</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.revenue)}</p>
            </div>
         </div>
         <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-full">
                <Clock size={24} />
            </div>
            <div>
                <p className="text-slate-500 text-sm">Chờ xử lý</p>
                <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
            </div>
         </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
                type="text" 
                placeholder="Tìm đơn hàng, tên khách, loại thiết kế..." 
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent outline-none text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>
        <div className="flex items-center gap-2">
            <Filter size={18} className="text-slate-500" />
            <select 
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent outline-none"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
            >
                <option value="All">Tất cả trạng thái</option>
                {Object.values(DesignOrderStatus).map(status => (
                    <option key={status} value={status}>{status}</option>
                ))}
            </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
         <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-semibold">
                        <th className="p-4 w-24">Mã Đơn</th>
                        <th className="p-4 min-w-[180px]">Khách hàng</th>
                        <th className="p-4">Loại thiết kế</th>
                        <th className="p-4 min-w-[250px]">Yêu cầu / Ghi chú</th>
                        <th className="p-4 text-center">Hạn chót</th>
                        <th className="p-4 text-center">Trạng thái</th>
                        <th className="p-4 text-right">Doanh thu</th>
                        <th className="p-4 w-10"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-slate-50 transition-colors group">
                            <td className="p-4 font-mono text-slate-500 font-medium">{order.id}</td>
                            <td className="p-4">
                                <div className="font-medium text-slate-800">{order.customerName}</div>
                                <div className="text-xs text-slate-500">{order.phone}</div>
                            </td>
                            <td className="p-4">
                                <span className="inline-block px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-medium">
                                    {order.productType}
                                </span>
                            </td>
                            {/* Requirement Column */}
                            <td className="p-4">
                                <div className="flex items-start gap-2">
                                    <AlertCircle size={16} className="text-slate-400 shrink-0 mt-0.5" />
                                    <p className="text-slate-700 line-clamp-2" title={order.requirements}>
                                        {order.requirements}
                                    </p>
                                </div>
                            </td>
                            <td className="p-4 text-center text-slate-600">
                                {formatDate(order.deadline)}
                            </td>
                            <td className="p-4 text-center">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                                    {order.status}
                                </span>
                                <div className="text-[10px] text-slate-400 mt-1">{order.designer}</div>
                            </td>
                            <td className="p-4 text-right font-bold text-green-600">
                                {formatCurrency(order.revenue)}
                            </td>
                            <td className="p-4 text-right">
                                <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100">
                                    <MoreVertical size={16} />
                                </button>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={8} className="p-8 text-center text-slate-500">
                                Không tìm thấy đơn hàng nào.
                            </td>
                        </tr>
                    )}
                </tbody>
             </table>
         </div>
      </div>
    </div>
  );
};

export default DesignTasks;