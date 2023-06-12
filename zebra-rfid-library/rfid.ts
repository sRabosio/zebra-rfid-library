//@flow
import { type StatusEvent } from "./types/StatusEvent";
import { type TagData } from "./types/TagData";
import { type Settings } from "./types/Settings";
import { type EnumRfidResult } from "./types/EnumRfidResult";
import { StatusDefinition } from "./types/statusDefinition";

/*
 *		---NOTES---
 *
 * tagEvent is used for multiple operations and thus should be reassigned before doing any operation
 *
 */

/**
 * @callback onEnumerateEvent
 * @param {object[]} readers - readers found
 */

/**
 * @callback onInventoryEvent
 * @param {object[]} data - data received from inventory operation
 */

/**
 * @callback onTagLocateEvent
 * @param {number} data - data returned by library, use TagLocate property to get the distance
 */

/**
 * @callback onScanSingleRfidEvent
 * @param {object} tag - tag found
 */

/* TYPES */

type TagOperationData = { TagData: TagData[] };
type TagLocateData = { TagLocate: number };

/* WINDOW */
window.statusHandler = (status: StatusEvent) => {
  console.log("before status callback", {
    status,
    getError: getError(status),
    _onConnectionCallback,
  });
  const error = getError(status);
  if (!error) return;
  const callback = statusManager[error];
  if (callback) callback(status);
  else if (status.errorCode != "1000")
    console.warn(
      `${status.vendorMessage || ""}  ${status.errorCode || ""}  ${
        status.vendorMessage || ""
      }`
    );
  else console.log("non error status", status);
};
/* CONST */

const statusManager: { [key: string]: (status: StatusEvent) => void } = {
  //connects to reader
  CONNECTION_EVENT: (status) => {
    defaultProperties();
    _isConnected = true;
    console.log("initialized with status", status);
    if (_onConnectionCallback) _onConnectionCallback();
  },
  READER_NOT_CONNECTED: (status) => {
    console.log(status.vendorMessage, status);
    getReader();
  },
  RECONNECT: () => {
    disconnect();
    getReader();
  },
  //disconnects from reader
  DISCONNECTION_EVENT: (status) => {
    _isConnected = false;
    console.log("disconnected with status", status);
    if (_onDisconnectionCallback) _onDisconnectionCallback();
  },
  READER_LIST_EMPTY: (status) => {
    console.log(status.vendorMessage);
    getReader();
  },
};

//error definitions to properly identify errors
const statusDefinitions: StatusDefinition[] = [
  {
    name: "CONNECTION_EVENT",
    errorCode: "1000",
    vendorMessage: "CONNECTION_EVENT",
    internalCode: "CONNECTION_EVENT",
  },
  {
    name: "DISCONNECTION_EVENT",
    errorCode: "1000",
    vendorMessage: "DISCONNECTION_EVENT",
    internalCode: "DISCONNECTION_EVENT",
  },
  {
    name: "READER_NOT_CONNECTED",
    errorCode: "2003",
    vendorMessage: "Reader Not Connected",
    internalCode: "READER_NOT_CONNECTED",
  },
  {
    name: "INVENTORY_OPERATION_FAILURE",
    errorCode: "2005",
    method: "performInventory",
    vendorMessage: "RFID_CHARGING_COMMAND_NOT_ALLOWED-Charging",
  },
  { name: "LOCATE_NO_TAG", errorCode: "2004", method: "locateTag" },
  { errorCode: "2004", method: "connect", internalCode: "RECONNECT" },
  { errorCode: "2000", method: "connect", internalCode: "READER_LIST_EMPTY" },
];

/* VARIABLES */

//keeps track if the library is used to avoid conflicts
let _inUse = false;
let _isConnected = false;
let _onInventory: ((data: TagData[]) => void) | null;
let _onSingleScanEvent: ((TagData: TagData) => void) | null;

