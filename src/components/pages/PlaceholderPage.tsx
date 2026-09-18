import type { LucideIcon } from 'lucide-react';
import { Construction } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon?: LucideIcon;
}

export default function PlaceholderPage({ title, description, icon: Icon = Construction }: PlaceholderPageProps) {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-white tracking-tight mb-2">{title}</h1>
      <p className="text-sm text-slate-500 mb-8">{description}</p>
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-slate-600" />
        </div>
        <h3 className="text-lg font-semibold text-slate-400 mb-2">Coming Soon</h3>
        <p className="text-sm text-slate-600 max-w-md">
          This module is part of the ABOS roadmap and will be built in an upcoming phase.
        </p>
      </div>
    </div>
  );
}
