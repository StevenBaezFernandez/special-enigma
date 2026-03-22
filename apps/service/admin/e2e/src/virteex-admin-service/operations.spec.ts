import axios from 'axios';

describe('Admin Operations API', () => {
  it('should fetch system health with real indicators', async () => {
    const res = await axios.get(`/api/admin/monitoring/health`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data[0]).toHaveProperty('name');
    expect(res.data[0]).toHaveProperty('status');
  });

  it('should list operational backups from the database', async () => {
    const res = await axios.get(`/api/admin/operations/backups`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
  });

  it('should generate an operational report export link', async () => {
    const res = await axios.get(`/api/admin/operations/reports/export`);
    expect(res.status).toBe(200);
    expect(res.data.downloadUrl).toBeDefined();
    expect(res.data.downloadUrl).not.toBe('#mock-download');
  });
});
