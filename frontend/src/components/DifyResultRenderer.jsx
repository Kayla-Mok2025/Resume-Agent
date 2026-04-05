import React from 'react';

// ── 颜色常量 ──────────────────────────────────────────────────
const ORANGE     = '#FC7D36';
const CARD_BG    = '#FFF9EE';
const AREA_BG    = '#F9F2D7';
const YELLOW     = '#F4E097';
const SHADOW     = '0 4px 24px rgba(252,125,54,0.12), 0 8px 40px rgba(0,0,0,0.08)';

// ── 解析工具 ──────────────────────────────────────────────────

/**
 * 按 【标题】 把文本切分成 [{title, content}, ...]
 */
function parseSections(text) {
  const parts = text.split(/(【[^】]+】)/);
  const sections = [];
  for (let i = 1; i < parts.length; i += 2) {
    const title   = parts[i].slice(1, -1).trim(); // 去掉【】
    const content = (parts[i + 1] || '').trim();
    sections.push({ title, content });
  }
  return sections;
}

/**
 * 根据第一个出现的标题判断模式
 */
/**
 * 清理文本：删除 --- 分隔线，删除行首孤立的 * （保留 **bold**）
 */
function cleanText(text) {
  return text
    .split('\n')
    .filter(line => !/^-{3,}\s*$/.test(line.trim()))
    .map(line => line.replace(/^\*(?!\*)\s*/, ''))
    .join('\n');
}

function detectMode(text) {
  if (text.includes('【岗位匹配度】'))    return 'match_score';
  if (text.includes('【整体优化建议】'))   return 'polish_experience';
  if (text.includes('【定制自我介绍】'))   return 'custom_intro';
  if (text.includes('【高概率面试问题】')) return 'interview_questions';
  return 'unknown';
}

// ── 行内 **bold** 解析 ────────────────────────────────────────

function InlineText({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**')
          ? <strong key={i}>{part.slice(2, -2)}</strong>
          : <React.Fragment key={i}>{part}</React.Fragment>
      )}
    </>
  );
}

/** 处理多行文本，每行内部解析 **bold** */
function RichText({ text, className = '', style = {} }) {
  const lines = text.split('\n');
  return (
    <span className={className} style={style}>
      {lines.map((line, i) => (
        <React.Fragment key={i}>
          <InlineText text={line} />
          {i < lines.length - 1 && <br />}
        </React.Fragment>
      ))}
    </span>
  );
}

// ── 通用组件 ──────────────────────────────────────────────────

function Card({ children, className = '' }) {
  return (
    <div className={`rounded-2xl p-6 mb-5 ${className}`}
      style={{ background: CARD_BG, boxShadow: SHADOW }}>
      {children}
    </div>
  );
}

function SectionTitle({ children, color = '#000' }) {
  return (
    <h3 className="font-bold text-[23px] mb-4 leading-snug" style={{ color }}>
      {children}
    </h3>
  );
}

/** 渲染有序列表，每行 "N. 内容" */
function NumberedList({ content, dotColor }) {
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
  return (
    <ol className="space-y-2.5">
      {lines.map((line, i) => {
        const num  = line.match(/^(\d+)[.、]/)?.[1] ?? String(i + 1);
        const text = line.replace(/^\d+[.、]\s*/, '');
        return (
          <li key={i} className="flex gap-3 items-start">
            <span className="flex-shrink-0 w-7 h-7 rounded-full text-[16px] flex items-center justify-center font-bold mt-0.5"
              style={{ background: dotColor || YELLOW, color: '#000' }}>
              {num}
            </span>
            <span className="text-[18px] leading-relaxed" style={{ color: '#000' }}><InlineText text={text} /></span>
          </li>
        );
      })}
    </ol>
  );
}

// ── 模式1：岗位匹配度分析 ─────────────────────────────────────

