import React from 'react';

const FONTS = [
  { name: 'ZCOOL KuaiLe', label: '站酷快乐体（当前在用）', desc: '手写涂鸦感，童趣活泼' },
  { name: 'ZCOOL QingKe HuangYou', label: '站酷庆科黄油体', desc: '圆润饱满如黄油，可爱温暖' },
  { name: 'ZCOOL XiaoWei', label: '站酷小薇LOGO体', desc: '精致圆弧，甜美有设计感' },
  { name: 'Long Cang', label: '龙藏体', desc: '硬笔行书，流畅随意' },
  { name: 'Liu Jian Mao Cao', label: '流间毛草', desc: '草书飞扬，艺术装饰感' },
  { name: 'Ma Shan Zheng', label: '马善政毛笔楷体', desc: '毛笔楷书，古典温润' },
  { name: 'Noto Sans SC', label: '思源黑体', desc: '干净均匀，通用正文' },
  { name: 'Noto Serif SC', label: '思源宋体', desc: '典雅衬线，文艺气质' },
];

export default function FontPreview({ onBack }) {
  return (
    <div className="min-h-screen py-12 px-10"
      style={{ background: 'linear-gradient(180deg, #FC7D36 0%, #F9F2D7 55%)', backgroundAttachment: 'fixed' }}>
      <h1 className="text-center text-2xl font-bold mb-2" style={{ color: '#F9F2D7', fontFamily: 'Noto Sans SC' }}>
        字体预览 — 告诉我你喜欢哪个
      </h1>
      <p className="text-center text-sm mb-10" style={{ color: 'rgba(249,242,215,0.7)', fontFamily: 'Noto Sans SC' }}>
        每种字体都写一遍"西米"，看哪个最顺眼
      </p>

      <div className="max-w-[860px] mx-auto flex flex-col gap-4">
        {FONTS.map(({ name, label, desc }) => (
          <div key={name} className="rounded-2xl px-8 py-5 flex items-center justify-between"
            style={{ background: '#FFF9EE', boxShadow: '0 4px 24px rgba(252,125,54,0.12), 0 8px 40px rgba(0,0,0,0.08)' }}>
            {/* 左侧：字体名 + 描述 */}
            <div className="min-w-[220px]">
              <p className="text-xs font-medium mb-0.5" style={{ color: '#FC7D36', fontFamily: 'Noto Sans SC' }}>{label}</p>
              <p className="text-xs" style={{ color: '#9A7050', fontFamily: 'Noto Sans SC' }}>{desc}</p>
              <code className="text-[11px] mt-1 block" style={{ color: '#C8A070', fontFamily: 'monospace' }}>{name}</code>
            </div>

            {/* 右侧：用该字体显示"西米" */}
            <div className="text-right">
              <p className="text-[42px] leading-tight" style={{ fontFamily: `'${name}', sans-serif`, color: '#2F160A' }}>
                西米
              </p>
              <p className="text-[15px] mt-1" style={{ fontFamily: `'${name}', sans-serif`, color: '#785E48' }}>
                西米求职——你的专属 AI 求职助手
              </p>
            </div>
          </div>
        ))}
      </div>

      {onBack && (
        <div className="text-center mt-10">
          <button
            onClick={onBack}
            className="px-8 py-3 rounded-xl text-sm font-medium"
            style={{ background: 'rgba(255,249,238,0.2)', color: '#F9F2D7', border: '1px solid rgba(255,249,238,0.4)', cursor: 'pointer', fontFamily: 'Noto Sans SC' }}
          >
            ← 返回主页面
          </button>
        </div>
      )}
    </div>
  );
}