let singleScanOpt: Settings = {
  stopTriggerType: "tagObservation",
  stopObservationCount: 1,
  reportUniqueTags: 1,
  startTriggerType: "immediate",
};

let performInventoryOpt: Settings = {
  stopTriggerType: "duration",
  stopObservationCount: 999999,
  reportUniqueTags: 1,
  reportTrigger: 1,
  startTriggerType: "immediate",
};

/* METHODS */

//gets error name to be used as key in statusManager
const getError = (status: StatusEvent) =>
  statusDefinitions
    .filter(
      (e) =>
        e.errorCode === status.errorCode &&
        (e.vendorMessage
          ? status.vendorMessage?.includes(e.vendorMessage)
          : true) &&
        (e.method ? status.method === e.method : true)
    )
    .sort((a, b) => {
      if ((a.vendorMessage?.length || 0) > (b.vendorMessage?.length || 0))
        return -1;
      if ((a.vendorMessage?.length || 0) < (b.vendorMessage?.length || 0))
        return 1;
      return 0;
    })[0]?.internalCode;

/**
 * @function
 * @param {object} props - rfid object properties
 * @returns {boolean} operation success/failure
 *@link for the list of parameters see official zebra documentation:  https://techdocs.zebra.com/enterprise-browser/3-3/api/re2x/rfid/
 */
export const setProperties = (props: Settings): boolean => {
  const rfid = window.rfid;
  if (rfid) {
    window.rfid = Object.assign(rfid, props);
    console.log("setProps", { props, rfid });
    return true;
  }
  console.log("setProps failed");
  return false;
};

window.scanSingleRfidHandler = (dataArray: {TagData:TagData[]}) => {
  const data = dataArray.TagData.at(0)
  if(data)
  if (_onSingleScanEvent) _onSingleScanEvent(data);
  resetCallbacks()
};

window.inventoryHandler = (dataArray: TagOperationData) => {
  if (_onInventory) _onInventory([...dataArray.TagData]);
};

window.tagLocateHandler = (data:TagLocateData) => {
  if (_tagLocateCallback) _tagLocateCallback(data);
};

window.enumRfid = (data:EnumRfidResult[]) => {
  if (_onEnumerate) _onEnumerate(data);
  resetCallbacks()
};

let hasInit = false;
let _rfidDefaults: Settings;

function init() {
  console.log("init");
  _rfidDefaults = { ...window.rfid };
  window.rfid.statusEvent = "statusHandler(%json)";
  getReader();
}

let _onConnectionCallback: (() => void) | null;
let _onDisconnectionCallback: (() => void) | null;
let _onConnectionFailed: (() => void) | null;
let _tagLocateCallback: ((data: TagLocateData) => void) | null;
let _onEnumerate: ((data: EnumRfidResult[]) => void) | null;

/**
 * attaches the library to the current component
 * call detach when unmounting/onDestroy
 * NOTE: params are to be passed as an object
 * @function
 * @param {function} success - gets called on connection event
 * @param {function} failure - gets called on connection event
 */
export const attach = ({
  success,
  failure,
}: {
  success: () => void,
  failure: () => void,
}): void => {
  console.log("attaching", new Date().getTime());
  _onConnectionFailed = failure;
  if (_inUse) {
    console.log("in use true");
    if (_onConnectionFailed) _onConnectionFailed();
    return;
  }
  _onConnectionCallback = success;
  console.log("lib free", new Date().getTime());
  _inUse = true;
  let interCount = 0;
  //leave at the bottom
  console.log("starting attach", new Date().getTime());
  const interInit: any = setInterval(() => {
    const rfid = window.rfid;
    if (rfid) {
      if (hasInit) return;
      init();
      clearInterval(interInit);
    }
    interCount++;
    if (interCount > 20) {
      console.log("failed init");
      _isConnected = false;
      if (_onConnectionFailed) _onConnectionFailed();
      clearInterval(interInit);
    }
  }, 300);
};

/**
 *
 * @returns {boolean} true if the library has initialized correctly
 */
