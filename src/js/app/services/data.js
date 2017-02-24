(function() {
    angular.module('Data', [])
	.factory("Data", ['ngProgressFactory', '$rootScope', '$q', function (ngProgressFactory, $rootScope, $q) {
		
			/*
			var progressBar = ngProgressFactory.createInstance();
			//progressBar.setParent(document.getElementById('main-container'));
			progressBar.queue = 0;
			progressBar.updateQueue = function(value){
				var startedNow = true;
				if(progressBar.queue == 0) startedNow = false;
				progressBar.queue = progressBar.queue + value;
				
				if(progressBar.queue > 0) {
					if(!startedNow) {
						progressBar.start();
					}
					else{
						if(progressBar.queue != 1){
							var newVal = (100 / progressBar.queue);
							progressBar.set(newVal);
							progressBar.start();
						}
					}
				}
				else{
					progressBar.complete();
				}
			}*/			
		    var Data = {};
			
			// maintain progress bar when any parsing is in progress
			Data.progressBar = ngProgressFactory.createInstance();
			
			Data.resetLogs = function(){
				$rootScope.dataset.logs.web 		= new Array();
				$rootScope.dataset.logs.kernel 		= new Array();
				$rootScope.dataset.logs.iserver 	= new Array();
				$rootScope.dataset.logs.skipped 	= new Array(),
				
				$rootScope.dataset.indexes.web 		= 0;
				$rootScope.dataset.indexes.kernel	= 0;
				$rootScope.dataset.indexes.iserver	= 0;
				$rootScope.dataset.indexes.skipped	= 0;
				
				$rootScope.dataset.state.filesParsed  = 0;
				$rootScope.dataset.state.filesParsing = 0;
				$rootScope.totalData = 0;
			}
			// maybe move this into a helper class?
			// We have a predefined template of columns. Any extra column found in row that isn't in this list is added into the 'others' column
            Data.concatExtraColsWeb = function(row){					
				var template = { 
				    'package' : 'Java package within which message was triggered', 
				    'level' : 'Logging level',
				    'miliseconds' : 'Message milliseconds',
				    'timestamp' : 'Message timestamp',
				    'thread' : 'Thread ID',
				    'class' : 'Java class that triggered this message',
				    'method' : 'Method in java class that triggered this message',
				    'message' : 'Message',
				    'exception' : 'Full exception, if available',
					'others' : 'Used as a placeholder for abnormal extra xml tags and values'
				};
				
				if(!row.hasOwnProperty('others')) row.others = "";											
				for (var key in row) {
					// check against list for known keys
				    if (!template.hasOwnProperty(key) && row.hasOwnProperty(key) && typeof(row[key]) == 'string') {
					    //console.log($rootScope.dataset.indexes.web + ": "+ key + " ( "+  typeof(row[key]) + ") -> " + row[key]);
						row.others += "(" + key + ")->" + row[key] + "; \n";
					}
				}
			};
			
			Data.isDate = function(date) {
			    return (new Date(date) !== "Invalid Date" && !isNaN(new Date(date)) ) ? true : false;
			}
			Data.splitDt = function(str){
				var arr = str.split(' '),
				    result = arr.splice(0,2);

				result.push(arr.join(' '));
				return result;
			}
			// WARNING: too painful to include supplementary planes, these characters (0x10000 and higher) 
			// will be stripped by this function. See what you are missing (heiroglyphics, emoji, etc) at:
			// http://en.wikipedia.org/wiki/Plane_(Unicode)#Supplementary_Multilingual_Plane
			Data.sanitizeStringForXML = function(theString) {
			    "use strict";
				var NOT_SAFE_IN_XML_1_0 = /[^\x09\x0A\x0D\x20-\xFF\x85\xA0-\uD7FF\uE000-\uFDCF\uFDE0-\uFFFD]/gm;
			    return theString.replace(NOT_SAFE_IN_XML_1_0, '');
			}

			Data.removeInvalidCharacters = function(node) {
			    "use strict";

			    if (node.attributes) {
			        for (var i = 0; i < node.attributes.length; i++) {
			            var attribute = node.attributes[i];
			            if (attribute.nodeValue) {
			                attribute.nodeValue = sanitizeStringForXML(attribute.nodeValue);
			            }
			        }
			    }
			    if (node.childNodes) {
			        for (var i = 0; i < node.childNodes.length; i++) {
			            var childNode = node.childNodes[i];
			            if (childNode.nodeType == 1 /* ELEMENT_NODE */) {
			                removeInvalidCharacters(childNode);
			            } else if (childNode.nodeType == 3 /* TEXT_NODE */) {
			                if (childNode.nodeValue) {
			                    childNode.nodeValue = sanitizeStringForXML(childNode.nodeValue);
			                }
			            }
			        }
			    }
			}
            Data.parseWebXMLLog = function(logContents){
                // web log files are xml but aren't wrapped in an XML tab.
                var xml = "<xml>" + logContents +"</xml>";
				
                var x2js = new X2JS();
                var json = x2js.xml_str2json(xml);
				if(!json){
					xml = this.sanitizeStringForXML(xml);
					json = x2js.xml_str2json(xml);
					if(!json){
						console.error("Unhandled & unparsable web log found ",logContents);
						Data.logParserError("Unhandled & unparsable web log found, check the javascript console for details.",'Warning',"");
						
						$rootScope.dataset.state.filesParsed++;
						if($rootScope.dataset.state.filesParsed == $rootScope.dataset.state.filesParsing){
							Data.progressBar.complete();
							$rootScope.dataset.state.isParsing = false;
						}
						return;
					}
				}
                if(json.xml.record.length){
                    //console.log("Processing " + json.xml.record.length + " rows");

                    for(var ii = 0;ii< json.xml.record.length;ii++){
                        Data.concatExtraColsWeb(json.xml.record[ii]);

                        json.xml.record[ii].id = $rootScope.dataset.indexes.web;
                        $rootScope.dataset.logs.web.push(json.xml.record[ii]);
                        $rootScope.dataset.indexes.web++;
						$rootScope.totalData++;
                    }
                }else{
                    //console.log("Processing 1 row");
                    Data.concatExtraColsWeb(json.xml.record);

                    json.xml.record.id = $rootScope.dataset.indexes.web;
                    $rootScope.dataset.logs.web.push(json.xml.record)
                    $rootScope.dataset.indexes.web++;
					$rootScope.totalData++;
                }

				$rootScope.dataset.state.filesParsed++;
				if($rootScope.dataset.state.filesParsed == $rootScope.dataset.state.filesParsing){
					Data.progressBar.complete();
					$rootScope.dataset.state.isParsing = false;
				}
                //console.log("Current dataset: ", $rootScope.dataset);
				$rootScope.$broadcast("dataset.web.added");
                console.log("current weblog dataset contains this many log rows: ", $rootScope.dataset.logs.web.length)
            }
			Data.processKernelMessage = function(message, dataset, index){
				//console.log("message length: ",message.length);
				var command = message[1];
				
				// if message was accidently broken into extra pieces, by the ":" split in previous method, add them to restore the full XML structure
				if(message.length > 2){
					for(var i = 2;i < message.length;i++)
						command += message[i];
				}
				
				var XMLCommand = "",
					XMLRaw = "",
					XMLDetails = "";
				
				// check if message[1] starts with <st or <mi, else it has other valuable information we shouldn't ignore
				if(command.startsWith("<st")){
					// xml command
					var xml 	= "<xml>" + command +"</xml>";
	                var x2js = new X2JS();
	                var json = x2js.xml_str2json(xml);
					
					if(!json){
						debugger;
					}
					XMLRaw = json.xml;
					XMLCommand = json.xml.st.sst.st.cmd;
					
				}else if(command.startsWith("<") /*|| command.startsWith("<mi") || command.startsWith("<svrd")*/){
					// xml command
					var xml 	= "<xml>" + command +"</xml>";
	                var x2js = new X2JS();
	                var json = x2js.xml_str2json(xml);
					var attempts = 0;
					var currentIndex = index;
					while(!json && attempts < 20){
						// sometimes the Kernel XML API trace continues a message on a new line. This breaks the 'one message per line' rule, so we'll append the xml from the next line if this happens.
						command = command + dataset[index + 1];
						
						// edit the original dataset too (not the file, just in memory) for consistency
						dataset[currentIndex] += dataset[index + 1];
						
						// blank out the next element in the dataset, so it doesn't get falsely parsed
						dataset[index + 1] = "";
						
						// try to parse again
						xml 	= "<xml>" + command +"</xml>";
						x2js = new X2JS();
						json = x2js.xml_str2json(xml);
						
						// increase the index and re-loop if needed
						index++;
						attempts++;
						//debugger;
					}
					XMLRaw = json.xml;
				}else{
					XMLDetails = command;
					// different type of message, e.g. object ID or error occurred:
					//2016-06-01 17:03:04.288 [HOST:YINHWANGV101][PID:5960][THR:6368][Kernel XML API][Trace] XML GetFolderID result: D43364C684E34A5F9B2F9AD7108F7828
					//2016-06-01 17:03:57.968 [HOST:YINHWANGV101][PID:5960][THR:5372][Kernel XML API][Trace] XMLRebuildReportEx: create new message 98A374A34E0FFC6EEF6181906F3D49E6
					//2016-06-01 17:03:58.607 [HOST:YINHWANGV101][PID:5960][THR:3852][Kernel XML API][Trace] XML Command failed. ReturnCode=-2147008845, 0x00000000

				}
				// split context information into usable data (date, time, host, PID, Thread)
				var context = this.splitDt(message[0]);
				var XMLactionName = context[2].substring(context[2].lastIndexOf('XML'));//e.g. XML Command
				
				var logContext = context[2].substr(0, context[2].lastIndexOf('XML') - 1);//[HOST:SERVERNAME][PID:5960][THR:6368][Kernel XML API][Trace]
				var logContextParts = logContext.split(/[[\]]{1,2}/);
				 // the last entry is dummy, need to take it out
				logContextParts.length--;

				// build log message object
				//2016-06-01 17:03:14.335 [HOST:YINHWANGV101][PID:5960][THR:4852][Kernel XML API][Trace] XML Command: <st><sst><st><cmd><get_svrdef_settings/></cmd></st></sst></st>
				var kernelMessage = {
					id: 			$rootScope.dataset.indexes.kernel,
					date: 			context[0],
					time: 			context[1],
					
					host:  			logContextParts[1].split(":")[1],
					pid: 			logContextParts[2].split(":")[1],
					thread: 		logContextParts[3].split(":")[1],
					
					XMLActionName: 	XMLactionName,//XML Command, XML GetFolderID, etc
					XMLDetails: 	XMLDetails,//other details, if not xml string
					XMLRaw: 		JSON.stringify(XMLRaw),//xml
					XMLCommand: 	JSON.stringify(XMLCommand),//xml.st.sst.st.cmd
				}
				//console.log("kernel message parsed: ",kernelMessage);

				$rootScope.dataset.indexes.kernel++;
                $rootScope.dataset.logs.kernel.push(kernelMessage)
				$rootScope.totalData++;				
			}
			Data.parseKernelXMLLog = function(logContents){
				var messages = logContents.split(/\r?\n/);//split by newlines
				if(messages.length){
                    //console.log("Processing " + messages.length + " rows");
					
					// loop through each kernel API message/row for post-processing
					for(var i = 0;i < messages.length;i++){
						var message = messages[i];
						
						// extract XML command from message
						var splitMessage = message.split(": ");
						if(splitMessage.length < 2){
								// found a failed XML command. These aren't consistent to the syntax of other messages (don't have a ":" at the end), but they're still valuable so we'll parse them differently.
							if(message.indexOf("ReturnCode") !== -1){
								// console.log("Found a failed XML command",message);
								splitMessage = message.split(". ");
								
							}else if(message.indexOf("result") !== -1){
								// console.log("Found a failed XML command",message);
								//2016-06-08 10:22:47.093+01:00 [HOST:A97SV50514117AP][PID:1912][THR:6912][Kernel XML API][Trace] XML SaveToInbox result 0
								splitMessage = message.split("result ");
								splitMessage[0] += "result ";
								
							}else if(message.indexOf("finished") !== -1){
								// console.log("Found a failed XML command",message);
								//2017-02-05 12:59:17.154-05:00 [HOST:MSR-PROD-MSTR01][SERVER:CastorServer][PID:10336][THR:1088][Kernel XML API][Trace] XML XMLGetFeatureInfos finished

								splitMessage = message.split(" finished");
								splitMessage[0] += " finished";
								
							}else if(message.indexOf("Successful") !== -1){
								// console.log("Found a failed XML command",message);
								//2017-02-05 12:59:17.154-05:00 [HOST:MSR-PROD-MSTR01][SERVER:CastorServer][PID:10336][THR:1088][Kernel XML API][Trace] XML XMLGetFeatureInfos finished

								splitMessage = message.split(" Successful");
								splitMessage[0] += " Successful";								
							}else if(message.indexOf("# MicroStrategy Log version") !== -1){
								// skip lines that don't have a log line, e.g. "# MicroStrategy Log version 2.0"							
								console.log("Silently skipping this message, since it has no value: "+message);
								continue;
							}else if(message.length == 0){
								console.log("Silently skipping empty log line, since it has no value: "+message);
								continue;
							}else{
								console.error("Unhandled & unparsable log line found ",message);
								Data.logParserError("Unhandled & unparsable log line found, check the javascript console for details. Last skipped log message: "+message,'Warning',message);
								continue;
							}
						}
						
						//console.log("parsing line: ",i);
						Data.processKernelMessage(splitMessage, messages, i);
					}
					console.log("finished processing this kernel XML file");
					
				}else{
					console.log("No kernel messages in this API trace");
				}
				
				$rootScope.dataset.state.filesParsed++;
				if($rootScope.dataset.state.filesParsed == $rootScope.dataset.state.filesParsing){
					Data.progressBar.complete();
					$rootScope.dataset.state.isParsing = false;
				}
				$rootScope.$broadcast("dataset.kernel.added");
                console.log("current kernelAPI dataset contains this many log rows: ", $rootScope.dataset.logs.kernel.length);
			}
			
			Data.recogniseLog = function(logContents){				
				if(logContents.startsWith("<record"))
					return "webXML";
				
				else if(logContents.indexOf("Kernel XML API") !== -1){
					return "kernelXML";
				}
				else return "unknown";
			}
			Data.logParserError = function(error,level,logLine){
				if(typeof(level) == 'undefined') level = 'Danger';
				if(typeof(logLine) != 'undefined'){
					$rootScope.dataset.logs.skipped.push(logLine);
				}
				
				$rootScope.dataset.indexes.skipped++;
				var error = {
					data: {
						status: level,
						message: $rootScope.dataset.indexes.skipped+" lines were not parsed",
						cause: "Reason: " + error,
					}
				}
				Data.handleError(error);
				//debugger;
			}
			Data.handleError = function(e){
				if(typeof(e.data) != 'undefined' && e.data){
					//console.log("POST failed",e);
					console.error(e.data.status + " : " + e.data.message + " : " + e.data.cause);
					$rootScope.hasError = true;
					$rootScope.error = {
						status: e.data.status,
						message: e.data.message,
						cause: e.data.cause
					}; 
				}else{
					//don't think this will ever hit, unless server is unreachable?
					$rootScope.hasError = true;
					$rootScope.error = {
						status: -1,
						message: "uncaught exception",
						cause: "Verify the log file is valid"
					}; 
				}
			};
			// generalist method that takes a log file's contents, decides the log type, and passes the log file to the appropriate parser method
			Data.processNewLog = function(logContents){				
                //logic to determine the type of log (web/webxmlAPI/kernelAPI/DSSErrors.log)
				var logType = Data.recogniseLog(logContents);
				switch(logType){
					case "webXML":
						//console.log("Handling " + logType + " log");
						Data.parseWebXMLLog(logContents);
						break;
					
					case "kernelXML":
						//console.log("Handling " + logType + " log");
						Data.parseKernelXMLLog(logContents);
						break;
					
					default:
						console.error("Error: unhandled log type - type not recognized. Original file: ",logContents);
						var error = {
							data: {
								status: "Parse Failure",
								message: "Unrecognised Log Type",
								cause: "Verify the log file is valid. Contact Tiago if the issue persists."
							}
						}
						Data.handleError(error);
						break;
				}
			}
			Data.testCreation = function(){
				//console.log("Test creation");	
                Data.resetLogs();
				
				var demoWebLog = '<record reset="true">'
+ '  <package>com.microstrategy.webapi</package>'
+ '  <level>SEVERE</level>'
+ '  <miliseconds>1468261032622</miliseconds>'
+  '<timestamp>07/11/2016 19:17:12:624</timestamp>'
+  '<thread>4</thread>'
+  '<class>MSIMsgBuf</class>'
+  '<method>ReadFromChannel</method>'
+  '<message>MsiNetStreamI : Read error. (com.microstrategy.webapi.MSTRWebAPIException)</message>'
+  '<exception>com.microstrategy.webapi.MSTRWebAPIException: MsiNetStreamI : Read error.&#x0A;&#x09;at com.microstrategy.webapi.MSIMsgBuf.readError(Unknown Source)&#x0A;&#x09;at com.microstrategy.webapi.MSIMsgBuf.read(Unknown Source)&#x0A;&#x09;at com.microstrategy.webapi.MSIMsgBuf.ReadHeader(Unknown Source)&#x0A;&#x09;at com.microstrategy.webapi.MSIMsgBuf.ReadFromChannel(Unknown Source)&#x0A;&#x09;at com.microstrategy.webapi.CDSSMsg.ReadFromChannel(Unknown Source)&#x0A;&#x09;at com.microstrategy.webapi.MSIClusterClient.GetClusterMembership(Unknown Source)&#x0A;&#x09;at com.microstrategy.webapi.CDSSXMLClusterNode.getClusterMembership(Unknown Source)&#x0A;&#x09;at com.microstrategy.webapi.CDSSXMLClusterNode.RefreshClusterMembership(Unknown Source)&#x0A;&#x09;at com.microstrategy.webapi.CDSSXMLAdmin.InitConnection(Unknown Source)&#x0A;&#x09;at com.microstrategy.webapi.CDSSXMLAdmin.Connect(Unknown Source)&#x0A;&#x09;at com.microstrategy.web.objects.WebClusterAdminImpl.connect(Unknown Source)&#x0A;&#x09;at com.microstrategy.web.admin.beans.AdminServersHelper.connectIServers(Unknown Source)&#x0A;&#x09;at com.microstrategy.web.admin.beans.AdminServersHelper.connectIServers(Unknown Source)&#x0A;&#x09;at com.microstrategy.web.admin.beans.AdminServersHelper$ServerConnectionsUpdateTask.run(Unknown Source)&#x0A;&#x09;at java.util.TimerThread.mainLoop(Timer.java:555)&#x0A;&#x09;at java.util.TimerThread.run(Timer.java:505)&#x0A;Caused by: java.net.SocketException: Operation timed out&#x0A;&#x09;at java.net.SocketInputStream.socketRead0(Native Method)&#x0A;&#x09;at java.net.SocketInputStream.read(SocketInputStream.java:152)&#x0A;&#x09;at java.net.SocketInputStream.read(SocketInputStream.java:122)&#x0A;&#x09;... 15 more&#x0A;</exception>'
				+ '</record>';	
				
				//demoWebLog = 'something';
				
				var demoKernelLog = '# MicroStrategy Log version 2.0\n'
				+'2016-06-01 17:03:04.288 [HOST:YINHWANGV101][PID:5960][THR:6368][Kernel XML API][Trace] XML Command: <st><sst><st><cmd><gfid sid="E8F075203D0B18A9746C2AB2061BAB85" fdn="39"/></cmd></st></sst></st>\n'
				+'2016-06-01 17:03:04.288 [HOST:YINHWANGV101][PID:5960][THR:6368][Kernel XML API][Trace] XML GetFolderID result: D43364C684E34A5F9B2F9AD7108F7828\n'
				+'2016-06-01 17:03:04.304 [HOST:YINHWANGV101][PID:5960][THR:6468][Kernel XML API][Trace] XML Command: <st><sst><st><cmd><go sid="E8F075203D0B18A9746C2AB2061BAB85" oid="D3C7D461F69C4610AA6BAA5EF51F4125" ot="8" os="268453447" lv="0" bb="1" bc="-1"><extendable_parameter><browsing/></extendable_parameter></go></cmd></st></sst></st>\n'
				+'2016-06-01 17:03:04.335 [HOST:YINHWANGV101][PID:5960][THR:6468][Kernel XML API][Trace] XML GetObjects result: <mi rfd="0" mnri="0" lcl="1033" mxri="6"><in><oi id="0" n="Reports" des="" ab="" did="D3C7D461F69C4610AA6BAA5EF51F4125" tp="8" stp="2048" sta="1073873239" mf="1" acg="255" vr="E979E433412E6C16CBC60382B2C8A0C2" icp="" ct="10/9/2013 6:38:41 PM" nct="2013-10-09 18:38:41" mdt="10/21/2015 9:57:05 AM" nmdt="2015-10-21 09:57:05"><ow did="54F3D26011D2896560009A8E67019608">Administrator</ow></oi><oi id="1" n="Public Objects" des="Folder for all public objects" ab="" did="98FE182C2A10427EACE0CD30B6768258" tp="8" stp="2048" sta="1073873239" acg="255" vr="302201DE49384B53F420DF8CE0F5E94A" icp="" ct="10/9/2013 6:38:41 PM" nct="2013-10-09 18:38:41" mdt="9/29/2015 10:43:17 AM" nmdt="2015-09-29 10:43:17"><ow did="54F3D26011D2896560009A8E67019608">Administrator</ow></oi><oi id="2" n="SMS" des="" ab="" did="D43364C684E34A5F9B2F9AD7108F7828" tp="8" stp="2048" sta="1073873279" acg="255" vr="6B52AEFD47E5DB4605FFFAA76F6DC677" icp="" ct="1/15/2014 4:25:55 PM" nct="2014-01-15 16:25:55" mdt="9/29/2015 10:43:17 AM" nmdt="2015-09-29 10:43:17"><ow did="54F3D26011D2896560009A8E67019608">Administrator</ow></oi><oi id="3" n="Everyone" des="All Users in the system.  Note that this group has no access to any MicroStrategy objects." ab="Everyone" did="C82C6B1011D2894CC0009D9F29718E4F" tp="34" stp="8705" sta="1073881471" acg="255" vr="7D7E24764E078209CFB5C9A4142639EE" icp="" ct="9/23/2013 9:47:43 PM" nct="2013-09-23 21:47:43" mdt="9/29/2015 10:36:44 AM" nmdt="2015-09-29 10:36:44"/><oi id="4" n="Administrator" des="" ab="Administrator" did="54F3D26011D2896560009A8E67019608" tp="34" stp="8704" sta="1073881471" acg="255" vr="80D3AC99430B960892CEE9AFE559FEBC" icp="" ct="9/23/2013 9:47:42 PM" nct="2013-09-23 21:47:42" mdt="5/25/2016 5:45:02 AM" nmdt="2016-05-25 05:45:02"/><oi id="5" n="Public Reports" des="" ab="" did="597F62384317CD57DDE768A6F1F1817C" tp="8" stp="2048" sta="1073873239" acg="255" vr="D235835F4DCD76020B172B822E8E005C" icp="" ct="12/26/2013 10:01:37 PM" nct="2013-12-26 22:01:37" mdt="4/21/2016 8:39:22 PM" nmdt="2016-04-21 20:39:22"><ow did="54F3D26011D2896560009A8E67019608">Administrator</ow></oi><oi id="6" n="Standard Reports" des="" ab="" did="D2331EE8499DAB1B1F77CEB9831A785D" tp="8" stp="2048" sta="1073873279" acg="255" vr="B9F956CA11E4FD4CE1D000802F27718F" icp="" ct="5/15/2014 1:43:32 PM" nct="2014-05-15 13:43:32" mdt="5/18/2015 10:57:51 AM" nmdt="2015-05-18 10:57:51"><ow did="54F3D26011D2896560009A8E67019608">Administrator</ow></oi></in><as><a><fd rfd="2">SMS</fd><a><fd rfd="1">Public Objects</fd></a></a></as><acl cn="3"><ace tp="1" deny="0" inheritable="0" rights="199" trustee="3"/><ace tp="1" deny="0" inheritable="1" rights="199" trustee="3"/><ace tp="1" deny="0" inheritable="0" rights="255" trustee="4"/></acl><fct qsr="0" fcn="2" cc="2" sto="1" pfc="2" pcc="2"><fd rfd="5">Public Reports</fd><fd rfd="6">Standard Reports</fd></fct></mi>\n'
				+'2016-06-01 17:03:04.335 [HOST:YINHWANGV101][PID:5960][THR:5380][Kernel XML API][Trace] XML Command: <st><sst><st><cmd><go sid="E8F075203D0B18A9746C2AB2061BAB85" oid="D3C7D461F69C4610AA6BAA5EF51F4125" ot="8" os="268453447" lv="0" bb="1" bc="-1"><extendable_parameter><browsing/></extendable_parameter></go></cmd></st></sst></st>\n'
				+'2016-06-01 17:03:04.351 [HOST:YINHWANGV101][PID:5960][THR:5380][Kernel XML API][Trace] XML GetObjects result: <mi rfd="0" mnri="0" lcl="1033" mxri="6"><in><oi id="0" n="Reports" des="" ab="" did="D3C7D461F69C4610AA6BAA5EF51F4125" tp="8" stp="2048" sta="1073873239" mf="1" acg="255" vr="E979E433412E6C16CBC60382B2C8A0C2" icp="" ct="10/9/2013 6:38:41 PM" nct="2013-10-09 18:38:41" mdt="10/21/2015 9:57:05 AM" nmdt="2015-10-21 09:57:05"><ow did="54F3D26011D2896560009A8E67019608">Administrator</ow></oi><oi id="1" n="Public Objects" des="Folder for all public objects" ab="" did="98FE182C2A10427EACE0CD30B6768258" tp="8" stp="2048" sta="1073873239" acg="255" vr="302201DE49384B53F420DF8CE0F5E94A" icp="" ct="10/9/2013 6:38:41 PM" nct="2013-10-09 18:38:41" mdt="9/29/2015 10:43:17 AM" nmdt="2015-09-29 10:43:17"><ow did="54F3D26011D2896560009A8E67019608">Administrator</ow></oi><oi id="2" n="SMS" des="" ab="" did="D43364C684E34A5F9B2F9AD7108F7828" tp="8" stp="2048" sta="1073873279" acg="255" vr="6B52AEFD47E5DB4605FFFAA76F6DC677" icp="" ct="1/15/2014 4:25:55 PM" nct="2014-01-15 16:25:55" mdt="9/29/2015 10:43:17 AM" nmdt="2015-09-29 10:43:17"><ow did="54F3D26011D2896560009A8E67019608">Administrator</ow></oi><oi id="3" n="Everyone" des="All Users in the system.  Note that this group has no access to any MicroStrategy objects." ab="Everyone" did="C82C6B1011D2894CC0009D9F29718E4F" tp="34" stp="8705" sta="1073881471" acg="255" vr="7D7E24764E078209CFB5C9A4142639EE" icp="" ct="9/23/2013 9:47:43 PM" nct="2013-09-23 21:47:43" mdt="9/29/2015 10:36:44 AM" nmdt="2015-09-29 10:36:44"/><oi id="4" n="Administrator" des="" ab="Administrator" did="54F3D26011D2896560009A8E67019608" tp="34" stp="8704" sta="1073881471" acg="255" vr="80D3AC99430B960892CEE9AFE559FEBC" icp="" ct="9/23/2013 9:47:42 PM" nct="2013-09-23 21:47:42" mdt="5/25/2016 5:45:02 AM" nmdt="2016-05-25 05:45:02"/><oi id="5" n="Public Reports" des="" ab="" did="597F62384317CD57DDE768A6F1F1817C" tp="8" stp="2048" sta="1073873239" acg="255" vr="D235835F4DCD76020B172B822E8E005C" icp="" ct="12/26/2013 10:01:37 PM" nct="2013-12-26 22:01:37" mdt="4/21/2016 8:39:22 PM" nmdt="2016-04-21 20:39:22"><ow did="54F3D26011D2896560009A8E67019608">Administrator</ow></oi><oi id="6" n="Standard Reports" des="" ab="" did="D2331EE8499DAB1B1F77CEB9831A785D" tp="8" stp="2048" sta="1073873279" acg="255" vr="B9F956CA11E4FD4CE1D000802F27718F" icp="" ct="5/15/2014 1:43:32 PM" nct="2014-05-15 13:43:32" mdt="5/18/2015 10:57:51 AM" nmdt="2015-05-18 10:57:51"><ow did="54F3D26011D2896560009A8E67019608">Administrator</ow></oi></in><as><a><fd rfd="2">SMS</fd><a><fd rfd="1">Public Objects</fd></a></a></as><acl cn="3"><ace tp="1" deny="0" inheritable="0" rights="199" trustee="3"/><ace tp="1" deny="0" inheritable="1" rights="199" trustee="3"/><ace tp="1" deny="0" inheritable="0" rights="255" trustee="4"/></acl><fct qsr="0" fcn="2" cc="2" sto="1" pfc="2" pcc="2"><fd rfd="5">Public Reports</fd><fd rfd="6">Standard Reports</fd></fct></mi>\n'
				+'2016-06-01 17:04:09.106 [HOST:YINHWANGV101][PID:5960][THR:3856][Kernel XML API][Trace] XML GetFolderID result: D43364C684E34A5F9B2F9AD7108F7828\n'
				+'2016-06-01 17:03:58.607 [HOST:YINHWANGV101][PID:5960][THR:3852][Kernel XML API][Trace] XML Command failed. ReturnCode=-2147008845, 0x00000000\n'
				;
								
                Data.processNewLog(demoKernelLog);
                $rootScope.$apply();
			}
			
			// simple tester for parser API
			//setTimeout(Data.testCreation, 2000);
			
			
		    return Data;
		}
	])
	
})();