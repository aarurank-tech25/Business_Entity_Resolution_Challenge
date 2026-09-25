import React from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import EmptyState from '../common/EmptyState';
import { History, Upload, Play, Download, CheckCircle, FileText } from 'lucide-react';

export const ActivityList = ({ activities = [], loading }) => {
  const getActionIcon = (action = '', type = '') => {
    const act = action.toLowerCase();
    if (type === 'upload' || act.includes('upload')) return Upload;
    if (type === 'matching' || act.includes('matching') || act.includes('run')) return Play;
    if (type === 'download' || act.includes('download')) return Download;
    return FileText;
  };

  const getStatusBadgeVariant = (status = '') => {
    const s = status.toLowerCase();
    if (s.includes('complete') || s.includes('success')) return 'success';
    if (s.includes('run') || s.includes('progress')) return 'running';
    if (s.includes('fail') || s.includes('error')) return 'danger';
    return 'default';
  };

  return (
    <Card
      title="Recent Pipeline Activity"
      subtitle="Execution history, dataset ingestion, and exports"
      icon={History}
      loading={loading}
      bodyClassName="p-0"
    >
      {!activities || activities.length === 0 ? (
        <div className="p-8">
          <EmptyState
            icon={History}
            title="No Recent Activity Logged"
            description="Activity logs will appear here after datasets are uploaded, matching runs are triggered, or outputs are downloaded."
          />
        </div>
      ) : (
        <div className="divide-y divide-slate-100 overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[500px]">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Initiator</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {activities.map((item, idx) => {
                const Icon = getActionIcon(item.action, item.type);
                return (
                  <tr key={item.id || idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-800 flex items-center gap-2.5">
                      <div className="p-1.5 rounded-md bg-slate-100 text-slate-600">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span>{item.action}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {item.timestamp}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {item.user || 'System Service'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Badge variant={getStatusBadgeVariant(item.status)} size="sm">
                        {item.status}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};

export default ActivityList;
