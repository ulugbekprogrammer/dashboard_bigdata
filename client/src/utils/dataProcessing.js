/**
 * Advanced Data Processing Utilities
 * Provides enhanced functions for data analysis and visualization
 */

// Format currency values
export const formatCurrency = (value) => {
  if (!value) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

// Format large numbers with K, M, B suffixes
export const formatCompactNumber = (value) => {
  if (!value) return '0';
  
  if (value >= 1000000) {
    return (value / 1000000).toFixed(2) + 'M';
  } else if (value >= 1000) {
    return (value / 1000).toFixed(2) + 'K';
  }
  return value.toString();
};

// Calculate percentage change
export const calculatePercentageChange = (current, previous) => {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

// Group data by property
export const groupBy = (array, property) => {
  return array.reduce((groups, item) => {
    const key = item[property];
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {});
};

// Sort data by property
export const sortBy = (array, property, ascending = true) => {
  return [...array].sort((a, b) => {
    if (a[property] < b[property]) {
      return ascending ? -1 : 1;
    }
    if (a[property] > b[property]) {
      return ascending ? 1 : -1;
    }
    return 0;
  });
};

// Filter data by date range
export const filterByDateRange = (array, dateProperty, startDate, endDate) => {
  return array.filter((item) => {
    const itemDate = new Date(item[dateProperty]);
    return itemDate >= startDate && itemDate <= endDate;
  });
};

// Calculate statistics
export const calculateStats = (array, property) => {
  if (!array || array.length === 0) {
    return { min: 0, max: 0, avg: 0, total: 0, count: 0 };
  }

  const values = array.map((item) => parseFloat(item[property]) || 0);
  const total = values.reduce((sum, val) => sum + val, 0);
  const avg = total / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);

  return {
    min,
    max,
    avg: parseFloat(avg.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
    count: values.length,
  };
};

// Aggregate data by time period
export const aggregateByPeriod = (array, dateProperty, valueProperty, period = 'month') => {
  const grouped = {};

  array.forEach((item) => {
    const date = new Date(item[dateProperty]);
    let key;

    if (period === 'month') {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    } else if (period === 'week') {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      key = weekStart.toISOString().split('T')[0];
    } else if (period === 'day') {
      key = date.toISOString().split('T')[0];
    }

    if (!grouped[key]) {
      grouped[key] = { date: key, value: 0, count: 0 };
    }
    grouped[key].value += parseFloat(item[valueProperty]) || 0;
    grouped[key].count += 1;
  });

  return Object.values(grouped);
};

// Find top N items by property
export const getTopN = (array, property, n = 5) => {
  return [...array]
    .sort((a, b) => (b[property] || 0) - (a[property] || 0))
    .slice(0, n);
};

// Find outliers using standard deviation
export const findOutliers = (array, property, standardDeviations = 2) => {
  const stats = calculateStats(array, property);
  const mean = stats.avg;
  const variance = array.reduce((sum, item) => {
    const val = parseFloat(item[property]) || 0;
    return sum + Math.pow(val - mean, 2);
  }, 0) / array.length;
  const stdDev = Math.sqrt(variance);

  return array.filter((item) => {
    const val = parseFloat(item[property]) || 0;
    const zScore = Math.abs((val - mean) / stdDev);
    return zScore > standardDeviations;
  });
};

// Create bins for histogram data
export const createBins = (array, property, binCount = 10) => {
  const stats = calculateStats(array, property);
  const binSize = (stats.max - stats.min) / binCount;
  const bins = [];

  for (let i = 0; i < binCount; i++) {
    const binStart = stats.min + i * binSize;
    const binEnd = binStart + binSize;
    const count = array.filter((item) => {
      const val = parseFloat(item[property]) || 0;
      return val >= binStart && val < binEnd;
    }).length;

    bins.push({
      label: `${binStart.toFixed(0)}-${binEnd.toFixed(0)}`,
      value: binStart,
      count,
    });
  }

  return bins;
};

// Calculate running average
export const calculateRunningAverage = (array, property, windowSize = 3) => {
  const values = array.map((item) => parseFloat(item[property]) || 0);
  const result = [];

  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - Math.floor(windowSize / 2));
    const end = Math.min(values.length, i + Math.ceil(windowSize / 2));
    const avg = values.slice(start, end).reduce((a, b) => a + b, 0) / (end - start);
    result.push(parseFloat(avg.toFixed(2)));
  }

  return result;
};

// Merge multiple datasets
export const mergeDatasets = (...datasets) => {
  return datasets.reduce((merged, current) => {
    return merged.map((item, index) => ({
      ...item,
      ...(current[index] || {}),
    }));
  });
};

// Extract specific columns from data
export const selectColumns = (array, columns) => {
  return array.map((item) => {
    const selected = {};
    columns.forEach((col) => {
      selected[col] = item[col];
    });
    return selected;
  });
};

// Validate data integrity
export const validateData = (array, requiredColumns) => {
  return {
    isValid: array.every((item) =>
      requiredColumns.every((col) => item[col] !== undefined && item[col] !== null)
    ),
    missingCount: array.filter((item) =>
      !requiredColumns.every((col) => item[col] !== undefined && item[col] !== null)
    ).length,
    totalCount: array.length,
  };
};