export const isConnected: () => boolean = () => _isConnected;

/**
 * detaches library from component resetting callbacks & properties
 * @function
 * @param {function} onDisconnection - called on disconnection event
 */
export const detach = (callback: () => void): void => {
  //TODO: reset props of rfid
  _onDisconnectionCallback = callback;
  if (!hasInit) return;
  _onEnumerate = null
  _onSingleScanEvent = null
  _onInventory = null;
  _onSingleScanEvent = null
  setProperties({ ..._rfidDefaults });
  defaultProperties();
  disconnect();
  console.log("detached");
  hasInit = false;
  _inUse = false;
};

function getReader() {
  console.log("searching for reader");
  enumerate((readers: any) => {
    window.rfid.readerID = readers[0][0];
  })
  window.rfid.connect();
}

function defaultProperties() {
  console.log("before default");
  setProperties({
    beepOnRead: 1,
    transport: "serial",
    useSoftTrigger: 1,
  });
}

/**
 * Calls "onEnumerate" callback function and returns the number of rfid scanners
 * @returns {number} number of rfid scanners found
 * @function
 */
export const enumerate = (callback: ((data: EnumRfidResult[]) => void) | null): void => {
  if(callback)
  _onEnumerate = callback;
  window.rfid.enumRFIDEvent = "enumRfid(%s);";
  window.rfid.enumerate();}

/**
 * @function
 * disconnects current rfid reader
 *
 * WARNING: when no rfid reader is connected the program
 * may crash when starting an rfid operation
 */
export const disconnect = () => {
  window.rfid.disconnect();
};


/**
 * locates a tag with the given rfid
 * @function
 * @param {string} tagId - rfid tag to locate
 */
export const locateTag = (tagId: string, callback: ((data: TagLocateData) => void)| null) => {
  if (!_isConnected) throw new Error("connection not initialized");
  if (!tagId) throw new Error ("invalid tag id");
  if(callback)
  _tagLocateCallback = callback;
  window.rfid.tagEvent = "tagLocateHandler(%json);";
  window.rfid.antennaSelected = 1;
  window.rfid.tagID = tagId;
  window.rfid.startTriggerType = "immediate";
  window.rfid.locateTag();
};

/**
 * performs inventory and triggers tagEvent
 */
export function startInventory(callback: ((data: TagData[]) => void) | null) {
  if (!_isConnected) throw new Error("connection not initialized");
  if(callback) _onInventory = callback
  setProperties({ ...performInventoryOpt });
  window.rfid.tagEvent = "inventoryHandler(%json);";
  window.rfid.performInventory();
}

/**
 *
 * @param {object} options - new inventory options
 * check out all the options available  on {@link https://techdocs.zebra.com/enterprise-browser/3-3/api/re2x/rfid/}
 */
export const setInventoryOpt = (options: Settings) => {
  performInventoryOpt = { ...performInventoryOpt, ...options };
};

/**
 *
 * @param {object} options - new single scan options
 * check out all the options available  on {@link https://techdocs.zebra.com/enterprise-browser/3-3/api/re2x/rfid/}
 */
export const setSingleScanOpt = (options: Settings) => {
  singleScanOpt = { ...singleScanOpt, ...options };
};

/***
 * @function
 * stops current operation
 */
export const stop = () => {
  resetCallbacks()
  window.rfid.stop();
}

const resetCallbacks = ()=>{
  _onInventory = null
   _tagLocateCallback = null
 _onEnumerate = null
 _onSingleScanEvent = null
}

/**
 * Scans a single rfid tag
 * @function
 */
export const scanSingleRfid = (callback: ((data: TagData) => void) | null) => {
  if (!_isConnected) throw new Error("connection not initialized");
  if(callback)
  _onSingleScanEvent = callback;
  //setting options
  setProperties({ ...singleScanOpt });
  window.rfid.tagEvent = "scanSingleRfidHandler(%json);";
  window.rfid.performInventory();
};