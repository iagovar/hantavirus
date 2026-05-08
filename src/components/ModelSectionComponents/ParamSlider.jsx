export default function ParamSlider(props) {
  return (
    <div>
      <div class="flex items-center justify-between mb-1.5">
        <label for={props.id} class="text-sm font-medium text-surface-700">
          {props.label}
        </label>
        <span class="text-sm font-semibold text-brand-600 tabular-nums">
          {props.format(props.value)}
        </span>
      </div>
      <input
        id={props.id}
        type="range"
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.value}
        onInput={(e) => props.onChange(parseFloat(e.target.value))}
        class="w-full h-2 rounded-full appearance-none bg-surface-200 accent-brand-500 cursor-pointer
               [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
               [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-500 [&::-webkit-slider-thumb]:shadow-md
               [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white
               [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125"
      />
    </div>
  );
}