function MatchScoreResult({ sections }) {
  const scoreSection    = sections.find(s => s.title === '岗位匹配度');
  const advantageSection = sections.find(s => s.title === '匹配优势');
  const weaknessSection  = sections.find(s => s.title === '主要短板');

  // 从 "XX/100" 提取数字
  const scoreNum = scoreSection?.content.match(/(\d+)\s*\/\s*100/)?.[1];
  const score    = scoreNum ? parseInt(scoreNum, 10) : null;

  // 分数颜色
  const scoreColor = score === null ? ORANGE
    : score >= 80 ? '#16a34a'
    : score >= 60 ? ORANGE
    : '#dc2626';

  return (
    <>
      {/* 分数卡片 */}
      {scoreSection && (
        <div className="rounded-2xl p-8 mb-5 text-center"
          style={{ background: CARD_BG, boxShadow: SHADOW }}>
          <p className="text-[18px] font-medium mb-4" style={{ color: '#666' }}>岗位匹配度</p>
          {score !== null ? (
            <div className="flex items-end justify-center gap-2">
              <span className="font-bold leading-none" style={{ fontSize: '104px', color: scoreColor }}>
                {score}
              </span>
              <span className="text-[31px] font-medium mb-3" style={{ color: '#aaa' }}>/100</span>
            </div>
          ) : (
            <p className="text-base" style={{ color: '#333' }}>{scoreSection.content}</p>
          )}
        </div>
      )}

      {/* 匹配优势 */}
      {advantageSection && (
        <Card>
          <SectionTitle color="#16a34a">✓ 匹配优势</SectionTitle>
          <NumberedList content={advantageSection.content} dotColor="#bbf7d0" />
        </Card>
      )}

      {/* 主要短板 */}
      {weaknessSection && (
        <Card>
          <SectionTitle color="#dc2626">△ 主要短板</SectionTitle>
          <NumberedList content={weaknessSection.content} dotColor="#fecaca" />
        </Card>
      )}
    </>
  );
}

// ── 模式2：修改建议 ───────────────────────────────────────────

/**
 * 从 经历润色 块内容中提取三个子字段
 */
function parsePolishBlock(content) {
  const origMatch   = content.match(/原表述[：:]\s*([\s\S]*?)(?=优化后表述[：:]|$)/);
  const optMatch    = content.match(/优化后表述[：:]\s*([\s\S]*?)(?=优化原因[：:]|$)/);
  const reasonMatch = content.match(/优化原因[：:]\s*([\s\S]*?)$/);
  return {
    original:  origMatch?.[1]?.trim()   || '',
    optimized: optMatch?.[1]?.trim()    || '',
    reason:    reasonMatch?.[1]?.trim() || '',
  };
}

