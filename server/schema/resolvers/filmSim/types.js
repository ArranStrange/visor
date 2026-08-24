module.exports = {
  // Fall back to the deprecated compatibleCameras field (which historically
  // held sensor names) for documents created before the rename.
  compatibleSensors: (parent) =>
    parent.compatibleSensors?.length
      ? parent.compatibleSensors
      : parent.compatibleCameras || [],
};
