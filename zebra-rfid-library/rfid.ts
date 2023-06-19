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




const Status:{
  statusManager:{ [key: string]: (status: StatusEvent) => void }
  statusDefinitions: StatusDefinition[],
  statusHandler:(status:StatusEvent)=>void,
  getError: (status: StatusEvent) =>string | undefined
} = {
  statusManager:{
    //connects to reader
    CONNECTION_EVENT: (status) => {
      Locals.defaultProperties();
      Locals._isConnected = true;
      console.log("initialized with status", status);
      if (Locals._onConnectionCallback) Locals._onConnectionCallback();
    },
    READER_NOT_CONNECTED: (status) => {
      console.log(status.vendorMessage, status);
      Locals.getReader();
    },
    RECONNECT: () => {
      disconnect();
      Locals.getReader();
    },
    //disconnects from reader
    DISCONNECTION_EVENT: (status) => {
      Locals._isConnected = false;
      console.log("disconnected with status", status);
      if (Locals._onDisconnectionCallback) Locals._onDisconnectionCallback();
    },
    READER_LIST_EMPTY: (status) => {
      console.log(status.vendorMessage);
      Locals.getReader();
    },
    
  },
  statusHandler: (status: StatusEvent) => {
    console.log("before status callback", {
      status,
      getError: Status.getError(status),
      onCOnncall:Locals._onConnectionCallback,
    });
    const error = Status.getError(status);
    if (!error) return;
    const callback = Status.statusManager[error];
    if (callback) callback(status);
    else if (status.errorCode != "1000")
      console.warn(
        `${status.vendorMessage || ""}  ${status.errorCode || ""}  ${
          status.vendorMessage || ""
        }`
      );
    else console.log("non error status", status);
  },
  statusDefinitions:[
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
  ],
  
  //gets error name to be used as key in statusManager
  getError: (status: StatusEvent) =>
    Status.statusDefinitions
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
    })[0]?.internalCode
}



const Locals:{
  _inUse: boolean,
  _isConnected: boolean,
  setProperties: (props:Settings)=>boolean
  hasInit: boolean,
  _rfidDefaults: Settings,
  init: ()=>void,
  _onConnectionCallback: (() => void) | null,
  _onDisconnectionCallback: (() => void) | null,
  _onConnectionFailed: (() => void) | null,
  attach: ({
    success,
    failure,
  }: {
    success: () => void,
    failure: () => void,
  })=> void,
  detach: (callback: () => void)=> void,
  getReader: ()=>void,
  defaultProperties: ()=>void
} = {
  _inUse: false,
  _isConnected: false,
  setProperties: (props: Settings): boolean => {
    if (window.rfid) {
      window.rfid = Object.assign(window.rfid, props);
      return true;
    }
    alert("setProps failed");
    return false;
  },
  hasInit: false,
_rfidDefaults: {},

  init: ()=>{
    console.log("init", window.rfid);
    Locals._rfidDefaults = { ...window.rfid };
    window.rfid.statusEvent = "statusHandler(%json)";
    Locals.getReader();
  },
  _onConnectionCallback: null,
  _onDisconnectionCallback: null,
  _onConnectionFailed: null,
  attach: ({
    success,
    failure,
  }) => {
    console.log("attaching", new Date().getTime());
    Locals._onConnectionFailed = failure;
    if (Locals._inUse) {
      console.log("in use true");
      if (Locals._onConnectionFailed) Locals._onConnectionFailed();
      return;
    }
    Locals._onConnectionCallback = success;
    console.log("lib free", new Date().getTime());
    Locals._inUse = true;
    let interCount = 0;
    //leave at the bottom
    console.log("starting attach", new Date().getTime());
    const interInit: any = setInterval(() => {
      const rfid = window.rfid;
      if (rfid) {
        if (Locals.hasInit) return;
        Locals.init();
        clearInterval(interInit);
      }
      interCount++;
      if (interCount > 20) {
        console.log("failed init");
        Locals._isConnected = false;
        if (Locals._onConnectionFailed) Locals._onConnectionFailed();
        clearInterval(interInit);
      }
    }, 300);
  },
  detach: (callback) => {
    Locals._onDisconnectionCallback = callback;
    if (!Locals.hasInit) return;
    Enumerate._onEnumerate = null
    SingleScan._onSingleScan = null
    Inventory._onInventory = null;
    PrecisionSingleScan._onLocateNearest = null
    PrecisionSingleScan._onPrecisionScanning = null
    setProperties({ ...Locals._rfidDefaults });
    Locals.defaultProperties();
    disconnect();
    console.log("detached");
    Locals.hasInit = false;
    Locals._inUse = false;
  },
  getReader: ()=> {
    console.log("searching for reader");
    onEnumerate((readers: any) => {
      window.rfid.readerID = readers[0][0];
    })
    Enumerate.enumerate()
    window.rfid.connect();
  },
  
  defaultProperties: ()=> {
    console.log("before default");
    setProperties({
      beepOnRead: 1,
      transport: "serial",
      useSoftTrigger: 1,
    });
  }
}



