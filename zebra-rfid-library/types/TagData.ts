export type TagData = {
  tagID: string,
  PC?: any,
  tagSeenCount?: number,
  // eslint-disable-next-line @typescript-eslint/ban-types
  memoryBankData?: Object,
  XPC?: any,
  CRC?: any,
  antennaID?: string,
  RSSI?: any,
  accessStatus?: string,
  relativeDistance?: number,
  firstSeenTimeStamp?: number,
};
