//@flow strict

export type EnumRfidResult = {
  numberOfDevices: number,
  readerID: string,
  firmwareVersion?: string,
  modelName?: string,
  numberOfAntennas?: string,
  countryCode?: string,
  communicationStandard?: string,
  transmitPowerMin?: number,
  transmitPowerMax?: number,
  transmitPowerStep?: number,
  numberOfRFModes?: number,
  stateAwareSingulationSupported?: number | boolean,
};
