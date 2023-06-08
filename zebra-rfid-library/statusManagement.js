//@flow
import type { StatusDefintion } from "./types/StatusDefinition";

/**
 * @typedef {Object} statusDefinition
 * @param {string} name - name of the status to be associated with statusManager
 * @param {string} errorCode
 * @param {string} vendorMessage
 * @param {string} method
 * @param {string} internalCode - unique assigned code with which to identify associated callbacks
 */

type statusCallback = (status: Object) => void;

/**
 * error definitions to properly identify errors
 * @type {statusDefinition[]}
 * @ignore
 */
const statusDefinitions: StatusDefintion[] = [
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

const statusManager: { [string]: statusCallback } = {
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

//gets error name to be used as key in statusManager
const getError = (status: Object) =>
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
      if ((a.vendorMessage?.length || 0) > (b.vendorMessage?.length || 0))
        return -1;
      if ((a.vendorMessage?.length || 0) < (b.vendorMessage?.length || 0))
        return 1;
      return 0;
    })[0]?.internalCode;