const Inventory: {
  _onInventory: ((data: TagData[]) => void) | null,
  options: Settings,
  inventoryHandler: (dataArray:TagOperationData)=>void
} = {
  _onInventory: null,
  options: {
    stopTriggerType: "duration",
    reportUniqueTags: 1,
    startTriggerType: "immediate",
  },
  inventoryHandler: window.inventoryHandler = (dataArray: TagOperationData) => {
    if (Inventory._onInventory) Inventory._onInventory([...dataArray.TagData]);
  },
}



const SingleScan:{
  _onSingleScan: ((TagData: TagData) => void) | null,
  options: Settings,
  scanSingleRfid: ()=>void,
  scanSingleRfidHandler: (dataArray: {TagData:TagData[]})=>void
} = {
  _onSingleScan: null,
  options: {
    stopTriggerType: "tagObservation",
    reportUniqueTags: 1,
    startTriggerType: "immediate",
  },
  scanSingleRfid: () => {
    if (!Locals._isConnected) throw new Error("connection not initialized");
    //setting options
    setProperties({ ...SingleScan.options });
    window.rfid.tagEvent = "scanSingleRfidHandler(%json);";
    window.rfid.performInventory();
  },
  scanSingleRfidHandler: (dataArray: {TagData:TagData[]}) => {
    const data = dataArray.TagData.at(0)
    if(data)
    if (SingleScan._onSingleScan) SingleScan._onSingleScan(data);
    stop()
  },
}



const LocateTag: {
  _onTagLocate: ((data: TagLocateData) => void) | null,
  options: Settings,
  tagLocateHandler: (data:TagLocateData)=>void,
  locateTag: (tagId: string ) =>void
} = {
  _onTagLocate: null,
  options: {
    startTriggerType: "immediate",
    stopTriggerType: "duration",
  },
  tagLocateHandler: (data:TagLocateData) => {
    if (LocateTag._onTagLocate) LocateTag._onTagLocate(data);
  },
  locateTag: (tagId) => {
    if (!Locals._isConnected) throw new Error("connection not initialized");
    if (!tagId) throw new Error ("invalid tag id");
    window.rfid.tagEvent = "tagLocateHandler(%json);";
    window.rfid.antennaSelected = 1;
    window.rfid.tagID = tagId;
    setProperties({...LocateTag.options})
    window.rfid.locateTag();
  }
}




