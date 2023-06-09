export type ZebraRfidFunctions = {
    enumerate:()=>void,
    connect: ()=>void,
    disconnect: ()=>void,
    tagEvent: string,
    locateTag: ()=>void,
    performInventory: ()=>void,
    stop: ()=>void,
    enumRFIDEvent: string
};