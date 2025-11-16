export function ControlsInfo() {
  return (
    <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 text-xs sm:text-sm text-gray-400 bg-black bg-opacity-70 backdrop-blur-sm p-2 sm:p-3 rounded border border-gray-700 max-w-[200px] sm:max-w-none">
      <div className="flex items-center gap-2">
        <span>🖱️</span>
        <span>Move mouse to control</span>
      </div>
      <div className="flex items-center gap-2">
        <span>⚡</span>
        <span>SPACE for speed boost</span>
      </div>
      <div className="flex items-center gap-2">
        <span>🔴</span>
        <span>Red rings = aggressive bots</span>
      </div>
    </div>
  );
}
