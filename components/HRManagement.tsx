import React, { useState } from 'react';
import { 
  Search, 
  UserPlus, 
  MoreVertical, 
  Mail, 
  Phone,
  Briefcase,
  Users,
  Filter,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MOCK_EMPLOYEES } from '../constants';
import { EmployeeStatus } from '../types';

const HRManagement: React.FC = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState(MOCK_EMPLOYEES);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('All');

  const departments = ['All', ...Array.from(new Set(MOCK_EMPLOYEES.map(e => e.department)))];

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.position.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDept = filterDepartment === 'All' || emp.department === filterDepartment;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="p-6 h-screen overflow-y-auto flex flex-col">
      <div className="mb-6 flex items-center justify-between">
         <div className="flex items-center gap-3">
             <div className="p-2 bg-lime-100 text-lime-700 rounded-lg">
                <Users size={24} />
             </div>
             <div>
                <h2 className="text-2xl font-bold text-slate-800">Quản lý Nhân sự</h2>
                <p className="text-slate-500 text-sm">Danh sách nhân viên và trạng thái làm việc</p>
             </div>
         </div>
         <button className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-blue-600 shadow-sm transition-colors">
            <UserPlus size={18} /> Thêm nhân viên
         </button>
      </div>

      {/* Control Panel */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Tìm kiếm theo tên, email, chức vụ..." 
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Department Filter */}
            <div className="flex items-center gap-2">
                <Filter size={18} className="text-slate-500" />
                <select 
                    className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent outline-none"
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                >
                    {departments.map(dept => (
                        <option key={dept} value={dept}>{dept === 'All' ? 'Tất cả phòng ban' : dept}</option>
                    ))}
                </select>
            </div>
             <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors ml-auto"
            >
              <ArrowLeft size={16} /> Quay lại
            </button>
        </div>
      </div>

      {/* Employee List */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-semibold">
                    <th className="p-4 w-16">ID</th>
                    <th className="p-4">Nhân viên</th>
                    <th className="p-4">Chức vụ & Phòng ban</th>
                    <th className="p-4">Liên hệ</th>
                    <th className="p-4">Ngày vào làm</th>
                    <th className="p-4">Trạng thái</th>
                    <th className="p-4 text-right"></th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50 transition-colors text-sm group">
                        <td className="p-4 font-mono text-slate-500">{emp.id}</td>
                        <td className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                                    {emp.avatar}
                                </div>
                                <div>
                                    <div className="font-medium text-slate-900">{emp.name}</div>
                                    <div className="text-xs text-slate-500">{emp.email}</div>
                                </div>
                            </div>
                        </td>
                        <td className="p-4">
                            <div className="font-medium text-slate-800">{emp.position}</div>
                            <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                                <Briefcase size={12} /> {emp.department}
                            </div>
                        </td>
                        <td className="p-4">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Phone size={14} className="text-slate-400" />
                                    <span>{emp.phone}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Mail size={14} className="text-slate-400" />
                                    <span className="truncate max-w-[150px]">{emp.email}</span>
                                </div>
                            </div>
                        </td>
                        <td className="p-4 text-slate-600">{new Date(emp.joinDate).toLocaleDateString('vi-VN')}</td>
                        <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border
                                ${emp.status === EmployeeStatus.ACTIVE 
                                    ? 'bg-green-50 text-green-700 border-green-200' 
                                    : emp.status === EmployeeStatus.LEAVE
                                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                                        : 'bg-red-50 text-red-700 border-red-200'}
                            `}>
                                {emp.status}
                            </span>
                        </td>
                        <td className="p-4 text-right">
                            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                                <MoreVertical size={18} />
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default HRManagement;