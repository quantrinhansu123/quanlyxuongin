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
  ShoppingCart,
  Grid3x3,
  ShoppingBag,
  Upload,
  Sparkles
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Define the menu structure
  const menuGroups = [
    {
      title: "Phòng Kinh Doanh",
      items: [
        { to: '/', label: 'Hộp chờ tư vấn' },
        { to: '/orders', label: 'Đơn hàng' },
        { to: '/lead-sources', label: 'Nguồn Lead' },
        { to: '/sales-allocation', label: 'Phân bổ Sale' },
        { to: '/designs', label: 'Kho thiết kế' },
      ]
    },
    {
      title: "Bình File",
      items: [
        { to: '/print-layout', label: 'Bình File Giấy' },
          { to: '/box-calculator', label: 'Bình File Hộp' },
        { to: '/bag-calculator', label: 'Bình File Túi' },
      ]
    },
    {
      title: "AI & Thiết Kế",
      items: [
        { to: '/bag-image-customizer', label: 'AI Dán Ảnh Lên Túi' },
        { to: '/ai-bag-generator', label: 'AI Tạo Ảnh Túi' },
        { to: '/design-tasks', label: 'Yêu cầu thiết kế' },
      ]
    },
    {
      title: "Quản Lý",
      items: [
        { to: '/hr', label: 'Nhân sự' },
        { to: '/dashboard', label: 'Dashboard & KPI' }
      ]
    }
  ];

  return (
    <div
      className={`${isCollapsed ? 'w-20' : 'w-64'
        } bg-gradient-to-b from-purple-900 via-purple-800 to-indigo-900 text-slate-200 min-h-screen flex flex-col shadow-xl border-r border-purple-700/50 transition-all duration-300 relative`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 bg-accent text-white rounded-full p-1 shadow-lg hover:bg-purple-600 transition-colors z-10 border border-purple-600"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Header */}
      <div className={`h-16 flex items-center ${isCollapsed ? 'justify-center px-0' : 'justify-start px-6 gap-3'} border-b border-purple-700/30 bg-purple-950/80 transition-all duration-300 overflow-hidden whitespace-nowrap`}>
        <div className="min-w-[32px] w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden shadow-lg shrink-0 bg-white">
          <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
        </div>
        <div className={`transition-opacity duration-300 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 w-auto'}`}>
          <h1 className="font-bold text-white text-base leading-none">CRM Pro</h1>
          <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Lead Master</span>
        </div>
      </div>

      {/* Scrollable Menu Area */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-4 scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-transparent">
        {menuGroups.map((group, index) => (
          <div key={index} className="space-y-1">
            {/* Group Title or Separator */}
            {!isCollapsed ? (
              <div className="px-3 mb-2 text-[11px] font-bold text-purple-300/70 uppercase tracking-widest truncate">
                {group.title}
              </div>
            ) : (
              <div className="h-px bg-purple-700/50 mx-2 my-2" title={group.title}></div>
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
                      ? 'bg-purple-600/40 text-white font-medium shadow-md shadow-purple-900/50 border border-purple-500/30'
                      : 'hover:bg-purple-700/30 hover:text-white'
                    }`
                  }
                >
                  {!isCollapsed && (
                    <span className="text-sm truncate">{item.label}</span>
                  )}

                  {/* Tooltip for collapsed mode specific override (optional if native title isn't enough) */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-purple-950 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-purple-600/50">
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
      <div className="p-3 border-t border-purple-700/30 bg-purple-950/50 overflow-hidden">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-2'} py-2 rounded-lg hover:bg-purple-700/30 cursor-pointer transition-colors`}>
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-bold shadow-lg text-sm shrink-0">
            AD
          </div>

          {!isCollapsed && (
            <div className="overflow-hidden min-w-[100px]">
              <p className="text-sm font-medium text-white truncate">Admin User</p>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <p className="text-xs text-purple-300/60">Đang hoạt động</p>
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