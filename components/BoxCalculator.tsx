import React, { useState, useEffect } from 'react';
// Icons removed per design request

const BoxCalculator: React.FC = () => {
  // Khổ giấy chuẩn
  const standardPaperSizes = [
    { name: 'A4 (21x29.7cm)', width: 21, height: 29.7 },
    { name: 'A3 (29.7x42cm)', width: 29.7, height: 42 },
    { name: 'A2 (42x59.4cm)', width: 42, height: 59.4 },
    { name: 'A1 (59.4x84.1cm)', width: 59.4, height: 84.1 },
    { name: '65x86cm', width: 65, height: 86 },
    { name: '70x100cm', width: 70, height: 100 },
    { name: '79x109cm', width: 79, height: 109 },
    { name: '90x120cm', width: 90, height: 120 },
    { name: '100x140cm', width: 100, height: 140 }
  ];

  // Inputs - Kích thước hộp
  const [boxSize, setBoxSize] = useState({ width: 20, height: 30, depth: 10 }); // cm
  const [quantity, setQuantity] = useState(1000);
  const [selectedPaperSize, setSelectedPaperSize] = useState<string>('auto');
  const [recommendedPaperSize, setRecommendedPaperSize] = useState<{ width: number; height: number; name?: string; isCustom?: boolean }>({ width: 0, height: 0 });
  const [recommendedPaperWeight, setRecommendedPaperWeight] = useState<{ weight: number; reason: string }>({ weight: 300, reason: '' });
  const [upsPerSheet, setUpsPerSheet] = useState(0);
  const [layoutInfo, setLayoutInfo] = useState<{ cols: number; rows: number; rotated: boolean }>({ cols: 0, rows: 0, rotated: false });
  
  // Vật liệu
  const [paperWeight, setPaperWeight] = useState(300); // gsm - Hộp cần giấy dày hơn
  const [isLaminated, setIsLaminated] = useState(false);
  const [hasInnerFlaps, setHasInnerFlaps] = useState(true); // Có nắp gấp trong
  
  // Đơn giá
  const [paperPricePerM2, setPaperPricePerM2] = useState(15000); // VND/m2 - Giấy hộp đắt hơn
  const [printCostPerM2, setPrintCostPerM2] = useState(8000);
  const [laminateCostPerM2, setLaminateCostPerM2] = useState(5000);
  const [gluingCostPerBox, setGluingCostPerBox] = useState(500);
  const [cuttingCostPerBox, setCuttingCostPerBox] = useState(300);

  // Outputs
  const [result, setResult] = useState({
    flatArea: 0,
    totalMaterialArea: 0,
    totalCost: 0,
    costPerUnit: 0
  });

  useEffect(() => {
    calculate();
  }, [boxSize, quantity, paperWeight, isLaminated, hasInnerFlaps, 
      paperPricePerM2, printCostPerM2, laminateCostPerM2, gluingCostPerBox, cuttingCostPerBox, selectedPaperSize]);

  const calculate = () => {
    const { width, height, depth } = boxSize;
    
    // Tính diện tích bế hộp (flat pattern)
    // Công thức: Diện tích các mặt + nắp gấp + lưỡi dán
    const topBottom = width * depth * 2; // Mặt trên + đáy
    const frontBack = width * height * 2; // Mặt trước + sau
    const leftRight = depth * height * 2; // Mặt trái + phải
    
    // Nắp gấp bên trong (nếu có)
    const innerFlaps = hasInnerFlaps ? (width * depth * 0.5) : 0;
    
    // Lưỡi dán (thêm 10% tổng diện tích)
    const glueTabs = (topBottom + frontBack + leftRight) * 0.1;
    
    // Tổng diện tích bế + 10% margin
    const flatAreaCm2 = topBottom + frontBack + leftRight + innerFlaps + glueTabs;
    const flatAreaWithMargin = flatAreaCm2 * 1.10;
    const flatAreaM2 = flatAreaWithMargin / 10000;
    
    // Tính khổ giấy đề xuất
    const flatWidth = (width * 2) + (depth * 2) + 3;
    const flatHeight = height + depth + 3;
    
    const standardPaperSizes = [
      { w: 21, h: 29.7, name: 'A4' }, 
      { w: 29.7, h: 42, name: 'A3' }, 
      { w: 42, h: 59.4, name: 'A2' },
      { w: 59.4, h: 84.1, name: 'A1' },
      { w: 65, h: 86, name: '65x86 cm' }, 
      { w: 70, h: 100, name: '70x100 cm' }, 
      { w: 79, h: 109, name: '79x109 cm' }, 
      { w: 90, h: 120, name: '90x120 cm' }, 
      { w: 100, h: 140, name: '100x140 cm' }
    ];
    
    let recommendedSize = { width: flatWidth, height: flatHeight, name: 'Đặc biệt', isCustom: true };
    
    if (selectedPaperSize !== 'auto') {
      const selectedSize = standardPaperSizes.find(s => s.name === selectedPaperSize);
      if (selectedSize) {
        recommendedSize = { width: selectedSize.w, height: selectedSize.h, name: selectedSize.name, isCustom: false };
      }
    } else {
      for (const size of standardPaperSizes) {
        if ((flatWidth <= size.w && flatHeight <= size.h) || (flatWidth <= size.h && flatHeight <= size.w)) {
          recommendedSize = { width: size.w, height: size.h, name: size.name, isCustom: false };
          break;
        }
      }
    }
    setRecommendedPaperSize(recommendedSize);
    
    // Gợi ý định lượng giấy cho hộp
    const boxVolume = width * height * depth;
    const maxDimension = Math.max(width, height, depth);
    
    let suggestedWeight = 300;
    let reason = '';
    
    if (boxVolume > 50000 || maxDimension > 50) {
      suggestedWeight = 400;
      reason = 'Hộp lớn, cần giấy duplex 400gsm để đảm bảo độ cứng';
    } else if (boxVolume > 20000 || maxDimension > 35) {
      suggestedWeight = 350;
      reason = 'Hộp trung bình, giấy 350gsm vừa đủ độ cứng';
    } else if (boxVolume > 8000 || maxDimension > 25) {
      suggestedWeight = 300;
      reason = 'Hộp vừa, giấy 300gsm là lựa chọn phổ biến';
    } else {
      suggestedWeight = 250;
      reason = 'Hộp nhỏ, giấy 250gsm nhẹ và tiết kiệm';
    }
    
    setRecommendedPaperWeight({ weight: suggestedWeight, reason });
    
    // Tính số hộp bế được trên 1 tờ giấy
    if (recommendedSize.width > 0 && recommendedSize.height > 0) {
      const boxFlatWidth = flatWidth;
      const boxFlatHeight = flatHeight;
      
      const option1_cols = Math.floor(recommendedSize.width / boxFlatWidth);
      const option1_rows = Math.floor(recommendedSize.height / boxFlatHeight);
      const option1_ups = option1_cols * option1_rows;
      
      const option2_cols = Math.floor(recommendedSize.width / boxFlatHeight);
      const option2_rows = Math.floor(recommendedSize.height / boxFlatWidth);
      const option2_ups = option2_cols * option2_rows;
      
      const bestUps = Math.max(option1_ups, option2_ups);
      const isRotated = option2_ups > option1_ups;
      
      setUpsPerSheet(bestUps);
      setLayoutInfo({
        cols: isRotated ? option2_cols : option1_cols,
        rows: isRotated ? option2_rows : option1_rows,
        rotated: isRotated
      });
    } else {
      setUpsPerSheet(0);
      setLayoutInfo({ cols: 0, rows: 0, rotated: false });
    }
    
    // Tổng diện tích vật liệu
    const wastePercentage = 1.05;
    const totalMaterialArea = flatAreaM2 * quantity * wastePercentage;
    
    // Chi phí
    const paperCost = totalMaterialArea * paperPricePerM2;
    const printingCost = totalMaterialArea * printCostPerM2;
    const laminatingCost = isLaminated ? totalMaterialArea * laminateCostPerM2 : 0;
    const gluingCost = quantity * gluingCostPerBox;
    const cuttingCost = quantity * cuttingCostPerBox;
    
    const total = paperCost + printingCost + laminatingCost + gluingCost + cuttingCost;
    
    setResult({
      flatArea: flatAreaM2,
      totalMaterialArea: totalMaterialArea,
      totalCost: total,
      costPerUnit: total / quantity
    });
  };

  const formatVND = (num: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);

  return (
    <div
      className="p-6 max-w-full mx-auto min-h-screen"
      style={{ background: 'linear-gradient(90deg, #FFFFFF 50%, #E6E6FA 100%)' }}
    >
      <div className="mb-8 flex items-start justify-between gap-6">
        <div className="space-y-2">
            <h2 className="text-3xl font-bold text-[#4F46E5]">Tính Giá Hộp Giấy</h2>
            <p className="text-[#1F2937] text-sm leading-relaxed">Tính toán diện tích bế và chi phí sản xuất hộp carton</p>
        </div>
        <div className="shrink-0">
          <button
            className="px-6 py-2 text-sm font-semibold text-white rounded-full shadow-lg"
            style={{ background: 'linear-gradient(90deg, #4CAF50 0%, #009688 100%)' }}
          >
            Đăng ký tư vấn
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Input Panel - Left */}
        <div className="xl:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-2xl shadow-xl border border-slate-200">
                <h3 className="font-bold text-base mb-3 text-slate-700 border-b pb-2">1. Kích thước hộp (cm)</h3>
                <div className="grid grid-cols-3 gap-3 mb-3">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Rộng (W)</label>
                        <input 
                          type="number" 
                          value={boxSize.width} 
                          onChange={e => setBoxSize({...boxSize, width: Number(e.target.value)})} 
                          className="w-full p-2 border rounded" 
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Cao (H)</label>
                        <input 
                          type="number" 
                          value={boxSize.height} 
                          onChange={e => setBoxSize({...boxSize, height: Number(e.target.value)})} 
                          className="w-full p-2 border rounded" 
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Sâu (D)</label>
                        <input 
                          type="number" 
                          value={boxSize.depth} 
                          onChange={e => setBoxSize({...boxSize, depth: Number(e.target.value)})} 
                          className="w-full p-2 border rounded" 
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-3">
                    <div>
                         <label className="block text-xs font-medium text-slate-500 mb-1">Số lượng hộp</label>
                         <input 
                           type="number" 
                           value={quantity} 
                           onChange={e => setQuantity(Number(e.target.value))} 
                           className="w-full p-2 border rounded" 
                         />
                    </div>
                    <div>
                         <label className="block text-xs font-medium text-slate-500 mb-1">Chọn khổ giấy</label>
                         <select
                           value={selectedPaperSize}
                           onChange={e => setSelectedPaperSize(e.target.value)}
                           className="w-full p-2 border rounded bg-white"
                         >
                           <option value="auto">Tự động gợi ý</option>
                           {standardPaperSizes.map((size, idx) => (
                             <option key={idx} value={size.name}>
                               {size.name}
                             </option>
                           ))}
                         </select>
                    </div>
                </div>
                
                {/* Gợi ý khổ giấy */}
                {recommendedPaperSize.width > 0 && (
                  <div className={`mt-3 rounded-lg p-3 ${
                    recommendedPaperSize.isCustom 
                      ? 'bg-red-50 border border-red-200' 
                      : 'bg-blue-50 border border-blue-200'
                  }`}>
                    <div className="flex flex-col gap-1">
                        <p className={`text-sm font-semibold ${
                          recommendedPaperSize.isCustom ? 'text-red-800' : 'text-blue-800'
                        }`}>
                          {recommendedPaperSize.isCustom ? 'Khổ giấy đặc biệt:' : 'Khổ giấy đề xuất:'}
                        </p>
                        <p className={`text-lg font-bold ${
                          recommendedPaperSize.isCustom ? 'text-red-900' : 'text-blue-900'
                        }`}>
                          {recommendedPaperSize.name || `${Math.ceil(recommendedPaperSize.width)} x ${Math.ceil(recommendedPaperSize.height)} cm`}
                        </p>
                        <p className={`text-xs ${
                          recommendedPaperSize.isCustom ? 'text-red-700' : 'text-blue-700'
                        }`}>
                          {recommendedPaperSize.isCustom 
                            ? 'Cần đặt khổ giấy đặc biệt - không có khổ chuẩn phù hợp'
                            : 'Khổ giấy chuẩn phù hợp nhất để bế hộp này'}
                        </p>
                        {upsPerSheet > 0 && (
                          <div className={`mt-2 pt-2 border-t ${
                            recommendedPaperSize.isCustom ? 'border-red-200' : 'border-blue-200'
                          }`}>
                            <p className={`text-sm font-bold ${
                              recommendedPaperSize.isCustom ? 'text-red-800' : 'text-blue-800'
                            }`}>
                              Bình file: <span className="text-xl">{upsPerSheet}</span> hộp/tờ
                            </p>
                            <p className={`text-xs ${
                              recommendedPaperSize.isCustom ? 'text-red-600' : 'text-blue-600'
                            }`}>
                              Cần {Math.ceil(quantity / upsPerSheet)} tờ giấy để bế {quantity} hộp
                            </p>
                          </div>
                        )}
                    </div>
                  </div>
                )}
                
                {/* Gợi ý định lượng giấy */}
                {recommendedPaperWeight.reason && (
                  <div className="mt-3 bg-cyan-50 border border-cyan-200 rounded-lg p-3">
                    <div className="flex flex-col gap-1">
                        <p className="text-sm font-semibold text-cyan-800">Định lượng giấy đề xuất:</p>
                        <p className="text-lg font-bold text-cyan-900">
                          {recommendedPaperWeight.weight} gsm
                          <span className="text-sm font-normal ml-2">
                            (Giấy duplex/ivory)
                          </span>
                        </p>
                        <p className="text-xs text-cyan-700 mt-1">
                          {recommendedPaperWeight.reason}
                        </p>
                    </div>
                  </div>
                )}
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-xl border border-slate-200">
                <h3 className="font-bold text-base mb-3 text-slate-700 border-b pb-2">2. Vật liệu & Gia công</h3>
                <div className="grid grid-cols-2 gap-3 mb-3">
                     <div>
                         <label className="block text-xs font-medium text-slate-500 mb-1">Định lượng giấy (gsm)</label>
                         <input 
                           type="number" 
                           value={paperWeight} 
                           onChange={e => setPaperWeight(Number(e.target.value))} 
                           className="w-full p-2 border rounded" 
                           placeholder="250, 300, 350..." 
                         />
                    </div>
                </div>
                <div className="space-y-2">
                     <div className="flex items-center gap-2">
                         <input 
                           type="checkbox" 
                           id="laminated" 
                           checked={isLaminated} 
                           onChange={e => setIsLaminated(e.target.checked)} 
                           className="w-4 h-4" 
                         />
                         <label htmlFor="laminated" className="text-sm text-slate-700">Có cán màng bóng/mờ</label>
                     </div>
                     <div className="flex items-center gap-2">
                         <input 
                           type="checkbox" 
                           id="innerFlaps" 
                           checked={hasInnerFlaps} 
                           onChange={e => setHasInnerFlaps(e.target.checked)} 
                           className="w-4 h-4" 
                         />
                         <label htmlFor="innerFlaps" className="text-sm text-slate-700">Có nắp gấp bên trong</label>
                     </div>
                </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-xl border border-slate-200">
                <h3 className="font-bold text-base mb-3 text-slate-700 border-b pb-2">3. Đơn giá sản xuất</h3>
                <div className="grid grid-cols-2 gap-3">
                     <div>
                         <label className="block text-xs font-medium text-slate-500 mb-1">Giá giấy / m² (VNĐ)</label>
                         <input 
                           type="number" 
                           value={paperPricePerM2} 
                           onChange={e => setPaperPricePerM2(Number(e.target.value))} 
                           className="w-full p-2 border rounded" 
                         />
                    </div>
                    <div>
                         <label className="block text-xs font-medium text-slate-500 mb-1">Công in / m² (VNĐ)</label>
                         <input 
                           type="number" 
                           value={printCostPerM2} 
                           onChange={e => setPrintCostPerM2(Number(e.target.value))} 
                           className="w-full p-2 border rounded" 
                         />
                    </div>
                    <div>
                         <label className="block text-xs font-medium text-slate-500 mb-1">Cán màng / m² (VNĐ)</label>
                         <input 
                           type="number" 
                           value={laminateCostPerM2} 
                           onChange={e => setLaminateCostPerM2(Number(e.target.value))} 
                           className="w-full p-2 border rounded" 
                         />
                    </div>
                    <div>
                         <label className="block text-xs font-medium text-slate-500 mb-1">Công dán / hộp (VNĐ)</label>
                         <input 
                           type="number" 
                           value={gluingCostPerBox} 
                           onChange={e => setGluingCostPerBox(Number(e.target.value))} 
                           className="w-full p-2 border rounded" 
                         />
                    </div>
                    <div>
                         <label className="block text-xs font-medium text-slate-500 mb-1">Công bế / hộp (VNĐ)</label>
                         <input 
                           type="number" 
                           value={cuttingCostPerBox} 
                           onChange={e => setCuttingCostPerBox(Number(e.target.value))} 
                           className="w-full p-2 border rounded" 
                         />
                    </div>
                </div>
            </div>
        </div>
            
        {/* Middle Column - Ảnh trải hộp */}
        <div className="xl:col-span-4">
          <div className="bg-white p-4 rounded-2xl shadow-2xl border border-slate-200 h-full">
                <h3 className="font-bold text-base mb-3 text-slate-700 border-b pb-2">Ảnh trải hộp (Flat Pattern)</h3>
                <div className="bg-slate-50 rounded-lg p-6">
                  <p className="text-sm font-semibold text-slate-700 mb-3 text-center">Bản trải hộp trên mặt phẳng</p>
                  <svg width="100%" height="240" viewBox="0 0 300 200" className="mx-auto" preserveAspectRatio="xMidYMid meet">
                    {/* Main box flat layout */}
                    <rect x="40" y="60" width="50" height="70" fill="#bfdbfe" stroke="#2563eb" strokeWidth="2"/>
                    <rect x="90" y="60" width="70" height="70" fill="#93c5fd" stroke="#2563eb" strokeWidth="2"/>
                    <rect x="160" y="60" width="50" height="70" fill="#bfdbfe" stroke="#2563eb" strokeWidth="2"/>
                    <rect x="210" y="60" width="70" height="70" fill="#93c5fd" stroke="#2563eb" strokeWidth="2"/>
                    
                    {/* Top flap */}
                    <rect x="90" y="25" width="70" height="35" fill="#dbeafe" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="3"/>
                    <rect x="210" y="25" width="70" height="35" fill="#dbeafe" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="3"/>
                    
                    {/* Bottom */}
                    <rect x="90" y="130" width="70" height="50" fill="#60a5fa" stroke="#2563eb" strokeWidth="2"/>
                    <rect x="210" y="130" width="70" height="50" fill="#60a5fa" stroke="#2563eb" strokeWidth="2"/>
                    
                    {/* Glue tabs */}
                    <path d="M 40 60 L 30 65 L 30 125 L 40 130" fill="#e0f2fe" stroke="#2563eb" strokeWidth="1" strokeDasharray="2"/>
                    
                    {/* Labels */}
                    <text x="125" y="100" fill="#1e3a8a" fontSize="9" fontWeight="bold" textAnchor="middle">Mặt</text>
                    <text x="245" y="100" fill="#1e3a8a" fontSize="9" fontWeight="bold" textAnchor="middle">Mặt</text>
                    <text x="65" y="100" fill="#1e3a8a" fontSize="8" textAnchor="middle">Hông</text>
                    <text x="185" y="100" fill="#1e3a8a" fontSize="8" textAnchor="middle">Hông</text>
                    <text x="125" y="158" fill="#1e40af" fontSize="8" fontWeight="bold" textAnchor="middle">Đáy</text>
                  </svg>
                </div>
            </div>
        </div>

        {/* Result Panel - Right */}
        <div className="xl:col-span-3">
            <div className="bg-gradient-to-br from-[#4F46E5] to-[#5C6BC0] text-white p-5 rounded-xl shadow-lg sticky top-6">
                <h3 className="text-lg font-bold mb-4 border-b border-blue-600 pb-3">Kết quả tính giá</h3>
                
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-blue-200 text-xs">Diện tích bế / hộp</span>
                        <span className="text-xl font-bold text-white">{result.flatArea.toFixed(3)} <span className="text-xs text-blue-300 font-normal">m²</span></span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-blue-200 text-xs">Tổng diện tích vật liệu</span>
                        <span className="text-lg font-bold">{result.totalMaterialArea.toFixed(2)} <span className="text-xs text-blue-300 font-normal">m²</span></span>
                    </div>
                    
                    <div className="border-t border-blue-600 pt-4 mt-4">
                        <div className="mb-2 text-blue-200 text-xs">Tổng chi phí ước tính</div>
                        <div className="text-2xl font-bold text-yellow-300">{formatVND(result.totalCost)}</div>
                    </div>

                    <div className="bg-blue-800/50 p-3 rounded-lg mt-3">
                      <div className="text-blue-200 text-xs mb-1">Giá thành mỗi hộp</div>
                      <div className="text-lg font-bold text-white">{formatVND(result.costPerUnit)}</div>
                    </div>
                </div>

                  <div className="mt-6 bg-blue-800/30 p-3 rounded text-xs text-blue-100">
                    <span>Giá ước tính. Chưa bao gồm VAT, vận chuyển.</span>
                  </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default BoxCalculator;
