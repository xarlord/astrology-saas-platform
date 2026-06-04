/**
 * AspectGuide — Educational intro block for the Natal Aspects table.
 * Collapsible helper that explains what aspects are, how to read them,
 * and provides a beginner-friendly formula + example.
 */

import { useState } from 'react';

export function AspectGuide() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-8 bg-cosmic-card-solid border border-white/15 rounded-2xl overflow-hidden">
      {/* Header — always visible */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/5 transition-colors"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">📖</span>
          <div>
            <h2 className="text-lg font-bold">What Are Aspects?</h2>
            <p className="text-sm text-slate-400">
              A quick guide to understanding angular relationships in your chart
            </p>
          </div>
        </div>
        <span className={`text-xl text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          ▾
        </span>
      </button>

      {/* Body — collapsible */}
      {open && (
        <div className="px-6 pb-6 space-y-5 text-sm leading-relaxed text-slate-300">
          {/* Intro */}
          <p>
            Aspects show the <strong className="text-slate-100">angular relationships</strong> between
            planets or chart points. They describe how different parts of your chart interact with each other.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
              <span className="text-green-400 font-semibold">Flow &amp; Cooperation</span>
              <p className="text-slate-400 text-xs mt-1">Trines and sextiles create ease and natural talent.</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
              <span className="text-red-400 font-semibold">Pressure &amp; Growth</span>
              <p className="text-slate-400 text-xs mt-1">Squares and oppositions create tension that drives development.</p>
            </div>
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3">
              <span className="text-orange-400 font-semibold">Power &amp; Fusion</span>
              <p className="text-slate-400 text-xs mt-1">Conjunctions blend energies — intensity depends on the planets involved.</p>
            </div>
            <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-3">
              <span className="text-violet-400 font-semibold">Adjustment &amp; Subtlety</span>
              <p className="text-slate-400 text-xs mt-1">Quincunxes, semisextiles, and minor aspects describe fine-tuning patterns.</p>
            </div>
          </div>

          {/* Key principle */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
            <p className="text-amber-300 font-semibold text-center mb-2">
              ⚡ No aspect is automatically "good" or "bad."
            </p>
            <ul className="space-y-1 text-slate-400 text-xs">
              <li>
                <strong className="text-slate-200">Trine</strong> — shows talent, but can also become passive.
              </li>
              <li>
                <strong className="text-slate-200">Square</strong> — shows tension, but also creates motivation and strength.
              </li>
              <li>
                <strong className="text-slate-200">Opposition</strong> — creates conflict, but develops awareness through relationship and contrast.
              </li>
              <li>
                <strong className="text-slate-200">Conjunction</strong> — can be powerful, but depends on the planets involved.
              </li>
              <li>
                <strong className="text-slate-200">Minor aspects</strong> — may be subtle, but can still describe important patterns, especially with a tight orb.
              </li>
            </ul>
          </div>

          {/* Formula */}
          <div>
            <h3 className="text-base font-semibold text-slate-100 mb-2">📐 How to Read an Aspect</h3>
            <div className="bg-white/5 rounded-xl p-4 font-mono text-xs space-y-1.5">
              <p><span className="text-indigo-400">Planet / Point 1</span> = One psychological function</p>
              <p><span className="text-cyan-400">Aspect</span> = The relationship between them</p>
              <p><span className="text-indigo-400">Planet / Point 2</span> = Another psychological function</p>
              <p><span className="text-amber-400">Orb</span> = Strength or closeness</p>
              <p><span className="text-emerald-400">Applying / Separating</span> = Developmental timing</p>
            </div>
          </div>

          {/* Example */}
          <div className="bg-white/5 rounded-xl p-4">
            <h3 className="text-base font-semibold text-slate-100 mb-2">🪐 Example</h3>
            <p className="text-slate-300 mb-2">
              <strong className="text-slate-100">Mars □ Saturn</strong> with a tight orb shows a strong tension between action and restraint.
            </p>
            <p className="text-slate-400">
              The person may feel blocked at first, but with maturity, this can become{' '}
              <span className="text-emerald-400">discipline</span>,{' '}
              <span className="text-emerald-400">endurance</span>, and{' '}
              <span className="text-emerald-400">strategic action</span>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default AspectGuide;