const PrecisionSingleScan:{
  precisionScanCache:TagData[],
  _onLocateNearest:((distance:number)=>void) | null
  options: Settings,
  precisionSingleScanHandler: (dataArray: {TagData:TagData[]})=>void,
  locateNearestHandler: (data:TagLocateData)=>void,
  _onPrecisionScanning: ((data:TagData)=>void) | null,
  locateNearest: (tagId: string, callback:(distance:number)=>void)=>void,
  precisionSingleScan: ()=>void,
  calcNearest: (iter:IterableIterator<TagData>, callback:(found:TagData| void)=>void, currentNearest?:{tag: TagData , distance: number})=>void,
  minDistance: number
} = {
  precisionScanCache: [],
  minDistance: 75,
  _onLocateNearest:null,
  options:{
    startTriggerType: "immediate",
    reportUniqueTags: 1,
    stopTriggerType: "duration",
    enableTagSeenCount: 1,
    
  },
  precisionSingleScanHandler: (dataArray)=>{
    console.log("before adding to cache", PrecisionSingleScan.precisionScanCache)
    PrecisionSingleScan.precisionScanCache = [...PrecisionSingleScan.precisionScanCache, ...dataArray.TagData]
  },
  locateNearestHandler: (data:TagLocateData)=>{
    console.log("window callback", {data, onLocateNearest:PrecisionSingleScan._onLocateNearest})
    const result = data.TagLocate
    if(PrecisionSingleScan._onLocateNearest)PrecisionSingleScan._onLocateNearest(result)
  },
  _onPrecisionScanning: null,
  locateNearest: (tagId, callback)=>{
    if (!Locals._isConnected) throw new Error("connection not initialized");
    if (!tagId) throw new Error ("invalid tag id");
    PrecisionSingleScan._onLocateNearest = callback
    window.rfid.tagEvent = "locateNearestHandler(%json);";
    window.rfid.antennaSelected = 1;
    window.rfid.tagID = tagId;
    setProperties({...LocateTag.options})
    window.rfid.locateTag();
  },
  precisionSingleScan: ()=>{
    if(!isConnected) throw new Error("Connection not initialized")
    window.rfid.tagEvent = "precisionSingleScanHandler(%json)"
    setProperties({...PrecisionSingleScan.options})
    window.rfid.performInventory()
  
    setTimeout(()=>{
      stop()
      console.log("cached for precision", PrecisionSingleScan.precisionScanCache)
      PrecisionSingleScan.calcNearest(PrecisionSingleScan.precisionScanCache[Symbol.iterator](), (found)=>{
        console.log("found is",found)
        if(!found) return
        if(PrecisionSingleScan._onPrecisionScanning)PrecisionSingleScan._onPrecisionScanning(found)
        PrecisionSingleScan.precisionScanCache = []
      })    
    },3000)
  },
  calcNearest: (iter, callback, currentNearest)=>{
    const current:IteratorResult<any, TagData> = iter.next()
        if(current.done){
          console.log("done", currentNearest)
          callback(currentNearest?.tag)
          PrecisionSingleScan._onLocateNearest = null
          return
        }
        let callbackCounter = 0
        let finalDistance = 0
        const locateNearestCallback = (distance:number)=>{
          //checks 3 different result of locate before continuing to have better precision
          callbackCounter++;
          if(finalDistance < distance) finalDistance = distance
          if(callbackCounter<=3) return

          stop()
          PrecisionSingleScan._onLocateNearest = null
          console.log("currently found", {i:current.value, distance, cn:{...currentNearest}, condition: distance > PrecisionSingleScan.minDistance && (!currentNearest || (currentNearest &&  distance > currentNearest.distance)), nearstExists: Boolean(currentNearest), morethan0: distance > 0})
          if(distance > PrecisionSingleScan.minDistance && (!currentNearest || (currentNearest &&  distance > currentNearest.distance))) currentNearest = {tag:current.value, distance}
          console.log("selected nearest", currentNearest)
          return PrecisionSingleScan.calcNearest(iter, callback, currentNearest)
        }
        PrecisionSingleScan.locateNearest(current.value.tagID, locateNearestCallback)
      
  }
  
}

const Enumerate:{
  enumRfid: (data:EnumRfidResult[])=>void,
  _onEnumerate: ((data: EnumRfidResult[]) => void) | null,
  enumerate: ()=> void
} = {
  enumRfid: (data) => {
    if (Enumerate._onEnumerate) Enumerate._onEnumerate(data);
  },
  _onEnumerate: null,
  enumerate: () => {
    console.log(window.rfid)
    window.rfid.enumRFIDEvent = "enumRfid(%s);";
    window.rfid.enumerate();
  }

}



