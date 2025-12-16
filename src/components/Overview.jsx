import React from 'react';
import { Leaf } from 'lucide-react';
import HexagramSymbol from './HexagramSymbol';
import { SEASON_MASTERS, MENG_XI_SEQUENCE, ALL_HEXAGRAMS } from '../data';
import { getSolarTerm, calculateDateRangeForIndex } from '../utils';

const Overview = ({ onSelectGua, onSelectMaster }) => {
    const currentYear = new Date().getFullYear();
    // 分組：每 15 個卦為一季 (冬: 坎, 春: 震, 夏: 離, 秋: 兌)
    const quarters = [
        { title: '冬季 Winter', master: SEASON_MASTERS.winter, range: [0, 15] },
        { title: '春季 Spring', master: SEASON_MASTERS.spring, range: [15, 30] },
        { title: '夏季 Summer', master: SEASON_MASTERS.summer, range: [30, 45] },
        { title: '秋季 Autumn', master: SEASON_MASTERS.autumn, range: [45, 60] }
    ];

    const getSolarTermForIndex = (startDate) => {
        return getSolarTerm(startDate);
    };

    return (
        <div className="w-full max-w-6xl mx-auto p-4 md:p-8 animate-in fade-in duration-700">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-serif text-slate-700 mb-2">歲時全覽</h2>
                <p className="text-sm text-slate-500 tracking-widest uppercase">The Cycle of 60 Hexagrams</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {quarters.map((quarter, qIdx) => (
                    <div key={qIdx} className={`rounded-3xl p-6 bg-gradient-to-b ${quarter.master.color} border border-white/60 shadow-lg backdrop-blur-sm`}>
                        {/* 季節主卦 Header - 可點擊 */}
                        <div
                            className="flex flex-col items-center mb-8 pb-6 border-b border-slate-400/20 cursor-pointer group hover:bg-white/30 rounded-xl transition-all p-2"
                            onClick={() => onSelectMaster(quarter.master.id)}
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <quarter.master.icon className="w-4 h-4 text-slate-500" />
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{quarter.title}</div>
                            </div>
                            <div className="mb-4 transform scale-75 group-hover:scale-90 transition-transform duration-500">
                                <HexagramSymbol upper={quarter.master.upper} lower={quarter.master.lower} size="md" />
                            </div>
                            <h3 className="text-2xl font-serif text-slate-800">{quarter.master.name}</h3>
                            <p className="text-xs text-slate-500 mt-1">{quarter.master.desc}</p>
                            <span className="text-[10px] mt-2 bg-white/50 px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-slate-500">點擊查看主卦詳解</span>
                        </div>

                        {/* 六十卦列表 */}
                        <div className="space-y-3">
                            {MENG_XI_SEQUENCE.slice(quarter.range[0], quarter.range[1]).map((guaId, idx) => {
                                const absIndex = quarter.range[0] + idx;
                                const { startDate } = calculateDateRangeForIndex(absIndex, currentYear - (new Date().getMonth() < 11 ? 1 : 0)); // 簡易處理跨年
                                const info = ALL_HEXAGRAMS[guaId];
                                const solarTerm = getSolarTermForIndex(startDate);

                                const isTermStart = idx === 0 || solarTerm !== getSolarTermForIndex(calculateDateRangeForIndex(absIndex - 1, currentYear - (new Date().getMonth() < 11 ? 1 : 0)).startDate);

                                return (
                                    <div key={idx} className="flex items-center gap-3 p-2 hover:bg-white/40 rounded-lg transition-colors group cursor-pointer" onClick={() => onSelectGua(absIndex)}>
                                        <div className="opacity-60 group-hover:opacity-100 transition-opacity">
                                            <HexagramSymbol upper={info.u} lower={info.l} size="sm" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center">
                                                <span className="font-serif text-slate-700">{info.name}</span>
                                                <span className="text-[10px] text-slate-400 font-mono">
                                                    {startDate.getMonth() + 1}/{startDate.getDate()}
                                                </span>
                                            </div>
                                            {isTermStart && (
                                                <div className="text-[10px] text-amber-600/80 font-medium mt-0.5 flex items-center gap-1">
                                                    <Leaf className="w-2 h-2" /> {solarTerm}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Overview;
