export const checkHealth = (req, res) => {
  res.status(200).json({
    success: true,
    message: "TeknisyanKo API is running!",
    application: "TeknisyanKo",
    timestamp: new Date().toISOString(),
  });
};
