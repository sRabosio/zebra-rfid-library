
<!-- saved from url=(0063)https://techdocs.zebra.com/enterprise-browser/samples/rfid/rfid -->
<html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><title>Enterprise Browser RFID Test APP</title>
<script type="text/javascript" charset="utf-8" src="./Enterprise Browser RFID Test APP_files/ebapi-modules.js.download"></script>
<script type="text/javascript" charset="utf-8" src="./Enterprise Browser RFID Test APP_files/elements.js.download"></script>
<script type="text/javascript">
	
	var displayStr="";

	rfid.statusEvent =  "statusEvent(%json)";
	rfid.tagEvent = "TagHandler(%json)";
    
	function scanReceived(params){
            // No data or no timestamp, scan failed.
            if(params['data']== "" || params['time']==""){
                document.getElementById('display').innerHTML = "Failed!";
                return;
            }
            // Data and timestamp exist, barcode successful, show results
            var displayStr = "Barcode Data: " + params['data']+"<br>Time: "+params['time'];
            document.getElementById("display").innerHTML = displayStr;
			
        }
	function statusEvent(eventInfo)
		{ 
			//alert("Event Info: \nmethod:"+eventInfo.method+"  \nerrorCode: "+eventInfo.errorCode+"  \nvendorMessage:"+eventInfo.vendorMessage);
			displayStr="Event Info: method: "+eventInfo.method+"<br>errorCode: "+eventInfo.errorCode+"<br>vendorMessage: "+eventInfo.vendorMessage;
			document.getElementById("display").innerHTML = displayStr;
			displayStr="";
		}

	function TagHandler(tagarray)
	{	
		for (i=0; i < tagarray.TagData.length; i++)
		{
		displayStr = displayStr+"<br>RFID Data: " +tagarray.TagData[i].tagID+"<br>RSSI: "+tagarray.TagData[0].RSSI+"<br>PC: "+tagarray.TagData[0].PC+"<br>tagSeencount: "+tagarray.TagData[0].tagSeenCount;
		}
			
		document.getElementById("display").innerHTML = displayStr;
			
	}

	function Enumerate()
		{ 
			var t = document.getElementById("transportSelect");
			var selectedText = t.options[t.selectedIndex].text;
		  
		  //alert(selectedText);
		  rfid.transport= t.options[t.selectedIndex].text;
		  rfid.enumRFIDEvent = "EnumRfid(%s);"
		  //rfid.transport="bluetooth";
		  rfid.enumerate();    
		}
	function EnumRfid(rfidArray)
		{ 
			//alert("test");
			//alert(rfidArray);

			var rfidInfo = "RFID On Device: " + rfidArray.length + "--";  
		  for (i=0; i < rfidArray.length; i++)
		  {
			rfidInfo = rfidInfo +"ID:"+ rfidArray[i][0] + '\nname:'+ rfidArray[i][1] + '\naddress '+rfidArray[i][2];


		  }
		  //alert();
		  document.getElementById("display").innerHTML = rfidInfo;
		}
		
	function Connect(){			
						
		   var t = document.getElementById("readerSelect");		   
		   rfid.readerID= t.options[t.selectedIndex].text;		  
           rfid.connect();
			   
		   //alert(" connect called");            
        }
				
	function DisConnect(){
			//alert("calling disconnect");
			
           rfid.disconnect();
            // Empty property hash, '{}' loads default values for the scanner.
		}
	
		function startInventory(){
		//alert("calling rfidInventory");
		displayStr="";
		rfid.tagEvent = "TagHandler(%json)";
        rfid.performInventory();
		}
			
		function stopInventory(){
		//alert("calling rfidStop");
		rfid.stop();
	   displayStr = "";
	   document.getElementById("display").innerHTML = displayStr;
	   }
	   
	   function reset()
	{
		window.location.reload();
	}
		
	function quit() 
	{
		EB.Application.quit();
		
	}
	
</script>
<style>

table {
	border: 2px solid black;
	width:100%;
}

button{
	width: 90%;
	margin-left: 5%;
	margin-right: 5%;
	padding: 1em;
	margin-top: 2%;
	margin-bottom: 2%;
	text-align: center;
	font-size: x-large;
}
select{
	width: 75%;
	margin-left: 1%;
	margin-right: 1%;
	padding: 1em;
	margin-top: 1%;
	margin-bottom: 1%;
	text-align: center;
	font-size: x-large;
}
.noteMesg{
    font-size: x-large;
}

</style>


</head><body><h2 align="center" id="enterprise-browser-asr-api-sample-app" class="anchor"><a class="heading-anchor" href="https://techdocs.zebra.com/enterprise-browser/samples/rfid/rfid#enterprise-browser-asr-api-sample-app"><span></span></a>Enterprise Browser ASR API Sample APP</h2>

<div id="display" style="word-wrap: break-word;">
        RFID Data: <br>
        Time: <br>
</div>

<div>
<br>
	<table border="1">
		
		<tbody><tr>
			<td colspan="2" style="text-align:center;font-size:x-large;"> 
				Select transport mode:<select id="transportSelect">
				<option>serial</option>
				<option>bluetooth</option>
				<option>invalid</option>
				</select>
			</td>
		</tr>
		
		
		<tr>
			<td> 
				<button onclick="Enumerate()">Enumerate</button>
			</td>
			<td style="text-align:center;font-size:x-large;">
				 Select readerID: <select id="readerSelect">
					<option>RFID1</option>
					<option>RFID2</option>
					<option>RFID3</option>
					<option>invalid</option>
					</select>
			</td>
		</tr>
		
		<tr>
			<td> 
				<button onclick="Connect()">Connect RFID</button>
			</td>
			<td colspan="1">
				<button onclick="DisConnect();">DisConnect RFID</button>
			</td>
		</tr>
		<tr>
			<td> 
				<button onclick="startInventory()">Start Inventory</button>
			</td>
			<td colspan="1">
				<button onclick="stopInventory();">Stop Inventory</button>
			</td>
		</tr>
	</tbody></table>
	
	<table border="1">
		
		<tbody><tr>
			<td>
				<button class="col_1" width="100%" onclick="reset();">Reset App</button>
			</td>
		</tr>
		
		<tr>
			<td>
				<button class="col_1" width="100%" onclick="quit();">Quit App</button>
			</td>
		</tr>
		
	</tbody></table>
</div>








</body></html>