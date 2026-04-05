/** Compact Card - Daily Insight (800x418) */
function _CompactCardLayout({
  name,
  sunSign,
  moonSign,
  risingSign,
  birthDate: _birthDate,
  chartWheelSvg,
  variant = 'dark',
}: Omit<ShareableChartCardProps, 'size' | 'className'>) {
  const isDark = variant === 'dark';
  return (
    <div className="flex h-full w-full items-center justify-center px-4 py-6">
      {/* Main Card */}
      <div className="relative flex flex-col items-center gap-4 w-full max-w-[20rem]">
        {/* Logo */}
        <div className="absolute top-3 left-3 text-xs">
          <Sparkles className="w-3 h-3" /> AstroVerse
        </div>

        {/* Chart Wheel */}
        <div className="w-[4.5rem] h-[4.5rem] mt-4">
          {chartWheelSvg ? (
            <div className="w-full h-full flex items-center justify-center">{chartWheelSvg}</div>
          ) : (
            <div
              className={clsx(
                'w-full h-full rounded-full border flex items-center justify-center',
                isDark ? 'border-white/10 bg-white/5' : 'border-violet-200 bg-violet-50',
              )}
            >
              <span className={clsx('text-2xl', isDark ? 'text-primary/60' : 'text-violet-300')}>
                &#9788;
              </span>
            </div>
          )}
        </div>

        {/* Big 3 Horizontal */}
        <div className="flex space-x-3">
          <div className="flex flex-col items-center">
            <div className="w-5 h-5 flex items-center justify-center text-lg">
              {getZodiacSymbol(sunSign)}
            </div>
            <div className="text-xs font-medium">{sunSign}</div>
          </div>
          <div className="w-px h-5 bg-primary/20" />
          <div className="flex flex-col items-center">
            <div className="w-5 h-5 flex items-center justify-center text-lg">
              {getZodiacSymbol(moonSign)}
            </div>
            <div className="text-xs font-medium">{moonSign}</div>
          </div>
          <div className="w-px h-5 bg-primary/20" />
          <div className="flex flex-col items-center">
            <div className="w-5 h-5 flex items-center justify-center text-lg">
              {getZodiacSymbol(risingSign)}
            </div>
            <div className="text-xs font-medium">{risingSign}</div>
          </div>
        </div>

        {/* Name and Insight */}
        <div className="text-center space-y-1">
          <div className="font-bold text-white">{name}</div>
          <p className="text-[12px] italic text-slate-400">"Today's cosmic energy supports"</p>
          <p className="text-[12px] font-medium text-primary">{sunSign} energy</p>
        </div>

        {/* Footer */}
        <div className="mt-4 text-[10px] text-center text-slate-500">
          astroverse.app • daily insight
        </div>
      </div>
    </div>
  );
}
