/*
 *		---NOTES---
 *
 * tagEvent is used for multiple operations and thus should be reassigned before doing any operation
 *
 */
/**
 * @callback onInventoryEvent
 * @param {object[]} tags - individual tags found
 * @param {object[]} reads - last 50 reads
 */

/**
 * @callback onTagLocateEvent
 * @param {number} distance - the distance between the reader and the tag, goes from 0 to 100
 */

/**
 * @callback onScanSingleRfidEvent
 * @param {object} tag - tag found
 */

/**
 * @typedef {Object} statusDefinition
 * @param {string} name - name of the status to be associated with statusManager
 * @param {string} errorCode
 * @param {string} vendorMessage
 * @param {string} method
 * @param {string} internalCode - unique assigned code with which to identify associated callbacks
 */

/**
 * error definitions to properly identify errors
 * @type {statusDefinition[]}
 * @ignore
 */
const statusDefinitions = [
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

/** keeps track if the library is used to avoid conflicts */
let _inUse = false;
let _tagLocateCallback

let statusManager = {
  //connects to reader
  CONNECTION_EVENT: (status) => {
    defaultProperties();
    _isConnected = true;
    if (_onConnectionCallback) _onConnectionCallback();
  },
  READER_NOT_CONNECTED: (status) => {
    getReader();
  },
  RECONNECT: () => {
    disconnect();
    getReader();
  },
  //disconnects from reader
  DISCONNECTION_EVENT: (status) => {
    _isConnected = false;
    if (_onDisconnectionCallback) _onDisconnectionCallback();
  },
  READER_LIST_EMPTY: (status) => {
    getReader();
  },
};

let _isConnected = false;

//gets error name to be used as key in statusManager
const getError = (status) =>
  statusDefinitions
    .filter(
      (e) =>
        e.errorCode === status.errorCode &&
        (e.vendorMessage
          ? status.vendorMessage.includes(e.vendorMessage)
          : true) &&
        (e.method ? status.method === e.method : true)
    )
    .sort((a, b) => {
      if (a.vendorMessage.length > b.vendorMessage.length) return -1;
      if (a.vendorMessage.length < b.vendorMessage.length) return 1;
      return 0;
    })[0]?.internalCode;

window.statusHandler = (status) => {
  const callback = statusManager[getError(status)];
  if (callback) callback(status);
  else if (status.errorCode != 1000)
    console.warn(
      status.vendorMessage + status.errorCode + status.vendorMessage
    );
  else console.log("non error status", status);
};

window.tagLocateHandler = (data) => {if(_tagLocateCallback)_tagLocateCallback(data);}

/**
 *
 * @param {object} handlers - object containing error handlers
 * @function
 * syntax:
 * key:{string}error, value:{function}handler
 */
export const addStatusHandlers = (handlers) => {
  statusManager = Object.assign(statusManager, handlers);
};

//definitions
let onTagEvent = () => {};
let onSingleScanEvent = () => {};
window.enumRfid = () => {};

const singleScanOpt = {
  stopTriggerType: "duration",
  reportUniqueTags: 0,
  stopObservationCount: 5,
  reportTrigger: 0,
  stopDuration: 500,
  enableTagSeenCount: 1,
};

const performInventoryOpt = {
  stopTriggerType: "duration",
  reportUniqueTags: 1,
  reportTrigger: 1,
  enableTagSeenCount: 0,
};

/**
 * @function
 *
 * @param {object} props - rfid object properties
 *
 * @returns {boolean} operation success/failure
 *
 * for the list of parameters see official zebra documentation: https://techdocs.zebra.com/enterprise-browser/3-3/api/re2x/rfid/
 */
export const setProperties = (props) => {
  const rfid = window.rfid;
  if (rfid) {
    window.rfid = Object.assign(rfid, props);
    console.log("setProps", { props, rfid });
    return true;
  }
  console.log("setProps failed");
  return false;
};

window.scanSingleRfidHandler = (dataArray) =>
  onSingleScanEvent(dataArray.TagData);

/**
 * EXPERIMENTAL
 * @param {function} callback - called when op finished
 */
export const precisionSingleScan = (callback) => {
  setProperties({...singleScanOpt})
  const oldOnScan = _tagLocateCallback;
  onScanSingleRfid((tags) => {
    stop();
    console.log("stopped", new Date().getTime());
    console.log("pres scan",tags);
    if (tags.length === 1) {
      callback(tags.at(0));
      return
    };

    console.log("searching 4 closest");
    const iterator = tags[Symbol.iterator]();
    let result = { d: 0 };

    //DIO PERDONAMI
    let current = iterator.next();
    onTagLocate((data) => {
      console.log("current", current);
      stop();
      d = data.TagLocate;
      if (d > result.d) result = { ...current.value, d: 0 };
      if (current.done) {
        console.log("result b4 callback", result);
        callback(result);
        onScanSingleRfid(oldOnScan);
        return;
      }
      current = iterator.next();
      locateTag(current.value.tagID);
    });
    locateTag(current.value.tagID)
  });
  scanSingleRfid()
};

window.inventoryHandler = (dataArray) => {
  onTagEvent([...dataArray.TagData]);
};

let hasInit = false;

function init() {
  console.log("init");
  rfid.statusEvent = "statusHandler(%json)";
  getReader();
}

let _onConnectionCallback;
let _onDisconnectionCallback;
let _onConnectionFailed;

/**
 * attaches the library to the current component
 * call detach when unmounting/onDestroy
 * NOTE: params are to be passed as an object
 * @param {function} success - gets called on connection event
 * @param {function} failure - gets called on connection event
 */
export const attach = ({ success, failure }) => {
  _onConnectionFailed = failure;
  if (_inUse) {
    if (_onConnectionFailed) _onConnectionFailed();
    return;
  }
  _onConnectionCallback = success;
  _inUse = true;
  let interCount = 0;
  //leave at the bottom
  const interInit = setInterval(() => {
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
      _onConnectionFailed();
      clearInterval(interInit);
    }
  }, 300);
};

