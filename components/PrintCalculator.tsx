import React, { useState, useEffect } from 'react';
import { Calculator, AlertCircle } from 'lucide-react';

const PrintCalculator: React.FC = () => {
  // Inputs
  const [paperSize, setPaperSize] = useState({ width: 65, height: 86 }); // cm
  const [productSize, setProductSize] = useState({ width: 10, height: 15 }); // cm
  const [quantity, setQuantity] = useState(1000);
  const [bleed, setBleed] = useState(0.2); // cm
  const [paperPricePerSheet, setPaperPricePerSheet] = useState(2500); // VND
  const [printCostPerSheet, setPrintCostPerSheet] = useState(1500); // VND
  const [processingCost, setProcessingCost] = useState(100000); // VND (Flat fee)

  // Outputs
  const [result, setResult] = useState({
    upsPerSheet: 0,
    totalSheets: 0,
    totalCost: 0,
    costPerUnit: 0
  });

  useEffect(() => {
    calculate();
  }, [paperSize, productSize, quantity, bleed, paperPricePerSheet, printCostPerSheet, processingCost]);

  const calculate = () => {
    // Effective product size including bleed and gap (simplified gap = bleed * 2)
    const effectiveW = productSize.width + (bleed * 2);
    const effectiveH = productSize.height + (bleed * 2);

    // Option 1: Normal orientation
    const cols1 = Math.floor(paperSize.width / effectiveW);
    const rows1 = Math.floor(paperSize.height / effectiveH);
    const ups1 = cols1 * rows1;

    // Option 2: Rotated orientation
    const cols2 = Math.floor(paperSize.width / effectiveH);
    const rows2 = Math.floor(paperSize.height / effectiveW);
    const ups2 = cols2 * rows2;

    const bestUps = Math.max(ups1, ups2);

    if (bestUps === 0) {
      setResult({ upsPerSheet: 0, totalSheets: 0, totalCost: 0, costPerUnit: 0 });
      return;
    }

    // Need some waste allowance (bù hao) - simplified 5%
    const wastePercentage = 1.05;
    const sheetsNeeded = Math.ceil((quantity / bestUps) * wastePercentage);
    
    const paperCost = sheetsNeeded * paperPricePerSheet;
    const printingCost = sheetsNeeded * printCostPerSheet;
    
    const total = paperCost + printingCost + processingCost;
    
    setResult({
      upsPerSheet: bestUps,
      totalSheets: sheetsNeeded,
      totalCost: total,
      costPerUnit: total / quantity
    });
  };

  const formatVND = (num: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <div className="p-3 bg-accent/10 rounded-lg text-accent">
            <Calculator size={32} />
        </div>
        <div>
            <h2 className="text-2xl font-bold text-slate-800">Tool Bình File & Báo Giá</h2>
            <p className="text-slate-500 text-sm">Tính toán số lượng con in trên khổ giấy và chi phí ước tính</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Panel */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-lg mb-4 text-slate-700 border-b pb-2">1. Thông số sản phẩm & Giấy</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Khổ giấy in (cm)</label>
                        <div className="flex items-center gap-2">
                            <input type="number" value={paperSize.width} onChange={e => setPaperSize({...paperSize, width: Number(e.target.value)})} className="w-full p-2 border rounded" placeholder="Rộng" />
                            <span className="text-slate-400">x</span>
                            <input type="number" value={paperSize.height} onChange={e => setPaperSize({...paperSize, height: Number(e.target.value)})} className="w-full p-2 border rounded" placeholder="Dài" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Kích thước thành phẩm (cm)</label>
                        <div className="flex items-center gap-2">
                            <input type="number" value={productSize.width} onChange={e => setProductSize({...productSize, width: Number(e.target.value)})} className="w-full p-2 border rounded" placeholder="Rộng" />
                            <span className="text-slate-400">x</span>
                            <input type="number" value={productSize.height} onChange={e => setProductSize({...productSize, height: Number(e.target.value)})} className="w-full p-2 border rounded" placeholder="Dài" />
                        </div>
                    </div>
                    <div>
                         <label className="block text-xs font-medium text-slate-500 mb-1">Số lượng cần in</label>
                         <input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="w-full p-2 border rounded" />
                    </div>
                    <div>
                         <label className="block text-xs font-medium text-slate-500 mb-1">Tràn lề (Bleed) (cm)</label>
                         <input type="number" value={bleed} onChange={e => setBleed(Number(e.target.value))} className="w-full p-2 border rounded" step="0.1" />
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-lg mb-4 text-slate-700 border-b pb-2">2. Đơn giá sản xuất</h3>
                <div className="grid grid-cols-3 gap-4">
                     <div>
                         <label className="block text-xs font-medium text-slate-500 mb-1">Giá giấy / tờ</label>
                         <input type="number" value={paperPricePerSheet} onChange={e => setPaperPricePerSheet(Number(e.target.value))} className="w-full p-2 border rounded" />
                    </div>
                    <div>
                         <label className="block text-xs font-medium text-slate-500 mb-1">Công in / lượt</label>
                         <input type="number" value={printCostPerSheet} onChange={e => setPrintCostPerSheet(Number(e.target.value))} className="w-full p-2 border rounded" />
                    </div>
                    <div>
                         <label className="block text-xs font-medium text-slate-500 mb-1">Gia công sau in (Cán/Cắt)</label>
                         <input type="number" value={processingCost} onChange={e => setProcessingCost(Number(e.target.value))} className="w-full p-2 border rounded" />
                    </div>
                </div>
            </div>
        </div>

        {/* Result Panel */}
        <div className="lg:col-span-1">
            <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg sticky top-6">
                <h3 className="text-xl font-bold mb-6 border-b border-slate-700 pb-4">Kết quả tính giá</h3>
                
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-sm">Số con / tờ in</span>
                        <span className="text-2xl font-bold text-accent">{result.upsPerSheet} <span className="text-sm text-slate-500 font-normal">con</span></span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-sm">Tổng tờ giấy in (có bù hao)</span>
                        <span className="text-xl font-bold">{result.totalSheets} <span className="text-sm text-slate-500 font-normal">tờ</span></span>
                    </div>
                    
                    <div className="border-t border-slate-700 pt-6 mt-6">
                        <div className="mb-2 text-slate-400 text-sm">Tổng chi phí ước tính</div>
                        <div className="text-3xl font-bold text-green-400">{formatVND(result.totalCost)}</div>
                    </div>

                    <div className="bg-slate-800 p-4 rounded-lg mt-4">
                        <div className="text-slate-400 text-xs mb-1">Giá thành mỗi sản phẩm</div>
                        <div className="text-xl font-bold text-white">{formatVND(result.costPerUnit)}</div>
                    </div>
                </div>

                <div className="mt-8 flex items-start gap-2 bg-slate-800/50 p-3 rounded text-xs text-slate-400">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span>Lưu ý: Giá trên chỉ là ước tính dựa trên thông số nhập vào. Chưa bao gồm VAT và vận chuyển.</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PrintCalculator;