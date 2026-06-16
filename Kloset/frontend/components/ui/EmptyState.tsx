import Link from 'next/link';
import { PackageOpen, SearchX, Heart } from 'lucide-react';

interface EmptyStateProps {
  icon?: 'package' | 'search' | 'heart';
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}

const icons = {
  package: PackageOpen,
  search: SearchX,
  heart: Heart,
};

export default function EmptyState({
  icon = 'package',
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  const Icon = icons[icon];

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-champagne/10 ring-1 ring-champagne/20 flex items-center justify-center mb-6">
        <Icon size={28} className="text-champagne" />
      </div>
      <h3 className="font-display text-xl font-medium text-charcoal mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-charcoal-light font-light max-w-sm mx-auto leading-relaxed">
          {description}
        </p>
      )}
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-8 btn btn-primary px-8 text-xs font-mono tracking-widest uppercase font-bold"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
