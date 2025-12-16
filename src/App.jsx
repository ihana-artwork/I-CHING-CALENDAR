import React, { useState, useEffect } from 'react';
import { Wind, Heart, Compass, Sparkles, Leaf, Grid, Layout, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import P5Background from './components/P5Background';
import HexagramSymbol from './components/HexagramSymbol';
import Overview from './components/Overview';
import { getWinterSolstice, calculateGua, generateGuaInfo } from './utils';

export default function App() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [gua, setGua] = useState(null); // 當前顯示的卦
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('calendar'); // 'calendar', 'overview', 'master'
    const [masterMode, setMasterMode] = useState(false); // 是否在查看主卦詳情

    useEffect(() => {
        // 只有在非 master 模式下才根據日期計算卦象
        if (!masterMode) {
            setLoading(true);
            const timer = setTimeout(() => {
                const calc = calculateGua(currentDate);
                const info = generateGuaInfo(calc.id);
                setGua({ ...calc, ...info });
                setLoading(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [currentDate, masterMode]);

    const handleDateChange = (days) => {
        setMasterMode(false); // 切換日期時退出主卦模式
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + days);
        setCurrentDate(newDate);
    };

    const handleSelectGuaFromOverview = (index) => {
        setMasterMode(false);
        const currentYear = new Date().getFullYear();
        const refSolstice = getWinterSolstice(currentYear - (new Date().getMonth() < 11 ? 1 : 0));
        const targetDate = new Date(refSolstice);
        targetDate.setDate(refSolstice.getDate() + Math.floor(index * 6.0875) + 1);

        setCurrentDate(targetDate);
        setView('calendar');
    };

    const handleSelectMasterGua = (id) => {
        setLoading(true);
        setTimeout(() => {
            // 直接使用 generateGuaInfo 獲取主卦詳情 (ID 29, 30, 51, 58)
            const info = generateGuaInfo(id);
            // 主卦沒有特定日期區間，我們可以給一個標記
            setGua({ ...info, solarTerm: 'Seasonal Ruler' });
            setMasterMode(true);
            setView('calendar'); // 使用日曆的詳細視圖來顯示
            setLoading(false);
        }, 300);
    };

    const formatDate = (d) => `${d.getMonth() + 1}/${d.getDate()}`;

    if (!gua) return <div className="min-h-screen bg-stone-50 flex items-center justify-center text-stone-400">載入天時...</div>;

    return (
        <div className="relative min-h-screen font-sans text-slate-700 overflow-hidden selection:bg-teal-100 selection:text-teal-900 overflow-y-auto">

            <P5Background upper={gua.upper} lower={gua.lower} />

            {/* 頂部導航 */}
            <nav className="relative z-20 p-4 sm:p-6 flex justify-between items-center bg-gradient-to-b from-white/20 to-transparent">
                <div className="flex items-center gap-2 sm:gap-3 cursor-pointer group" onClick={() => {
                    setView('calendar');
                    setMasterMode(false);
                    setCurrentDate(new Date());
                }}>
                    <div className="bg-white/40 p-2 sm:p-2.5 rounded-full backdrop-blur-md shadow-sm border border-white/50 group-hover:bg-white/60 transition-all">
                        <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-serif text-base sm:text-lg tracking-widest text-slate-800">孟喜卦氣</span>
                        <span className="text-[9px] sm:text-[10px] text-slate-500 tracking-wider uppercase hidden sm:block">Generative Calendar</span>
                        <a
                            href="https://www.facebook.com/groups/happyihana"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[9px] sm:text-[10px] text-slate-400/80 hover:text-amber-600/80 transition-colors mt-0.5 tracking-wider font-light no-underline z-50"
                            onClick={(e) => e.stopPropagation()}
                        >
                            © 純在喜悅祝福圈
                        </a>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                    {view === 'calendar' && (
                        <div className="flex items-center gap-2 sm:gap-4 bg-white/40 px-3 py-2 sm:px-5 sm:py-2.5 rounded-full backdrop-blur-md border border-white/40 shadow-sm transition-all duration-500">
                            {/* 如果是主卦模式，隱藏前後切換與日期，只顯示標題 */}
                            {!masterMode ? (
                                <>
                                    <button onClick={() => handleDateChange(-7)} className="hover:bg-white/50 p-1 sm:p-1.5 rounded-full transition-colors text-slate-600">
                                        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </button>
                                    <div className="flex flex-col items-center min-w-[90px] sm:min-w-[110px]">
                                        <span className="text-xs sm:text-sm font-medium text-slate-800 tracking-wide font-serif">
                                            {currentDate.getFullYear()} / {currentDate.getMonth() + 1} / {currentDate.getDate()}
                                        </span>
                                        <div className="flex items-center gap-1 sm:gap-1.5">
                                            <span className="text-[9px] sm:text-[10px] text-slate-500 font-medium">
                                                {formatDate(gua.startDate)} - {formatDate(gua.endDate)}
                                            </span>
                                            <span className="text-[9px] sm:text-[10px] bg-amber-100/80 text-amber-700 px-1 sm:px-1.5 py-0.5 rounded-full font-bold">
                                                {gua.solarTerm}
                                            </span>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDateChange(7)} className="hover:bg-white/50 p-1 sm:p-1.5 rounded-full transition-colors text-slate-600">
                                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </button>
                                </>
                            ) : (
                                <div className="flex items-center gap-2 px-4">
                                    <Leaf className="w-4 h-4 text-emerald-600" />
                                    <span className="text-sm font-serif text-slate-700 tracking-wider">季節主宰 • {gua.name}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {view === 'overview' && (
                        <div className="hidden sm:block px-5 py-2.5">
                            <span className="text-sm font-serif text-slate-600 italic">Select a hexagram to view details</span>
                        </div>
                    )}

                    <button
                        onClick={() => setView(view === 'calendar' ? 'overview' : 'calendar')}
                        className="flex items-center gap-2 bg-white/40 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full backdrop-blur-md border border-white/40 shadow-sm hover:bg-white/60 transition-all text-slate-700 text-xs sm:text-sm font-medium"
                    >
                        {view === 'calendar' ? <><Grid className="w-4 h-4 sm:w-4 sm:h-4" /> <span>總覽</span></> : <><Layout className="w-4 h-4 sm:w-4 sm:h-4" /> <span>曆法</span></>}
                    </button>
                </div>
            </nav>

            {/* 主要內容區 */}
            {view === 'calendar' ? (
                <main className={`relative z-10 max-w-5xl mx-auto px-6 py-4 flex flex-col items-center justify-center min-h-[80vh] transition-all duration-700 ${loading ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
                    <div className="w-full bg-white/30 backdrop-blur-2xl rounded-[2.5rem] border border-white/50 shadow-2xl overflow-hidden grid md:grid-cols-5 min-h-[500px]">
                        {/* 左側：視覺區 */}
                        <div className="md:col-span-2 p-10 flex flex-col items-center justify-center bg-gradient-to-b from-white/40 to-transparent border-b md:border-b-0 md:border-r border-white/30 relative">
                            <div className="absolute top-6 left-6 text-xs font-bold text-slate-400/80 uppercase tracking-widest border border-slate-300/50 px-2 py-1 rounded-md">
                                No. {gua.id}
                            </div>

                            <div className="mb-8 relative group cursor-pointer" title="點擊深呼吸">
                                <div className="absolute inset-0 bg-white/30 rounded-full blur-3xl scale-75 animate-pulse-slow"></div>
                                <HexagramSymbol upper={gua.upper} lower={gua.lower} />
                            </div>

                            <div className="text-center z-10">
                                <h1 className="text-6xl font-serif text-slate-800 mb-1 tracking-tight">{gua.name}</h1>
                                <p className="text-sm tracking-[0.3em] text-slate-500 uppercase font-light mb-6 ml-1">{gua.pinyin}</p>
                                <div className="flex flex-wrap justify-center gap-2">
                                    {gua.keywords.map(k => (
                                        <span key={k} className="px-3 py-1 bg-white/60 rounded-full text-xs text-slate-600 border border-white/40 shadow-sm backdrop-blur-sm">
                                            {k}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 右側：內容區 */}
                        <div className="md:col-span-3 p-10 md:p-14 flex flex-col justify-center bg-white/10">
                            <div className="mb-10">
                                <div className="flex items-center gap-2 mb-4 opacity-70">
                                    {masterMode ? <Sparkles className="w-4 h-4 text-purple-500" /> : <Leaf className="w-4 h-4 text-emerald-600" />}
                                    <span className="text-xs font-bold tracking-widest text-slate-500 uppercase">
                                        {masterMode ? 'Master Energy' : `${gua.solarTerm} Season`}
                                    </span>
                                </div>
                                <p className="text-2xl font-serif text-slate-700 leading-relaxed">
                                    {gua.desc}
                                </p>
                            </div>

                            <div className="grid gap-8">
                                <div className="flex gap-5 group cursor-default">
                                    <div className="mt-1 bg-teal-100/50 p-2 rounded-xl h-fit group-hover:bg-teal-100 transition-colors">
                                        <Heart className="w-5 h-5 text-teal-700" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-600 mb-1">身體掃描 Body Scan</h4>
                                        <p className="text-sm text-slate-500 leading-6">{gua.body}</p>
                                    </div>
                                </div>

                                <div className="flex gap-5 group cursor-default">
                                    <div className="mt-1 bg-indigo-100/50 p-2 rounded-xl h-fit group-hover:bg-indigo-100 transition-colors">
                                        <Wind className="w-5 h-5 text-indigo-700" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-600 mb-1">靈性指引 Spirit Guide</h4>
                                        <p className="text-sm text-slate-500 leading-6">{gua.mind}</p>
                                    </div>
                                </div>

                                <div className="flex gap-5 group cursor-default">
                                    <div className="mt-1 bg-amber-100/50 p-2 rounded-xl h-fit group-hover:bg-amber-100 transition-colors">
                                        <Compass className="w-5 h-5 text-amber-700" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-600 mb-1">決策建議 Decision</h4>
                                        <p className="text-sm text-slate-500 leading-6">{gua.decision}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {!masterMode && (
                        <div className="mt-10 flex items-center justify-center gap-2 text-xs text-slate-400/80 font-light tracking-widest">
                            <Info className="w-3 h-3" />
                            <span>孟喜六日七分法 • 順應四時 • 頤養身心</span>
                        </div>
                    )}
                </main>
            ) : (
                <Overview onSelectGua={handleSelectGuaFromOverview} onSelectMaster={handleSelectMasterGua} />
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes pulse-slow {
          0%, 100% { transform: scale(0.95); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 6s ease-in-out infinite;
        }
        .animate-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
        </div>
    );
}
