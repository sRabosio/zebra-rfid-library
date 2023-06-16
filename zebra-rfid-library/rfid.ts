//@flow
import { type StatusEvent } from "./types/StatusEvent";
import { type TagData } from "./types/TagData";
import { type Settings } from "./types/Settings";
import { type EnumRfidResult } from "./types/EnumRfidResult";
import { StatusDefinition } from "./types/statusDefinition";
import defaultSettings from "./defaultSettings";
import toSortedArray from "./util/toSortedArray"

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
let _locateNearestBusy = false
let _inUse = false;
let _isConnected = false;
let _onInventory: ((data: TagData[]) => void) | null;
let _onSingleScan: ((TagData: TagData) => void) | null;
let _onLocateNearest: ((distance:number)=>void) | null
let precisionScanCache:TagData[] = []
let singleScanOpt: Settings = {
  stopTriggerType: "tagObservation",

  reportUniqueTags: 1,
  startTriggerType: "immediate",
};


let performInventoryOpt: Settings = {
  stopTriggerType: "duration",
  reportUniqueTags: 1,
  startTriggerType: "immediate",
};

let precisionSingleScanOpt:Settings = {
  startTriggerType: "triggePress",
  reportUniqueTags: 1,
  stopTriggerType: "duration",
  enableTagSeenCount: 1,
  
}

let locateTagOpt: Settings = {
  startTriggerType: "immediate",
  stopTriggerType: "duration",
}

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
  if (window.rfid) {
    window.rfid = Object.assign(window.rfid, props);
    return true;
  }
  alert("setProps failed");
  return false;
};

window.scanSingleRfidHandler = (dataArray: {TagData:TagData[]}) => {
  const data = dataArray.TagData.at(0)
  if(data)
  if (_onSingleScan) _onSingleScan(data);
  stop()
};

window.precisionSingleScanHandler = (dataArray: {TagData:TagData[]})=>{
  console.log("before adding to cache", precisionScanCache)
  precisionScanCache = [...precisionScanCache, ...dataArray.TagData]
  
}
window.inventoryHandler = (dataArray: TagOperationData) => {
  if (_onInventory) _onInventory([...dataArray.TagData]);
};

window.tagLocateHandler = (data:TagLocateData) => {
  if (_tagLocateCallback) _tagLocateCallback(data);
};

window.locateNearestHandler = (data:TagLocateData)=>{
  console.log("window callback", {data, _onLocateNearest})
  const result = data.TagLocate
  if(_onLocateNearest)_onLocateNearest(result)
}

window.enumRfid = (data:EnumRfidResult[]) => {
  if (_onEnumerate) _onEnumerate(data);
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
let _onPrecisionScanning: ((data:TagData)=>void) | null

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
 * @function
 * @param {onEnumerateEvent} callback - function that gets called during "enumerate()" execution
 */
export const onEnumerate = (callback: ((data: EnumRfidResult[]) => void) | null) => {
  _onEnumerate = callback;
  
};

/**
 * @function
 * @param {onInventoryEvent} callback - function that gets called during "startInventory()" execution
 */
export const onInventory = (callback: ((data: TagData[]) => void) | null) => {
  _onInventory = callback;
};


/**
 * @function
 * @param {onScanSingleRfidEvent} callback - function that gets called during "scanSingleRfid" operation
 */
export const onScanSingleRfid = (callback: ((data: TagData) => void) | null) => {
  _onSingleScan = callback;
};

/**
 * @param {onTagLocateEvent} callback - function called when locating a tag
 * @function
 */
export const onTagLocate = (callback: ((data: TagLocateData) => void)| null) => {
  _tagLocateCallback = callback;
};

export const setPrecisionSingleScanOpt = (options:Settings) =>{
  precisionSingleScanOpt = {...precisionSingleScan, ...options}
}

export const onPrecisionScanning = (callback: (data:TagData)=>void)=>{
  _onPrecisionScanning = callback
}

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
  _onSingleScan = null
  _onInventory = null;
  _onSingleScan = null
  setProperties({ ..._rfidDefaults });
  defaultProperties();
  disconnect();
  console.log("detached");
  hasInit = false;
  _inUse = false;
};

