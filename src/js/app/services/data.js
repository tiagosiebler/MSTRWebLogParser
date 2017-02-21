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
				//debugger;
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
		    var Data = {
				//these will hold the data processed by the parser
		    	logs:{
		    		web: new Array(),
					kernel: new Array(),
					iserver: new Array()
		    	},
				//hold the state of the parser, whether it's still processing incoming data
				state:{
					isParsing: false,//processing uploaded file
					uploading: false,//uploading
					filesParsing: 0,
					filesParsed: 0,
				}
		    };
			
			// maintain progress bar when any parsing is in progress
			Data.progressBar = ngProgressFactory.createInstance();
			
			
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
					    //console.log($rootScope.index + ": "+ key + " ( "+  typeof(row[key]) + ") -> " + row[key]);
						row.others += "(" + key + ")->" + row[key] + "; \n";
					}
				}
			};
			
			// state getters
			Data.isParsing = function(){
				return Data.state.isParsing;
			}
			
			// don't think this is used yet
			Data.isUploading = function(){
				return Data.state.uploading;
			}
			
			
			Data.handleError = function(e){
				//debugger;
				if(typeof(e.data) != 'undefined' && e.data){
					console.log("POST failed",e);
					console.log(e.data.status + " : " + e.data.message + " : " + e.data.cause);
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
			Data.testCreation = function(){
				console.log("Test creation");
				
				var demoWebLog = "<record reset=\"true\"><package>com.microstrategy.webapi</package><level>SEVERE</level><miliseconds>1486986301497</miliseconds><timestamp>02/13/2017 11:45:01:497</timestamp><thread>0</thread><class>CDSSXMLDocumentServer</class><method>GetExecutionResultsEx</method><message>(Message not found in user history list. It may have been deleted from other session already. Please refresh your history list.) (com.microstrategy.webapi.MSTRWebAPIException)</message><exception>com.microstrategy.webapi.MSTRWebAPIException: (Message not found in user history list. It may have been deleted from other session already. Please refresh your history list.)&#x0A;&#x09;at com.microstrategy.webapi.CDSSXMLDocumentServer.getException(Unknown Source)&#x0A;&#x09;at com.microstrategy.webapi.CDSSXMLDocumentServer.apiException(Unknown Source)&#x0A;&#x09;at com.microstrategy.webapi.CDSSXMLDocumentServer.GetExecutionResultsEx(Unknown Source)&#x0A;&#x09;at com.microstrategy.web.tasks.DocumentXMLResultsTask$GetExecutionResultsParams.getExecutionResults(Unknown Source)&#x0A;&#x09;at com.microstrategy.web.tasks.DocumentXMLResultsTask.processRequest(Unknown Source)&#x0A;&#x09;at com.microstrategy.web.controller.TaskProcessor.processRequest(Unknown Source)&#x0A;&#x09;at com.microstrategy.web.controller.TaskProcessorController.processRequest(Unknown Source)&#x0A;&#x09;at com.microstrategy.web.servlets.TaskProcessorServlet.doGet(Unknown Source)&#x0A;&#x09;at com.microstrategy.web.servlets.TaskProcessorServlet.doPost(Unknown Source)&#x0A;&#x09;at javax.servlet.http.HttpServlet.service(HttpServlet.java:647)&#x0A;&#x09;at javax.servlet.http.HttpServlet.service(HttpServlet.java:728)&#x0A;&#x09;at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:305)&#x0A;&#x09;at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:210)&#x0A;&#x09;at org.apache.catalina.core.StandardWrapperValve.invoke(StandardWrapperValve.java:222)&#x0A;&#x09;at org.apache.catalina.core.StandardContextValve.invoke(StandardContextValve.java:123)&#x0A;&#x09;at org.apache.catalina.authenticator.AuthenticatorBase.invoke(AuthenticatorBase.java:472)&#x0A;&#x09;at org.apache.catalina.core.StandardHostValve.invoke(StandardHostValve.java:171)&#x0A;&#x09;at org.apache.catalina.valves.ErrorReportValve.invoke(ErrorReportValve.java:99)&#x0A;&#x09;at org.apache.catalina.valves.AccessLogValve.invoke(AccessLogValve.java:947)&#x0A;&#x09;at org.apache.catalina.core.StandardEngineValve.invoke(StandardEngineValve.java:118)&#x0A;&#x09;at org.apache.catalina.connector.CoyoteAdapter.service(CoyoteAdapter.java:408)&#x0A;&#x09;at org.apache.coyote.http11.AbstractHttp11Processor.process(AbstractHttp11Processor.java:1009)&#x0A;&#x09;at org.apache.coyote.AbstractProtocol$AbstractConnectionHandler.process(AbstractProtocol.java:589)&#x0A;&#x09;at org.apache.tomcat.util.net.JIoEndpoint$SocketProcessor.run(JIoEndpoint.java:312)&#x0A;&#x09;at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1142)&#x0A;&#x09;at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:617)&#x0A;&#x09;at java.lang.Thread.run(Thread.java:745)&#x0A;</exception></record>";

			}
			Data.testCreation();
			
		    return Data;
		}
	])
	
})();