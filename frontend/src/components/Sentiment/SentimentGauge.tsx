import React from 'react';
import { Progress, Space, Typography } from 'antd';
import './SentimentGauge.css';

interface SentimentGaugeProps {
  score: number;
  label?: string;
}

export const SentimentGauge: React.FC<SentimentGaugeProps> = ({ score, label = 'Sentiment' }) => {
  const percentage = score * 100;
  const getColor = (value: number) => {
    if (value < 33) return '#ff4d4f';
    if (value < 66) return '#faad14';
    return '#52c41a';
  };

  const getSentimentLabel = (value: number) => {
    return Math.round(value*10).toString()
  };

  return (
      <Space direction="vertical" style={{ width: '150px', paddingRight: '10px' }}>
        <Typography.Text>{label}</Typography.Text>
        <Progress
          type="circle"
          percent={percentage}
          strokeColor={getColor(percentage)}
          size={60}
          format={() => getSentimentLabel(score)}
          
        />
      </Space>
  );
};

export default SentimentGauge;