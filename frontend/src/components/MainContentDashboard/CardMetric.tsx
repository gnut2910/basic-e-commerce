interface CardMetricProps {
  title?: string;
  value?: number | string;
  percent?: number | string;
  percentLabel?: string;
  icon?: React.ReactNode;
  className?: string;
  bgIcon?: string;
}

export default function CardMetric({
  title,
  value,
  percent = "0",
  percentLabel = "vs tuần trước",
  icon,
  className = "",
  bgIcon,
}: CardMetricProps) {
  return (
    <div
      className={`flex items-center justify-between rounded-xl  p-4 shadow-sm ${className}`}
      role="region"
      aria-label={title}
    >
      <div className="flex-grow">
        <div className="text-sm text-gray-700 mb-2">{title}</div>
        <div className="text-xl font-medium text-black">{value}</div>
      </div>

      <div className="flex flex-col items-end ml-4">
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-lg ${bgIcon} overflow-hidden shadow-inner`}
        >
          <div className="flex items-center justify-center w-8 h-8 object-contain text-2xl">
            {icon}
          </div>
        </div>

        <div className="mt-2 text-right">
          <div
            className={`text-sm font-medium ${
              Number(percent) >= 0 ? "text-emerald-600" : "text-red-500"
            }`}
          >
            {Number(percent) >= 0 ? `+${percent}%` : `${percent}%`}
          </div>
          <div className="text-xs text-gray-600">{percentLabel}</div>
        </div>
      </div>
    </div>
  );
}
