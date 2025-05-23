app.get('/api/activity-logs', async (req, res) => {
  const staffName = req.query.staff;
  if (!staffName) return res.status(400).send({ error: 'Missing staff name' });

  try {
    const logs = await ActivityLog.find({ 'u_id.name': staffName });
    res.json(logs);
  } catch (err) {
    res.status(500).send({ error: 'Server error' });
  }
});
