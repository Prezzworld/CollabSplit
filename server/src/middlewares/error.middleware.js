module.exports = (err, req, res, next) => {
  console.error(err);

  if (err.code === "22P02") {
    return res.status(400).json({
      success: false,
      error:
        "Something looks wrong from the information entered, please check information again",
    });
  }

  if (err.name === "ZodError") {
    return res.status(400).json({
      success: false,
      error: "Invalid input",
      details: err.issues,
    });
  }

  const status = err.statusCode || 500;
  return res.status(status).json({
    success: false,
    error: err.message || "Internal Server Error",
  });
};