export const isConnected = () => _isConnected;

/**
 * detaches library from component resetting callbacks & properties
 * @param {function} onDisconnection - called on disconnection event
 */
export const detach = (callback) => {
  //TODO: reset props of rfid
  _onDisconnectionCallback = callback;
  if (!hasInit) return;
  onEnumerate(() => {});
  onInventory(() => {});
  onScanSingleRfid(() => {});
  onSingleScanEvent(() => {});
  onTagEvent(() => {});
  onTagLocate(() => {});
  disconnect();
  hasInit = false;
  _inUse = false;
};

function getReader() {
  console.log("searching for reader");
  onEnumerate((readers) => {
    rfid.readerID = readers[0][0];
  });
  rfid.enumerate();
  rfid.connect();
}

function defaultProperties() {
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
export const enumerate = () => rfid.enumerate();

/**
 * @function
 * disconnects current rfid reader
 *
 * WARNING: when no rfid reader is connected the program
 * may crash when starting an rfid operation
 */
export const disconnect = () => {
  rfid.disconnect();
};

/**
 * @function
 * @param {function} callback - function that gets called during "enumerate()" execution
 */
export const onEnumerate = (callback) => {
  window.enumRfid = callback;
  rfid.enumRFIDEvent = "enumRfid(%s);";
};

/**
 * locates tag
 * @param {onTagLocateEvent} callback - function called when locating a tag
 * @function
 */
export const onTagLocate = (callback) => {
  _tagLocateCallback = callback;
};

/**
 * @function
 * locates a tag with the given rfid
 */
export const locateTag = (tagId) => {
  if (!tagId) return;
  if (!_isConnected) throw new Error("connection not initialized");
  rfid.tagEvent = "tagLocateHandler(%json);";
  rfid.antennaSelected = 1;
  rfid.tagID = tagId;
  rfid.locateTag();
};

/**
 * performs inventory and triggers tagEvent
 */
export function startInventory() {
  if (!_isConnected) throw new Error("connection not initialized");
  console.log("before set props", performInventoryOpt);
  setProperties({ ...performInventoryOpt });
  rfid.tagEvent = "inventoryHandler(%json);";
  rfid.performInventory();
}

/***
 * @function
 * stops current operation
 */
export const stop = () => {
  try {
    rfid.stop();
  } catch (e) {
    console.error(e);
  }
};

/**
 * @function
 * @param {onInventoryEvent} callback - function that gets called during "startInventory()" execution
 */
export const onInventory = (callback) => {
  onTagEvent = callback;
};

export const scanSingleRfid = () => {
  if (!_isConnected) throw new Error("connection not initialized");
  //setting options
  setProperties({ ...singleScanOpt });
  rfid.tagEvent = "scanSingleRfidHandler(%json);";
  rfid.performInventory();
};

/**
 * @param {onScanSingleRfidEvent} callback - function that gets called during "scanSingleRfid" operation
 * @function
 */
export const onScanSingleRfid = (callback) => {
  onSingleScanEvent = callback;
};