/* WINDOW DECLARATIONS */
window.scanSingleRfidHandler = SingleScan.scanSingleRfidHandler 
window.precisionSingleScanHandler = PrecisionSingleScan.precisionSingleScanHandler
window.tagLocateHandler = LocateTag.tagLocateHandler
window.locateNearestHandler = PrecisionSingleScan.locateNearestHandler
window.enumRfid = Enumerate.enumRfid
window.statusHandler = Status.statusHandler


/**
 * @function
 * @param {object} props - rfid object properties
 * @returns {boolean} operation success/failure
 *@link for the list of parameters see official zebra documentation:  https://techdocs.zebra.com/enterprise-browser/3-3/api/re2x/rfid/
 */

export const setProperties = Locals.setProperties

/**
 * attaches the library to the current component
 * call detach when unmounting/onDestroy
 * NOTE: params are to be passed as an object
 * @function
 * @param {function} success - gets called on connection event
 * @param {function} failure - gets called on connection event
 */
export const attach = Locals.attach

/**
 * @function
 * @param {onEnumerateEvent} callback - function that gets called during "enumerate()" execution
 */
export const onEnumerate = (callback: ((data: EnumRfidResult[]) => void) | null) => {
  Enumerate._onEnumerate = callback;
  
};

/**
 * @function
 * @param {onInventoryEvent} callback - function that gets called during "startInventory()" execution
 */
export const onInventory = (callback: ((data: TagData[]) => void) | null) => {
  Inventory._onInventory = callback;
};


/**
 * @function
 * @param {onScanSingleRfidEvent} callback - function that gets called during "scanSingleRfid" operation
 */
export const onScanSingleRfid = (callback: ((data: TagData) => void) | null) => {
  SingleScan._onSingleScan = callback;
};

/**
 * @param {onTagLocateEvent} callback - function called when locating a tag
 * @function
 */
export const onTagLocate = (callback: ((data: TagLocateData) => void)| null) => {
  LocateTag._onTagLocate = callback;
};

export const setPrecisionSingleScanOpt = (options:Settings) =>{
  PrecisionSingleScan.options = {...PrecisionSingleScan.options, ...options}
}

export const onPrecisionScanning = (callback: (data:TagData)=>void)=>{
  PrecisionSingleScan._onPrecisionScanning = callback
}

/**
 *
 * @returns {boolean} true if the library has initialized correctly
 */
export const isConnected: () => boolean = () => Locals._isConnected;

/**
 * detaches library from component resetting callbacks & properties
 * @function
 * @param {function} onDisconnection - called on disconnection event
 */
export const detach = Locals.detach;

/**
 * Calls "onEnumerate" callback function and returns the number of rfid scanners
 * @returns {number} number of rfid scanners found
 * @function
 */
export const enumerate = Enumerate.enumerate

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
export const locateTag = LocateTag.locateTag

export const setLocateTagOpt = (options: Settings) => {
  LocateTag.options = {...LocateTag.options, ...options}
}

export const setPrecisionSingleScanMinDistance = (newDistance:number)=>{
  PrecisionSingleScan.minDistance = newDistance
}

/**
 * performs inventory and triggers tagEvent
 */
export function startInventory() {
  if (!Locals._isConnected) throw new Error("connection not initialized");
  window.rfid.tagEvent = "inventoryHandler(%json);";
  setProperties({ ...Inventory.options });
  window.rfid.performInventory();
}

export const precisionSingleScan = PrecisionSingleScan.precisionSingleScan

/**
 *
 * @param {object} options - new inventory options
 * check out all the options available  on {@link https://techdocs.zebra.com/enterprise-browser/3-3/api/re2x/rfid/}
 */
export const setInventoryOpt = (options: Settings) => {
  Inventory.options = { ...Inventory.options, ...options };
};

/**
 *
 * @param {object} options - new single scan options
 * check out all the options available  on {@link https://techdocs.zebra.com/enterprise-browser/3-3/api/re2x/rfid/}
 */
export const setSingleScanOpt = (options: Settings) => {
  SingleScan.options = { ...SingleScan.options, ...options };
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
export const scanSingleRfid = SingleScan.scanSingleRfid

