# zebra-react-lib

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

<dt><a href="#enumerate">enumerate()</a> ⇒ <code>number</code></dt>
<dd><p>Calls &quot;onEnumerate&quot; callback function and returns the number of rfid scanners</p>
</dd>
may crash when starting an rfid operation()</a></dt>ms current rfid reader
<dd></dd>
<dt><a href="#onEnumerate">onEnumerate(callback)</a></dt>
<dd></dd>
<dt><a href="#onTagLocate">onTagLocate(callback)</a></dt>
<dd><p>locates tag</p>
</dd>
<dt><a href="#locates a tag with the given rfid">locates a tag with the given rfid()</a></dt>
<dd></dd>
<dt><a href="#startInventory">startInventory()</a></dt>
<dd><p>performs inventory and triggers tagEvent</p>
</dd>
<dt><a href="#onInventory">onInventory(callback)</a></dt>
<dd></dd>
<dt><a href="#onScanSingleRfid">onScanSingleRfid(callback)</a></dt>
<dd></dd>
</dl>

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
| callback | <code>function</code> | function that gets called during "enumerate()" execution |

<a name="onTagLocate"></a>

## onTagLocate(callback)
locates tag

**Kind**: global function

| Param | Type | Description |
| --- | --- | --- |
| callback | [<code>onTagLocateEvent</code>](#onTagLocateEvent) | function called when locating a tag |

<a name="locates a tag with the given rfid"></a>

## locates a tag with the given rfid()
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

<a name="onScanSingleRfid"></a>

## onScanSingleRfid(callback)
**Kind**: global function

| Param | Type | Description |
| --- | --- | --- |
| callback | [<code>onScanSingleRfidEvent</code>](#onScanSingleRfidEvent) | function that gets called during "scanSingleRfid" operation |

<a name="onInventoryEvent"></a>

## onInventoryEvent : <code>function</code>
**Kind**: global typedef

| Param | Type | Description |
| --- | --- | --- |
| tags | <code>Array.&lt;object&gt;</code> | individual tags found |
| reads | <code>Array.&lt;object&gt;</code> | last 50 reads |

<a name="onTagLocateEvent"></a>

## onTagLocateEvent : <code>function</code>
**Kind**: global typedef

| Param | Type | Description |
| --- | --- | --- |
| distance | <code>number</code> | the distance between the reader and the tag, goes from 0 to 100 |

<a name="onScanSingleRfidEvent"></a>

## onScanSingleRfidEvent : <code>function</code>
**Kind**: global typedef

| Param | Type | Description |
| --- | --- | --- |
| tag | <code>object</code> | tag found |

<a name="statusDefinition"></a>

## statusDefinition : <code>Object</code>
**Kind**: global typedef

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | name of the status to be associated with statusManager |
| errorCode | <code>string</code> |  |
| vendorMessage | <code>string</code> |  |
| method | <code>string</code> |  |
