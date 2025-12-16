import React from 'react';

const HexagramSymbol = ({ upper, lower, size = "md" }) => {
    const trigramLines = {
        '1': [1, 1, 1], '2': [0, 1, 1], '3': [1, 0, 1], '4': [0, 0, 1],
        '5': [1, 1, 0], '6': [0, 1, 0], '7': [1, 0, 0], '8': [0, 0, 0]
    };

    const widthClass = size === "sm" ? "w-12" : size === "md" ? "w-24 md:w-32" : "w-16";
    const heightClass = size === "sm" ? "h-1.5" : size === "md" ? "h-3" : "h-2";
    const gapClass = size === "sm" ? "my-0.5" : size === "md" ? "my-1.5" : "my-1";

    const renderLine = (isYang, idx) => (
        <div key={idx} className={`w-full ${heightClass} flex justify-between ${gapClass}`}>
            {isYang ? (
                <div className="w-full h-full bg-slate-800/80 rounded-sm shadow-sm"></div>
            ) : (
                <>
                    <div className="w-[45%] h-full bg-slate-800/80 rounded-sm shadow-sm"></div>
                    <div className="w-[45%] h-full bg-slate-800/80 rounded-sm shadow-sm"></div>
                </>
            )}
        </div>
    );

    return (
        <div className={`flex flex-col ${widthClass} opacity-90 mix-blend-multiply transition-all duration-500 cursor-pointer`}>
            {trigramLines[upper]?.map((line, i) => renderLine(line, `u-${i}`))}
            <div className={size === "sm" ? "h-1" : size === "md" ? "h-4" : "h-2"}></div>
            {trigramLines[lower]?.map((line, i) => renderLine(line, `l-${i}`))}
        </div>
    );
};

export default HexagramSymbol;
