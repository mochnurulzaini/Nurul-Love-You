import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

interface StatCardProps {
  title: string;
  amount: number;
  subtitle?: string;
  change?: number;
  changeLabel?: string;
  icon?: string;
  gradient?: string;
  textColor?: string;
  compact?: boolean;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  amount,
  subtitle,
  change,
  changeLabel,
  icon,
  gradient,
  textColor = 'white',
  compact = false,
  onClick,
}) => {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <div
      className={`rounded-3xl p-5 relative overflow-hidden cursor-pointer transition-all hover-lift ${compact ? 'p-4' : 'p-5'}`}
      style={
        gradient
          ? { background: gradient }
          : { background: 'var(--bg-card)', border: '1px solid var(--border)' }
      }
      onClick={onClick}
    >
      {/* Background decoration */}
      {gradient && (
        <>
          <div
            className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-20"
            style={{ background: 'rgba(255,255,255,0.3)' }}
          />
          <div
            className="absolute -right-2 -bottom-8 w-32 h-32 rounded-full opacity-10"
            style={{ background: 'rgba(255,255,255,0.4)' }}
          />
        </>
      )}

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-1"
              style={{ color: gradient ? 'rgba(255,255,255,0.75)' : 'var(--text-muted)' }}
            >
              {title}
            </p>
          </div>
          {icon && (
            <div
              className="w-9 h-9 rounded-2xl flex items-center justify-center text-lg"
              style={{
                background: gradient ? 'rgba(255,255,255,0.2)' : 'var(--bg-primary)',
              }}
            >
              {icon}
            </div>
          )}
        </div>

        <div
          className={`font-bold tracking-tight ${compact ? 'text-xl' : 'text-2xl'}`}
          style={{ color: gradient ? 'white' : 'var(--text-primary)' }}
        >
          {formatCurrency(amount)}
        </div>

        {(change !== undefined || subtitle) && (
          <div className="flex items-center gap-2 mt-2">
            {change !== undefined && (
              <div
                className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                style={{
                  background: gradient
                    ? 'rgba(255,255,255,0.15)'
                    : isPositive
                    ? '#d1fae5'
                    : isNegative
                    ? '#fee2e2'
                    : 'var(--bg-primary)',
                  color: gradient
                    ? 'rgba(255,255,255,0.9)'
                    : isPositive
                    ? '#059669'
                    : isNegative
                    ? '#dc2626'
                    : 'var(--text-muted)',
                }}
              >
                {isPositive ? (
                  <TrendingUp size={10} />
                ) : isNegative ? (
                  <TrendingDown size={10} />
                ) : (
                  <Minus size={10} />
                )}
                <span className="text-xs font-semibold">
                  {Math.abs(change).toFixed(1)}%
                </span>
              </div>
            )}
            {(subtitle || changeLabel) && (
              <span
                className="text-xs"
                style={{ color: gradient ? 'rgba(255,255,255,0.65)' : 'var(--text-muted)' }}
              >
                {changeLabel || subtitle}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