function getReader() {
  console.log("searching for reader");
  onEnumerate((readers: any) => {
    window.rfid.readerID = readers[0][0];
  })
  enumerate()
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
export const enumerate = (): void => {
  window.rfid.enumRFIDEvent = "enumRfid(%s);";
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
export const locateTag = (tagId: string ) => {
  if (!_isConnected) throw new Error("connection not initialized");
  if (!tagId) throw new Error ("invalid tag id");
  window.rfid.tagEvent = "tagLocateHandler(%json);";
  window.rfid.antennaSelected = 1;
  window.rfid.tagID = tagId;
  setProperties({...locateTagOpt})
  window.rfid.locateTag();
};

const locateNearest = (tagId: string, callback:(distance:number)=>void)=>{
  if (!_isConnected) throw new Error("connection not initialized");
  if (!tagId) throw new Error ("invalid tag id");
  _locateNearestBusy = true
  _onLocateNearest = callback
  console.log("locating nearest with callback", callback)
  window.rfid.tagEvent = "locateNearestHandler(%json);";
  window.rfid.antennaSelected = 1;
  window.rfid.tagID = tagId;
  setProperties({...locateTagOpt})
  window.rfid.locateTag();
}

export const setLocateTagOpt = (options: Settings) => {
  locateTagOpt = {...locateTag, ...options}
}

/**
 * performs inventory and triggers tagEvent
 */
export function startInventory() {
  if (!_isConnected) throw new Error("connection not initialized");
  window.rfid.tagEvent = "inventoryHandler(%json);";
  setProperties({ ...performInventoryOpt });
  window.rfid.performInventory();
}

export const precisionSingleScan = ()=>{
  if(!isConnected) throw new Error("Connection not initialized")
  window.rfid.tagEvent = "precisionSingleScanHandler(%json)"
  setProperties({...precisionSingleScanOpt})
  window.rfid.performInventory()

  setTimeout(()=>{
    stop()
    console.log("cached for precision", precisionScanCache)
    calcNearest(precisionScanCache[Symbol.iterator](), (found)=>{
      console.log("found is",found)
      if(!found) return
      if(_onPrecisionScanning)_onPrecisionScanning(found)
      precisionScanCache = []
    })    
  },3000)
}

const calcNearest = (iter:IterableIterator<TagData>, callback:(found:TagData| void)=>void, currentNearest?:{tag: TagData , distance: number})=>{
  const current:IteratorResult<any, TagData> = iter.next()
  console.log("currently iterating",current)
      if(current.done){
        console.log("done", currentNearest)
        callback(currentNearest?.tag)
        _onLocateNearest = null
        return
      }
      const locateNearestCallback = (distance:number)=>{
        stop()
        _onLocateNearest = null
        console.log("currently found", {i:current.value, distance, cn:{...currentNearest}, condition: distance > 75 && (!currentNearest || (currentNearest &&  distance > currentNearest.distance)), nearstExists: Boolean(currentNearest), morethan0: distance > 0})
        if(distance > 75 && (!currentNearest || (currentNearest &&  distance > currentNearest.distance))) currentNearest = {tag:current.value, distance}
        console.log("selected nearest", currentNearest)
        return calcNearest(iter, callback, currentNearest)
      }
      locateNearest(current.value.tagID, locateNearestCallback)
    
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
  window.rfid.stop();
  // window.rfid = Object.assign(window.rfid, defaultSettings)
}

/**
 * Scans a single rfid tag
 * @function
 */
export const scanSingleRfid = () => {
  if (!_isConnected) throw new Error("connection not initialized");
  //setting options
  setProperties({ ...singleScanOpt });
  window.rfid.tagEvent = "scanSingleRfidHandler(%json);";
  window.rfid.performInventory();
};
