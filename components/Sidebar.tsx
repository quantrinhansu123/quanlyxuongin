import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Box,
  MessageCircle,
  Users,
  Palette,
  Printer,
  PenTool,
  Factory,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Database,
  UserCog,
  ShoppingCart
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Define the menu structure
  const menuGroups = [
    {
      title: "Phòng Kinh Doanh",
      items: [
        { to: '/', icon: <MessageCircle size={20} />, label: 'Hộp chờ tư vấn', color: 'text-blue-400' },
        { to: '/orders', icon: <ShoppingCart size={20} />, label: 'Đơn hàng', color: 'text-red-400' },
        { to: '/lead-sources', icon: <Database size={20} />, label: 'Nguồn Lead', color: 'text-teal-400' },
        { to: '/sales-allocation', icon: <Users size={20} />, label: 'Phân bổ Sale', color: 'text-indigo-400' },
        { to: '/designs', icon: <Palette size={20} />, label: 'Kho thiết kế', color: 'text-pink-400' },
        { to: '/print-tool', icon: <Printer size={20} />, label: 'Tool Bình file', color: 'text-cyan-400' },
        { to: '/design-tasks', icon: <PenTool size={20} />, label: 'Yêu cầu thiết kế', color: 'text-purple-400' },
        { to: '/production', icon: <Factory size={20} />, label: 'Lệnh sản xuất', color: 'text-rose-400' },
        { to: '/hr', icon: <UserCog size={20} />, label: 'Nhân sự', color: 'text-lime-400' },
        { to: '/dashboard', icon: <BarChart3 size={20} />, label: 'Dashboard & KPI', color: 'text-emerald-400' }
      ]
    }
  ];

  return (
    <div
      className={`${isCollapsed ? 'w-20' : 'w-64'
        } bg-slate-900 text-slate-300 min-h-screen flex flex-col shadow-xl border-r border-slate-800 transition-all duration-300 relative`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 bg-accent text-white rounded-full p-1 shadow-lg hover:bg-blue-600 transition-colors z-10 border border-slate-800"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Header */}
      <div className={`h-16 flex items-center ${isCollapsed ? 'justify-center px-0' : 'justify-start px-6 gap-3'} border-b border-slate-800 bg-slate-950/50 transition-all duration-300 overflow-hidden whitespace-nowrap`}>
        <div className="min-w-[32px] w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden shadow-lg shrink-0 bg-white">
          <img src="/assets/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
        </div>
        <div className={`transition-opacity duration-300 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 w-auto'}`}>
          <h1 className="font-bold text-white text-base leading-none">CRM Pro</h1>
          <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Lead Master</span>
        </div>
      </div>

      {/* Scrollable Menu Area */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {menuGroups.map((group, index) => (
          <div key={index} className="space-y-1">
            {/* Group Title or Separator */}
            {!isCollapsed ? (
              <div className="px-3 mb-2 text-[11px] font-bold text-slate-500 uppercase tracking-widest truncate">
                {group.title}
              </div>
            ) : (
              <div className="h-px bg-slate-800 mx-2 my-2" title={group.title}></div>
            )}

            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  title={isCollapsed ? item.label : ''}
                  className={({ isActive }) =>
                    `flex items-center rounded-lg transition-all duration-200 group relative
                    ${isCollapsed ? 'justify-center w-10 h-10 mx-auto' : 'gap-3 px-3 py-2.5 w-full'}
                    ${isActive
                      ? 'bg-slate-800 text-white font-medium shadow-md shadow-slate-900/50'
                      : 'hover:bg-slate-800/50 hover:text-white'
                    }`
                  }
                >
                  <span className={`transition-transform duration-200 group-hover:scale-110 ${item.color}`}>
                    {item.icon}
                  </span>

                  {!isCollapsed && (
                    <span className="text-sm truncate">{item.label}</span>
                  )}

                  {/* Tooltip for collapsed mode specific override (optional if native title isn't enough) */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-slate-700">
                      {item.label}
                    </div>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/30 overflow-hidden">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-2'} py-2 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors`}>
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-bold shadow-lg text-sm shrink-0">
            AD
          </div>

          {!isCollapsed && (
            <div className="overflow-hidden min-w-[100px]">
              <p className="text-sm font-medium text-white truncate">Admin User</p>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <p className="text-xs text-slate-400">Đang hoạt động</p>
              </div>
            </div>
          )}

          {!isCollapsed && (
            <LogOut size={16} className="text-slate-500 hover:text-red-400 ml-auto" />
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;