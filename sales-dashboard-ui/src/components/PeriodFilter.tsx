import React from 'react';
import { PeriodPreset } from '../types/index';

interface PeriodFilterProps {
  selectedPeriod: PeriodPreset;
  customStartDate: string;
  customEndDate: string;
  currentPeriodLabel: string;
  kpiLoading: boolean;
  onPeriodChange: (period: PeriodPreset) => void;
  onCustomStartDateChange: (date: string) => void;
  onCustomEndDateChange: (date: string) => void;
  onCustomDateUpdate: () => void;
  setSelectedPeriod: (period: PeriodPreset) => void;
}

export const PeriodFilter: React.FC<PeriodFilterProps> = ({
  selectedPeriod,
  customStartDate,
  customEndDate,
  currentPeriodLabel,
  kpiLoading,
  onPeriodChange,
  onCustomStartDateChange,
  onCustomEndDateChange,
  onCustomDateUpdate,
  setSelectedPeriod
}) => {
  return (
    <div className="period-filter-section">
      <div className="period-filter-card">
        <h3>📊 KPI Time Period</h3>
        <div className="period-controls">
          <div className="period-presets">
            <button
              className={`period-btn ${selectedPeriod === 'all-time' ? 'active' : ''}`}
              onClick={() => onPeriodChange('all-time')}
            >
              All Time
            </button>
            <button
              className={`period-btn ${selectedPeriod === '1996' ? 'active' : ''}`}
              onClick={() => onPeriodChange('1996')}
            >
              1996
            </button>
            <button
              className={`period-btn ${selectedPeriod === '1997' ? 'active' : ''}`}
              onClick={() => onPeriodChange('1997')}
            >
              1997
            </button>
            <button
              className={`period-btn ${selectedPeriod === '1998' ? 'active' : ''}`}
              onClick={() => onPeriodChange('1998')}
            >
              1998
            </button>
            <div className="custom-range">
              <button
                className={`period-btn ${selectedPeriod === 'custom' ? 'active' : ''}`}
                onClick={() => setSelectedPeriod('custom')}
              >
                Custom Range
              </button>
              {selectedPeriod === 'custom' && (
                <div className="custom-inputs">
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => onCustomStartDateChange(e.target.value)}
                    min="1996-01-01"
                    max="1998-12-31"
                  />
                  <span>to</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => onCustomEndDateChange(e.target.value)}
                    min="1996-01-01"
                    max="1998-12-31"
                  />
                  <button
                    className="update-btn"
                    onClick={onCustomDateUpdate}
                  >
                    Update
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="current-period">
          Showing: <strong>{currentPeriodLabel}</strong>
          {kpiLoading && <span className="loading-indicator">Updating...</span>}
        </div>
      </div>
    </div>
  );
};