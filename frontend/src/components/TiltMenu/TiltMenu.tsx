import React, { useEffect, useMemo, useState } from 'react';
import { Button, Popover, Select, Slider, Space, Typography } from 'antd';
import { DeleteOutlined, FilterOutlined } from '@ant-design/icons';
import type { ScoreFilter } from '../../services/api';

interface TiltMenuProps {
  appliedFilters: ScoreFilter[];
  availableLabels: string[];
  onApply: (filters: ScoreFilter[]) => void;
}

function cloneFilters(filters: ScoreFilter[]): ScoreFilter[] {
  return filters.map((filter) => ({
    label: filter.label,
    range: [...filter.range] as [number, number],
  }));
}

const TiltMenu: React.FC<TiltMenuProps> = ({ appliedFilters, availableLabels, onApply }) => {
  const [open, setOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState<ScoreFilter[]>(() => cloneFilters(appliedFilters));
  const [selectedLabel, setSelectedLabel] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!open) {
      setDraftFilters(cloneFilters(appliedFilters));
      setSelectedLabel(undefined);
    }
  }, [appliedFilters, open]);

  const remainingOptions = useMemo(
    () =>
      availableLabels
        .filter((label) => !draftFilters.some((filter) => filter.label === label))
        .map((label) => ({ label, value: label })),
    [availableLabels, draftFilters]
  );

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setDraftFilters(cloneFilters(appliedFilters));
      setSelectedLabel(undefined);
    }
    setOpen(nextOpen);
  };

  const handleAddFilter = (label: string) => {
    setDraftFilters((current) => [...current, { label, range: [0, 1] }]);
    setSelectedLabel(undefined);
  };

  const handleRangeChange = (label: string, value: number[]) => {
    if (value.length !== 2) {
      return;
    }

    setDraftFilters((current) =>
      current.map((filter) =>
        filter.label === label
          ? { ...filter, range: [value[0], value[1]] as [number, number] }
          : filter
      )
    );
  };

  const handleRemoveFilter = (label: string) => {
    setDraftFilters((current) => current.filter((filter) => filter.label !== label));
  };

  const handleApply = () => {
    onApply(cloneFilters(draftFilters));
    setOpen(false);
  };

  const content = (
    <Space direction="vertical" size="middle" style={{ width: 320 }}>
      <Typography.Text strong>Score Filters</Typography.Text>

      {draftFilters.length === 0 ? (
        <Typography.Text type="secondary">No filters selected.</Typography.Text>
      ) : (
        draftFilters.map((filter) => (
          <Space
            key={filter.label}
            direction="vertical"
            size="small"
            style={{ width: '100%', paddingBottom: 8 }}
          >
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Typography.Text>{filter.label}</Typography.Text>
              <Button
                aria-label={`Remove ${filter.label} filter`}
                danger
                icon={<DeleteOutlined />}
                size="small"
                type="text"
                onClick={() => handleRemoveFilter(filter.label)}
              />
            </Space>
            <Slider
              range
              max={1}
              min={0}
              step={0.1}
              value={filter.range}
              onChange={(value) => handleRangeChange(filter.label, value)}
            />
            <Typography.Text type="secondary">
              {filter.range[0].toFixed(1)} - {filter.range[1].toFixed(1)}
            </Typography.Text>
          </Space>
        ))
      )}

      <Select
        disabled={remainingOptions.length === 0}
        options={remainingOptions}
        placeholder={remainingOptions.length === 0 ? 'All filters added' : 'Add filter'}
        value={selectedLabel}
        onChange={handleAddFilter}
      />

      <Button block type="primary" onClick={handleApply}>
        Apply
      </Button>
    </Space>
  );

  return (
    <Popover content={content} open={open} placement="bottomRight" trigger="click" onOpenChange={handleOpenChange}>
      <Button icon={<FilterOutlined />}>Filters</Button>
    </Popover>
  );
};

export default TiltMenu;
