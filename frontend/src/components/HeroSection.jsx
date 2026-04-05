import React from 'react';

export default function HeroSection() {
  return (
    <section className="pt-14 pb-10 px-10 text-center">
      <h1
        className="leading-[1.2] font-bold tracking-tight mb-5"
        style={{ color: '#2D1600', fontSize: '46px', fontFamily: "'ZCOOL XiaoWei', serif" }}
      >
        西米求职——你的专属 AI 求职助手
      </h1>

      <p
        className="leading-relaxed max-w-[560px] mx-auto"
        style={{ color: 'rgba(45,22,0,0.65)', fontSize: '17px' }}
      >
        上传简历、粘贴岗位描述，快速获得更有针对性的<br className="hidden sm:block" />
        求职分析与优化建议。
      </p>

      <div className="flex items-center justify-center gap-3 mt-10">
        <div className="w-16 h-px" style={{ background: 'rgba(45,22,0,0.15)' }} />
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#FC7D36' }} />
        <div className="w-16 h-px" style={{ background: 'rgba(45,22,0,0.15)' }} />
      </div>
    </section>
  );
}
