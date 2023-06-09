import { Settings } from "./Settings";
import { ZebraRfidFunctions } from "./ZebraRfidFunctions";

export {};

declare global {
  interface Window {
    rfid: ZebraRfidFunctions & Settings,
    scanSingleRfidHandler: Function,
    inventoryHandler: Function,
    tagLocateHandler: Function,
    enumRfid: Function,
    antennaSelected: number,
    statusHandler: Function
  }
}