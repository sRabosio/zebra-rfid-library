/* eslint-disable @typescript-eslint/ban-types */
import { Settings } from "./Settings";
import { ZebraRfidFunctions } from "./ZebraRfidFunctions";

export {};
type TagEventHandler = (dataArray: {TagData:TagData[]})=>void
declare global {
  interface Window {
    rfid: ZebraRfidFunctions & Settings,
    scanSingleRfidHandler: TagEventHandler,
    inventoryHandler: TagEventHandler,
    tagLocateHandler: Function,
    enumRfid: Function,
    antennaSelected: number,
    statusHandler: Function,
    precisionSingleScanHandler: TagEventHandler,
    locateNearestHandler: Function
  }
}