/** 把文本分成标题行 + 子弹列表（用于优化后表述） */
function BulletText({ text }) {
  const lines = text.split('\n').filter(Boolean);
  if (lines.length === 0) return null;
  const [title, ...rest] = lines;
  return (
    <div>
      {title && (
        <p className="text-[18px] font-semibold mb-2 leading-snug" style={{ color: '#000' }}>
          <InlineText text={title} />
        </p>
      )}
      {rest.length > 0 && (
        <ul className="space-y-2">
          {rest.map((line, i) => (
            <li key={i} className="flex gap-2 items-start text-[18px] leading-relaxed" style={{ color: '#000' }}>
              <span className="flex-shrink-0 mt-1" style={{ color: '#D97706' }}>•</span>
              <span><InlineText text={line} /></span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SubField({ label, labelColor, bg, children, bulletize = false }) {
  return (
    <div className="rounded-xl p-4 mb-3 last:mb-0" style={{ background: bg }}>
      <p className="text-[16px] font-bold mb-2" style={{ color: labelColor }}>{label}</p>
      {bulletize
        ? <BulletText text={children} />
        : <p className="text-[18px] leading-relaxed" style={{ color: '#000' }}><RichText text={children} /></p>
      }
    </div>
  );
}

function PolishExperienceResult({ sections }) {
  const overallSection  = sections.find(s => s.title === '整体优化建议');
  const polishSections  = sections.filter(s => s.title.startsWith('经历润色'));

  return (
    <>
      {overallSection && (
        <Card>
          <SectionTitle>整体优化建议</SectionTitle>
          <p className="text-[18px] leading-relaxed" style={{ color: '#000' }}>
            <RichText text={overallSection.content} />
          </p>
        </Card>
      )}

      {polishSections.map((section, i) => {
        const { original, optimized, reason } = parsePolishBlock(section.content);
        return (
          <Card key={i}>
            <SectionTitle>{section.title}</SectionTitle>
            <SubField label="原表述"    labelColor="#C2620A" bg="#FEF3E2">{original}</SubField>
            <SubField label="优化后表述" labelColor="#B7791F" bg="#FFFBEB" bulletize>{optimized}</SubField>
            <SubField label="优化原因"  labelColor={ORANGE}  bg={AREA_BG}>{reason}</SubField>
          </Card>
        );
      })}
    </>
  );
}

// ── 模式3：定制自我介绍 ───────────────────────────────────────

function CustomIntroResult({ sections }) {
  const section = sections.find(s => s.title === '定制自我介绍');
  if (!section) return null;
  return (
    <div className="rounded-2xl px-8 py-8" style={{ background: CARD_BG, boxShadow: SHADOW }}>
      <h3 className="font-bold text-[29px] mb-6" style={{ color: '#000' }}>定制自我介绍</h3>
      <p className="text-[20px] leading-[2.1]" style={{ color: '#000' }}>
        <RichText text={section.content} />
      </p>
    </div>
  );
}

// ── 模式4：高概率面试问题 ─────────────────────────────────────

/**
 * 把 "1. 问题：...\n   回答：...\n\n2. ..." 解析成数组
 */
function parseQAs(content) {
  const items = [];
  // 按 "N." 起头的行切块（兼容换行前后有空格的情况）
  const blocks = content.split(/\n(?=\s*\d+[.、]\s)/);
  for (const block of blocks) {
    const numMatch = block.match(/^\s*(\d+)[.、]/);
    if (!numMatch) continue;
    const num            = numMatch[1];
    const questionMatch  = block.match(/问题[：:]\s*([\s\S]*?)(?=\s*回答[：:])/);
    const answerMatch    = block.match(/回答[：:]\s*([\s\S]*)$/);
    items.push({
      num,
      question: questionMatch?.[1]?.trim() || '',
      answer:   answerMatch?.[1]?.trim()   || '',
    });
  }
  return items;
}

function InterviewQuestionsResult({ sections }) {
  const section = sections.find(s => s.title === '高概率面试问题');
  if (!section) return null;
  const qas = parseQAs(section.content);

  return (
    <>
      {/* 头部摘要卡 */}
      <div className="rounded-2xl px-6 py-4 mb-5 flex items-center justify-between"
        style={{ background: CARD_BG, boxShadow: SHADOW }}>
        <h3 className="font-bold text-[23px]" style={{ color: '#000' }}>高概率面试问题</h3>
        <span className="text-[16px] px-3 py-1 rounded-full font-medium"
          style={{ background: YELLOW, color: '#000' }}>
          共 {qas.length} 题
        </span>
      </div>

      {/* 每个 Q&A */}
      {qas.map(({ num, question, answer }) => (
        <Card key={num}>
          {/* 问题行 */}
          <div className="flex gap-3 items-start mb-4">
            <span className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[16px] font-bold"
              style={{ background: ORANGE, color: '#FFF9EE' }}>
              {num}
            </span>
            <p className="font-bold text-[21px] leading-snug" style={{ color: '#000' }}><InlineText text={question} /></p>
          </div>
          {/* 回答 */}
          <div className="rounded-xl px-4 py-3" style={{ background: AREA_BG }}>
            <p className="text-[16px] font-bold mb-2" style={{ color: ORANGE }}>回答思路</p>
            <p className="text-[18px] leading-relaxed" style={{ color: '#000' }}><RichText text={answer} /></p>
          </div>
        </Card>
      ))}
    </>
  );
}

// ── 兜底：无法识别模式 ────────────────────────────────────────

function UnknownResult({ result }) {
  return (
    <Card>
      <p className="text-[18px] leading-relaxed" style={{ color: '#000' }}><RichText text={result} /></p>
    </Card>
  );
}

// ── JSON 渲染器 ───────────────────────────────────────────────

/** 剥离 markdown 代码块包裹，尝试 JSON.parse */
function tryParseJson(raw) {
  try {
    const stripped = raw.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/, '').trim();
    return JSON.parse(stripped);
  } catch {
    return null;
  }
}

// 面试问题 JSON
function JsonInterviewQuestions({ data }) {
  const questions = Array.isArray(data.questions) ? data.questions : [];
  return (
    <>
      {data.summary && (
        <div className="rounded-2xl px-6 py-5 mb-5"
          style={{ background: AREA_BG, boxShadow: SHADOW }}>
          <h3 className="font-bold text-[17px] mb-3" style={{ color: ORANGE }}>诊断摘要</h3>
          <p className="text-[14px] leading-relaxed" style={{ color: '#000' }}>
            <RichText text={data.summary} />
          </p>
        </div>
      )}
      <div className="rounded-2xl px-6 py-4 mb-5 flex items-center justify-between"
        style={{ background: CARD_BG, boxShadow: SHADOW }}>
        <h3 className="font-bold text-[20px]" style={{ color: '#000' }}>高概率面试问题</h3>
        <span className="text-[12px] px-3 py-1 rounded-full font-medium"
          style={{ background: YELLOW, color: '#000' }}>共 {questions.length} 题</span>
      </div>
      {questions.map((q, i) => (
        <Card key={i}>
          <div className="flex gap-3 items-start mb-4">
            <span className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold"
              style={{ background: ORANGE, color: '#FFF9EE' }}>{i + 1}</span>
            <p className="font-bold text-[17px] leading-snug" style={{ color: '#000' }}>
              <InlineText text={q.question || ''} />
            </p>
          </div>
          {q.answer && (
            <div className="rounded-xl px-4 py-3" style={{ background: AREA_BG }}>
              <p className="text-[12px] font-bold mb-1.5" style={{ color: ORANGE }}>回答思路</p>
              <p className="text-[14px] leading-relaxed" style={{ color: '#000' }}>
                <RichText text={q.answer} />
              </p>
            </div>
          )}
        </Card>
      ))}
    </>
  );
}

// 匹配度分析 JSON
function JsonMatchScore({ data }) {
  const score = parseInt(data.score ?? data.match_score ?? '0', 10);
  const scoreColor = score >= 80 ? '#16a34a' : score >= 60 ? ORANGE : '#dc2626';
  const matchedPoints = Array.isArray(data.matched_points) ? data.matched_points : [];
  const gaps          = Array.isArray(data.gaps)           ? data.gaps           : [];
  const suggestions   = Array.isArray(data.suggestions)    ? data.suggestions    : [];

  const renderList = (items) => (
    <ul className="space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 items-start">
          <span className="flex-shrink-0 mt-[6px] text-[18px] leading-none" style={{ color: '#000' }}>•</span>
          <span className="text-[16px] leading-relaxed" style={{ color: '#000' }}>
            <InlineText text={typeof item === 'string' ? item : item.content || JSON.stringify(item)} />
          </span>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      {/* 分数卡片 + 总体评价 */}
      <div className="rounded-2xl p-8 mb-5 text-center" style={{ background: CARD_BG, boxShadow: SHADOW }}>
        <p className="text-[16px] font-medium mb-4" style={{ color: '#666' }}>岗位匹配度</p>
        <div className="flex items-end justify-center gap-2">
          <span className="font-bold leading-none" style={{ fontSize: '96px', color: scoreColor }}>{score}</span>
          <span className="text-[28px] font-medium mb-3" style={{ color: '#aaa' }}>/100</span>
        </div>
        {data.overall_comment && (
          <p className="text-[16px] mt-5 leading-relaxed max-w-2xl mx-auto text-left" style={{ color: '#444' }}>
            <RichText text={data.overall_comment} />
          </p>
        )}
      </div>

      {/* 匹配要点 */}
      {matchedPoints.length > 0 && (
        <Card>
          <SectionTitle color="#000">匹配要点</SectionTitle>
          {renderList(matchedPoints)}
        </Card>
      )}

      {/* 差距分析 */}
      {gaps.length > 0 && (
        <Card>
          <SectionTitle color="#000">差距分析</SectionTitle>
          {renderList(gaps)}
        </Card>
      )}

      {/* 改进建议 */}
      {suggestions.length > 0 && (
        <Card>
          <SectionTitle color="#000">改进建议</SectionTitle>
          {renderList(suggestions)}
        </Card>
      )}
    </>
  );
}

// 简历优化 JSON
function JsonPolishExperience({ data }) {
  const items = Array.isArray(data.items) ? data.items : [];
  return (
    <>
      {data.summary && (
        <Card>
          <SectionTitle color="#000">整体优化建议</SectionTitle>
          <p className="text-[16px] leading-relaxed" style={{ color: '#000' }}>
            <RichText text={data.summary} />
          </p>
        </Card>
      )}
      {items.map((s, i) => (
        <Card key={i}>
          <SectionTitle color="#000">{s.section || `经历润色 ${i + 1}`}</SectionTitle>
          {s.original && (
            <div className="rounded-xl p-4 mb-3" style={{ background: AREA_BG }}>
              <p className="text-[14px] font-bold mb-1.5" style={{ color: ORANGE }}>原表述</p>
              <p className="text-[16px] leading-relaxed" style={{ color: '#000' }}>
                <RichText text={s.original} />
              </p>
            </div>
          )}
          {s.optimized && (
            <div className="rounded-xl p-4 mb-3" style={{ background: AREA_BG }}>
              <p className="text-[14px] font-bold mb-1.5" style={{ color: ORANGE }}>优化后表述</p>
              <p className="text-[16px] leading-relaxed" style={{ color: '#000' }}>
                <RichText text={s.optimized} />
              </p>
            </div>
          )}
          {s.reason && (
            <div className="rounded-xl p-4" style={{ background: AREA_BG }}>
              <p className="text-[14px] font-bold mb-1.5" style={{ color: ORANGE }}>优化原因</p>
              <p className="text-[16px] leading-relaxed" style={{ color: '#000' }}>
                <RichText text={s.reason} />
              </p>
            </div>
          )}
        </Card>
      ))}
    </>
  );
}

// 自我介绍 JSON
function JsonCustomIntro({ data }) {
  const highlights = Array.isArray(data.highlights) ? data.highlights : [];
  return (
    <>
      {/* 开场白 */}
      {data.opening && (
        <Card>
          <SectionTitle color="#000">开场白</SectionTitle>
          <p className="text-[16px] leading-relaxed" style={{ color: '#000' }}>
            <RichText text={data.opening} />
          </p>
        </Card>
      )}

      {/* 亮点 */}
      {highlights.length > 0 && (
        <Card>
          <SectionTitle color="#000">核心亮点</SectionTitle>
          <ul className="space-y-2.5">
            {highlights.map((item, i) => (
              <li key={i} className="flex gap-3 items-start">
                <span className="flex-shrink-0 mt-[6px] text-[18px] leading-none" style={{ color: '#000' }}>•</span>
                <span className="text-[16px] leading-relaxed" style={{ color: '#000' }}>
                  <InlineText text={item} />
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* 完整稿 */}
      {data.full_script && (
        <div className="rounded-2xl px-8 py-8" style={{ background: CARD_BG, boxShadow: SHADOW }}>
          <h3 className="font-bold text-[23px] mb-6" style={{ color: '#000' }}>完整自我介绍</h3>
          <p className="text-[17px] leading-[2.1] whitespace-pre-line" style={{ color: '#000' }}>
            {data.full_script}
          </p>
        </div>
      )}
    </>
  );
}

// ── 主导出组件 ────────────────────────────────────────────────

/**
 * 接收 Dify 返回的原始文本或 JSON，自动识别并渲染。
 * Props:
 *   result: string  — Dify 返回的完整文本（可能是 JSON 或带【标题】的纯文本）
 *   action: string  — 当前选择的功能 key（用于优先指引 JSON 渲染）
 */
export default function DifyResultRenderer({ result, action }) {
  if (!result) return null;

  // 先尝试 JSON 解析
  const json = tryParseJson(result);
  if (json && typeof json === 'object') {
    switch (action) {
      case 'interview_questions': return <JsonInterviewQuestions data={json} />;
      case 'match_score':         return <JsonMatchScore         data={json} />;
      case 'polish_experience':   return <JsonPolishExperience   data={json} />;
      case 'custom_intro':        return <JsonCustomIntro        data={json} />;
      default:
        // 未知 action，按字段猜测
        if (json.questions)  return <JsonInterviewQuestions data={json} />;
        if (json.score != null || json.match_score != null) return <JsonMatchScore data={json} />;
        if (json.suggestions) return <JsonPolishExperience  data={json} />;
        if (json.intro || json.introduction) return <JsonCustomIntro data={json} />;
        // 无法猜测，展示 JSON 字段列表
        return <UnknownResult result={JSON.stringify(json, null, 2)} />;
    }
  }

  // 非 JSON，走原有纯文本解析路径
  const cleaned  = cleanText(result);
  const mode     = detectMode(cleaned);
  const sections = parseSections(cleaned);

  switch (mode) {
    case 'match_score':         return <MatchScoreResult         sections={sections} />;
    case 'polish_experience':   return <PolishExperienceResult   sections={sections} />;
    case 'custom_intro':        return <CustomIntroResult        sections={sections} />;
    case 'interview_questions': return <InterviewQuestionsResult sections={sections} />;
    default:                    return <UnknownResult            result={result} />;
  }
}
