import client from './client';

export const getDetections = async (params = {}) => {
  const response = await client.get('/detections', { params });
  return response.data;
};

export const getDetectionById = async (id) => {
  const response = await client.get(`/detections/${id}`);
  return response.data;
};

export const getOverviewStats = async () => {
  const response = await client.get('/dashboard/overview');
  return response.data;
};

export const getWebsiteScores = async (params = {}) => {
  const response = await client.get('/dashboard/website-scores', { params });
  return response.data;
};

export const getTrends = async (range = '7d') => {
  const response = await client.get('/dashboard/trends', { params: { range } });
  return response.data;
};
