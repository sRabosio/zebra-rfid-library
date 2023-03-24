# zebra-rfid-library

Warning: requires script injection from eb to be enabled

## Getting started
  
  It is advised to setup enterprise browser's script tag injection to inject required libraries (eb-module.js & elements.js) into the page.

  ### Using the library
  
  1) import the library (import * as rfidlib from 'zebra-rfid-library')
  2) setup attach and detach calls, react example below:
   ```
     useEffect(() => {
      rfidlib.attach();
      return rfidlib.detach;
    }, []);
   ```
   this is to prevent memory leaks and conflicts between different components which use the library
  


## Functions

<dl>
<dt><a href="#setProperties">setProperties(props)</a> ⇒ <code>boolean</code></dt>
<dd></dd>
<dt><a href="#attach">attach(success, failure)</a></dt>
<dd><p>attaches the library to the current component
call detach when unmounting/onDestroy
NOTE: params are to be passed as an object</p>
</dd>
<dt><a href="#detach">detach(onDisconnection)</a></dt>
<dd><p>detaches library from component resetting callbacks &amp; properties</p>
</dd>
<dt><a href="#enumerate">enumerate()</a> ⇒ <code>number</code></dt>
<dd><p>Calls &quot;onEnumerate&quot; callback function and returns the number of rfid scanners</p>
</dd>
may crash when starting an rfid operation()</a></dt>ms current rfid reader
<dd></dd>
<dt><a href="#onEnumerate">onEnumerate(callback)</a></dt>
<dd></dd>
<dt><a href="#onTagLocate">onTagLocate(callback)</a></dt>
<dd></dd>
<dt><a href="#locateTag">locateTag()</a></dt>
<dd><p>locates a tag with the given rfid</p>
</dd>
<dt><a href="#startInventory">startInventory()</a></dt>
<dd><p>performs inventory and triggers tagEvent</p>
</dd>
<dt><a href="#onInventory">onInventory(callback)</a></dt>
<dd></dd>
<dt><a href="#scanSingleRfid">scanSingleRfid()</a></dt>
<dd><p>Scans a single rfid tag</p>
</dd>
<dt><a href="#onScanSingleRfid">onScanSingleRfid(callback)</a></dt>
<dd></dd>
</dl>

## Typedefs

<dl>
<dt><a href="#onEnumerateEvent">onEnumerateEvent</a> : <code>function</code></dt>
<dd></dd>
<dt><a href="#onInventoryEvent">onInventoryEvent</a> : <code>function</code></dt>
<dd></dd>
<dt><a href="#onTagLocateEvent">onTagLocateEvent</a> : <code>function</code></dt>
<dd></dd>
<dt><a href="#onScanSingleRfidEvent">onScanSingleRfidEvent</a> : <code>function</code></dt>
<dd></dd>
<dt><a href="#statusDefinition">statusDefinition</a> : <code>Object</code></dt>
<dd></dd>
</dl>

<a name="setProperties"></a>

## setProperties(props) ⇒ <code>boolean</code>
**Kind**: global function
**Returns**: <code>boolean</code> - operation success/failure
**Link**: for the list of parameters see official zebra documentation:  https://techdocs.zebra.com/enterprise-browser/3-3/api/re2x/rfid/

| Param | Type | Description |
| --- | --- | --- |
| props | <code>object</code> | rfid object properties |

<a name="attach"></a>

## attach(success, failure)
NOTE: params are to be passed as an objectent

**Kind**: global function

| Param | Type | Description |
| --- | --- | --- |
| success | <code>function</code> | gets called on connection event |
| failure | <code>function</code> | gets called on connection event |

<a name="detach"></a>

## detach(onDisconnection)
detaches library from component resetting callbacks & properties

**Kind**: global function

| Param | Type | Description |
| --- | --- | --- |
| onDisconnection | <code>function</code> | called on disconnection event |

<a name="enumerate"></a>

## enumerate() ⇒ <code>number</code>
Calls "onEnumerate" callback function and returns the number of rfid scanners

**Kind**: global function
**Returns**: <code>number</code> - number of rfid scanners found
may crash when starting an rfid operation"></a>rogram

may crash when starting an rfid operation()he program
**Kind**: global function
<a name="onEnumerate"></a>

## onEnumerate(callback)
**Kind**: global function

| Param | Type | Description |
| --- | --- | --- |
| callback | [<code>onEnumerateEvent</code>](#onEnumerateEvent) | function that gets called during "enumerate()" execution |

<a name="onTagLocate"></a>

## onTagLocate(callback)
**Kind**: global function

| Param | Type | Description |
| --- | --- | --- |
| callback | [<code>onTagLocateEvent</code>](#onTagLocateEvent) | function called when locating a tag |

<a name="locateTag"></a>

## locateTag()
locates a tag with the given rfid

**Kind**: global function
<a name="startInventory"></a>

## startInventory()
performs inventory and triggers tagEvent

**Kind**: global function
<a name="onInventory"></a>

## onInventory(callback)
**Kind**: global function

| Param | Type | Description |
| --- | --- | --- |
| callback | [<code>onInventoryEvent</code>](#onInventoryEvent) | function that gets called during "startInventory()" execution |

<a name="scanSingleRfid"></a>

## scanSingleRfid()
Scans a single rfid tag

<a name="statusDefinition"></a>

## statusDefinition : <code>Object</code>
**Kind**: global typedef

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | name of the status to be associated with statusManager |
| errorCode | <code>string</code> |  || vendorMessage | <code>string</code> |  |
| method | <code>string</code> |  |
| internalCode | <code>string</code> | unique assigned code with which to identify associated callbacks | 
