export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-white">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
