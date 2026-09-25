import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import FileUploadCard from '../components/datasets/FileUploadCard';
import DatasetStatus from '../components/datasets/DatasetStatus';
import DatasetPreview from '../components/datasets/DatasetPreview';
import Button from '../components/common/Button';
import { datasetService } from '../services/datasetService';
import { useApp } from '../context/AppContext';
import { PlayCircle, RefreshCw } from 'lucide-react';

export const Datasets = () => {
  const navigate = useNavigate();
  const { isMockMode, datasetStatus, setDatasetStatus, canRunMatching, addToast } = useApp();

  const [loading, setLoading] = useState(false);
  const [datasetsData, setDatasetsData] = useState(null);

  const fetchDatasets = async () => {
    setLoading(true);
    try {
      const data = await datasetService.getDatasets(isMockMode);
      setDatasetsData(data);
      if (data) {
        setDatasetStatus({
          source1: data.source1 || { uploaded: false },
          source2: data.source2 || { uploaded: false },
          source3: data.source3 || { uploaded: false },
        });
      }
    } catch (err) {
      // Backend unavailable or no datasets yet
      setDatasetsData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, [isMockMode]);

  const handleUpload = async (sourceKey, file, onProgress) => {
    const res = await datasetService.uploadDataset(sourceKey, file, onProgress, isMockMode);
    addToast({
      type: 'success',
      title: 'File Uploaded',
      message: `${file.name} successfully uploaded for ${sourceKey.toUpperCase()}.`,
    });

    // Update status in state & context
    setDatasetStatus((prev) => ({
      ...prev,
      [sourceKey]: {
        uploaded: true,
        fileName: file.name,
        fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        rowCount: res?.metadata?.rowCount || 12000,
        ...res?.metadata,
      },
    }));

    // Update datasetsData for preview
    setDatasetsData((prev) => ({
      ...prev,
      [sourceKey]: {
        uploaded: true,
        fileName: file.name,
        fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        rowCount: res?.metadata?.rowCount || 12000,
        previewData: res?.metadata?.previewData || [
          { entity_id: 'S1-NEW', business_name: 'Sample Corp', address: '123 Market St', city: 'Metropolis', country: 'United States' }
        ],
        ...res?.metadata,
      },
    }));

    return res;
  };

  const handleRemove = (sourceKey) => {
    setDatasetStatus((prev) => ({
      ...prev,
      [sourceKey]: { uploaded: false, fileName: null, rowCount: 0 },
    }));
    setDatasetsData((prev) => ({
      ...prev,
      [sourceKey]: { uploaded: false, previewData: [] },
    }));
    addToast({
      type: 'info',
      title: 'Dataset Removed',
      message: `${sourceKey.toUpperCase()} dataset has been removed.`,
    });
  };

  return (
    <PageContainer
      title="Datasets Management"
      subtitle="Upload and inspect Source 1, Source 2 and Source 3 business records."
      actions={
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={fetchDatasets}
            loading={loading}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={PlayCircle}
            disabled={!canRunMatching}
            onClick={() => navigate('/run-matching')}
          >
            Run Matching
          </Button>
        </div>
      }
    >
      {/* 3 Upload Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <FileUploadCard
          sourceKey="source1"
          sourceTitle="Source 1 (Master / Target)"
          description="Golden enterprise records to match against"
          currentStatus={datasetsData?.source1 || datasetStatus?.source1}
          onUpload={handleUpload}
          onRemove={handleRemove}
        />

        <FileUploadCard
          sourceKey="source2"
          sourceTitle="Source 2 (Supplier / Secondary)"
          description="Vendor and partner registration records"
          currentStatus={datasetsData?.source2 || datasetStatus?.source2}
          onUpload={handleUpload}
          onRemove={handleRemove}
        />

        <FileUploadCard
          sourceKey="source3"
          sourceTitle="Source 3 (Public / Directory)"
          description="Public web registry and third-party records"
          currentStatus={datasetsData?.source3 || datasetStatus?.source3}
          onUpload={handleUpload}
          onRemove={handleRemove}
        />
      </div>

      {/* Dataset Status Summary & CTA Gating */}
      <DatasetStatus datasetStatus={datasetsData || datasetStatus} />

      {/* Dataset Inspection & Preview Table */}
      <DatasetPreview datasets={datasetsData} loading={loading} />
    </PageContainer>
  );
};

export default Datasets;
