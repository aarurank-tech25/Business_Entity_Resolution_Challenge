import React, { useState, useEffect } from 'react';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/common/Card';
import EmptyState from '../components/common/EmptyState';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { modelService } from '../services/modelService';
import { useApp } from '../context/AppContext';
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
import {
  Brain,
  Layers,
  BarChart3,
  Sliders,
  CheckCircle,
  HelpCircle,
  RefreshCw,
  Cpu,
} from 'lucide-react';

export const ModelInsights = () => {
  const { isMockMode } = useApp();
  const [loading, setLoading] = useState(true);
  const [modelData, setModelData] = useState(null);

  const fetchModelData = async () => {
    setLoading(true);
    try {
      const data = await modelService.getModelInsights(isMockMode);
      setModelData(data);
    } catch {
      // If backend does not provide model insights endpoint, leave as null
      setModelData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModelData();
  }, [isMockMode]);

  const hasFeatures = modelData && Array.isArray(modelData.features) && modelData.features.length > 0;
  const hasScoreDistribution =
    modelData &&
    Array.isArray(modelData.score_distribution) &&
    modelData.score_distribution.length > 0;

  return (
    <PageContainer
      title="Model Insights"
      subtitle="Understand the feature weights, classification score distributions, and model metadata returned by the entity matching model."
      actions={
        <Button
          variant="outline"
          size="sm"
          icon={RefreshCw}
          onClick={fetchModelData}
          loading={loading}
        >
          Refresh Insights
        </Button>
      }
    >
      {/* Section 1: Model Information (Only if provided by backend) */}
      <Card
        title="Model Specifications & Decision Hyperparameters"
        subtitle="Active inference configuration returned by the FastAPI backend"
        icon={Cpu}
        loading={loading}
      >
        {!modelData ? (
          <div className="py-6 text-center text-xs text-slate-500">
            <Cpu className="w-6 h-6 text-slate-400 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">Model metadata is not available from the backend.</p>
            <p className="text-slate-400 mt-0.5">Connect backend endpoint <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">GET /model-insights</code> to display configuration details.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                Model Name
              </span>
              <div className="text-sm font-bold text-slate-900 mt-1">
                {modelData.model_name || 'Standard Classifier'}
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                Model Version
              </span>
              <div className="text-sm font-mono font-bold text-indigo-700 mt-1">
                {modelData.version || 'v1.0.0'}
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                Optimal Decision Threshold
              </span>
              <div className="text-sm font-bold text-emerald-700 mt-1 flex items-center gap-1.5">
                <span>{modelData.threshold !== undefined ? modelData.threshold : '0.85'}</span>
                <span className="text-[11px] font-normal text-slate-500">(F0.5 tuned)</span>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                Evaluation Status
              </span>
              <div className="text-xs font-semibold text-slate-800 mt-1 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>{modelData.training_status || 'Evaluated'}</span>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Section 2: Feature Importance (Only if provided by backend) */}
      <Card
        title="Similarity Feature Importance"
        subtitle="Relative contribution of candidate similarity signals in the classification decision"
        icon={Sliders}
        loading={loading}
      >
        {!hasFeatures ? (
          <div className="py-10 text-center">
            <EmptyState
              icon={Brain}
              title="Feature Importance Unavailable"
              description="Model feature importance is not available from the backend."
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
              {/* Feature Horizontal Bars */}
              <div className="space-y-3">
                {modelData.features.map((item, idx) => {
                  const percent = Math.round(item.importance * 100);
                  return (
                    <div key={idx} className="p-2.5 rounded-lg bg-purple-50/30 border border-purple-150">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-800">{item.feature}</span>
                        <span className="font-mono font-bold text-purple-700">{percent}%</span>
                      </div>
                      <div className="w-full bg-purple-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-purple-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      {item.description && (
                        <div className="text-[11px] text-purple-900/60 mt-1">{item.description}</div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Bar Chart Visualization */}
              <div className="h-64 sm:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={modelData.features}
                    layout="vertical"
                    margin={{ top: 10, right: 30, left: 40, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#EFE8FE" />
                    <XAxis
                      type="number"
                      domain={[0, 0.4]}
                      tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                      tick={{ fill: '#7C6E8F', fontSize: 11 }}
                    />
                    <YAxis
                      type="category"
                      dataKey="feature"
                      width={120}
                      tick={{ fill: '#4C3B66', fontSize: 11 }}
                    />
                    <Tooltip
                      formatter={(v) => [`${(v * 100).toFixed(1)}%`, 'Importance Weight']}
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #EFE8FE',
                        boxShadow: '0 10px 15px -3px rgba(109, 40, 217, 0.08)',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="importance" fill="#7C3AED" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Section 3: Match Score Distribution (Only if provided by backend) */}
      <Card
        title="Prediction Score Distribution"
        subtitle="Histogram distribution of computed model match probabilities"
        icon={BarChart3}
        loading={loading}
      >
        {!hasScoreDistribution ? (
          <div className="py-10 text-center">
            <EmptyState
              icon={BarChart3}
              title="Score Distribution Unavailable"
              description="Score distribution histogram is not returned by the backend."
            />
          </div>
        ) : (
          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={modelData.score_distribution}
                margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFE8FE" />
                <XAxis
                  dataKey="score_bucket"
                  tick={{ fill: '#7C6E8F', fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#7C6E8F', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(val) => [val.toLocaleString(), 'Candidate Pairs']}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #EFE8FE',
                    boxShadow: '0 10px 15px -3px rgba(109, 40, 217, 0.08)',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </PageContainer>
  );
};

export default ModelInsights;
