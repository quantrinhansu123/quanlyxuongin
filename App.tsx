import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import LeadManagement from './components/LeadManagement';
import SalesAllocation from './components/SalesAllocation';
import DesignLibrary from './components/DesignLibrary';
import Dashboard from './components/Dashboard';
import PrintLayoutCalculator from './components/PrintLayoutCalculator';
import BoxCalculator from './components/BoxCalculator';
import PaperBagCalculator from './components/PaperBagCalculator';
import BagImageCustomizer from './components/BagImageCustomizer';
import AIBagGenerator from './components/AIBagGenerator';
import LeadSourceManagement from './components/LeadSourceManagement';
import HRManagement from './components/HRManagement';
import DesignTasks from './components/DesignTasks';
import OrderManagement from './components/OrderManagement';

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="flex h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<LeadManagement />} />
            <Route path="/orders" element={<OrderManagement />} />
            <Route path="/sales-allocation" element={<SalesAllocation />} />
            <Route path="/designs" element={<DesignLibrary />} />
            <Route path="/design-tasks" element={<DesignTasks />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/print-layout" element={<PrintLayoutCalculator />} />
              <Route path="/box-calculator" element={<BoxCalculator />} />
            <Route path="/bag-calculator" element={<PaperBagCalculator />} />
            <Route path="/bag-image-customizer" element={<BagImageCustomizer />} />
            <Route path="/ai-bag-generator" element={<AIBagGenerator />} />
            <Route path="/lead-sources" element={<LeadSourceManagement />} />
            <Route path="/hr" element={<HRManagement />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;