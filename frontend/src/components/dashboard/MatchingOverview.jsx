import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import Card from '../common/Card';
import EmptyState from '../common/EmptyState';
import { BarChart3, Database } from 'lucide-react';

export const MatchingOverview = ({ data, loading }) => {
  const hasData = Array.isArray(data) && data.length > 0 && data.some((d) => d.value > 0);

  const colors = ['#6366F1', '#10B981', '#F59E0B'];

  return (
    <Card
      title="Matching Pipeline Breakdown"
      subtitle="Distribution across candidate blocking, positive matches, and singleton non-matches"
      icon={BarChart3}
      loading={loading}
      className="h-full flex flex-col justify-between"
      bodyClassName="p-5 flex-1 flex flex-col"
    >
      {!hasData ? (
        <div className="flex-1 flex flex-col items-center justify-center py-10">
          <EmptyState
            icon={Database}
            title="Waiting for backend data"
            description="Chart values will populate automatically once the matching pipeline has executed or backend metrics are loaded."
          />
        </div>
      ) : (
        <div className="h-64 sm:h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#64748B', fontSize: 12 }}
                axisLine={{ stroke: '#CBD5E1' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#64748B', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
              />
              <Tooltip
                formatter={(val) => [val.toLocaleString(), 'Count']}
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={60}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill || colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-6 mt-2 text-xs text-slate-500">
            {data.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-sm"
                  style={{ backgroundColor: item.fill || colors[idx % colors.length] }}
                />
                <span className="font-medium text-slate-700">{item.name}:</span>
                <span className="font-bold text-slate-900">{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default MatchingOverview;
