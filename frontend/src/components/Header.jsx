import React from 'react';

export default function Header() {
  return (
    <header
      className="sticky top-0 z-20"
      style={{
        background: 'rgba(249,242,215,0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: '0 1px 0 rgba(240,224,200,0.8)',
      }}
    >
      <div className="max-w-[1100px] mx-auto px-10 h-[72px] flex items-center">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-full flex-shrink-0 overflow-hidden"
            style={{
              background: 'rgba(244,224,151,0.4)',
              boxShadow: '0 3px 12px rgba(0,0,0,0.10)',
            }}
          >
            <img
              src="/logo-cat.png"
              alt="西米"
              className="w-full h-full object-cover"
              style={{ mixBlendMode: 'multiply' }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement.querySelector('.cat-fb').style.display = 'flex';
              }}
            />
            <div className="cat-fb w-full h-full items-center justify-center text-base font-bold select-none"
              style={{ display: 'none', color: '#2D1600' }}>
              西
            </div>
          </div>

          <span
            className="font-bold select-none"
            style={{ color: '#2D1600', fontSize: '22px', letterSpacing: '0.02em', fontFamily: "'ZCOOL XiaoWei', serif" }}
          >
            西米求职
          </span>
        </div>
      </div>
    </header>
  );
}
