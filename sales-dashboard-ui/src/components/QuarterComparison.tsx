import React from 'react';

interface QuarterComparisonProps {
  quarter1: number;
  year1: number;
  quarter2: number;
  year2: number;
  comparisonLoading: boolean;
  onQuarter1Change: (year: number, quarter: number) => void;
  onQuarter2Change: (year: number, quarter: number) => void;
  onCompareQuarters: () => void;
}

export const QuarterComparison: React.FC<QuarterComparisonProps> = ({
  quarter1,
  year1,
  quarter2,
  year2,
  comparisonLoading,
  onQuarter1Change,
  onQuarter2Change,
  onCompareQuarters
}) => {
  const quarters = [
    { value: "1996-2", label: "Q2 1996" },
    { value: "1996-3", label: "Q3 1996" },
    { value: "1996-4", label: "Q4 1996" },
    { value: "1997-1", label: "Q1 1997" },
    { value: "1997-2", label: "Q2 1997" },
    { value: "1997-3", label: "Q3 1997" },
    { value: "1997-4", label: "Q4 1997" },
    { value: "1998-1", label: "Q1 1998" },
    { value: "1998-2", label: "Q2 1998" },
    { value: "1998-3", label: "Q3 1998" },
    { value: "1998-4", label: "Q4 1998" }
  ];

  return (
    <div className="comparison-section">
      <div className="comparison-card">
        <h3>🔍 Quarter Comparison Analysis</h3>
        <div className="comparison-controls">
          <div className="quarter-selector">
            <label>Compare:</label>
            <select
              value={`${year1}-${quarter1}`}
              onChange={(e) => {
                const [y, q] = e.target.value.split('-');
                onQuarter1Change(parseInt(y), parseInt(q));
              }}
            >
              {quarters.map(quarter => (
                <option key={quarter.value} value={quarter.value}>
                  {quarter.label}
                </option>
              ))}
            </select>
          </div>

          <div className="vs-divider">vs</div>

          <div className="quarter-selector">
            <label>With:</label>
            <select
              value={`${year2}-${quarter2}`}
              onChange={(e) => {
                const [y, q] = e.target.value.split('-');
                onQuarter2Change(parseInt(y), parseInt(q));
              }}
            >
              {quarters.map(quarter => (
                <option key={quarter.value} value={quarter.value}>
                  {quarter.label}
                </option>
              ))}
            </select>
          </div>

          <button
            className="compare-btn"
            onClick={onCompareQuarters}
            disabled={comparisonLoading}
          >
            {comparisonLoading ? 'Analyzing...' : 'Compare Quarters'}
          </button>
        </div>
      </div>
    </div>
  );
};
