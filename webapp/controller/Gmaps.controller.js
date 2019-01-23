sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";
	var intervalHandle;

	return Controller.extend("ts.zrefill.controller.Gmaps", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf saom.com.samplemap.shwetang28.SAPUI5-HACK-master.view.map
		 */
		onInit: function () {

			var oRouters = sap.ui.core.UIComponent.getRouterFor(this);
			var obj = oRouters.getRoute("RouteView1").attachPatternMatched(this._onObjectMatched, this);
		},
		init: function (data, id) {
			var that = this;
			var map;
			var oModel = new sap.ui.model.odata.ODataModel(
				'/com.sap.iotservices.mms/v1/api/http/app.svc', true);
			var array1;
			oModel.read("/SYSTEM.T_IOT_F7FAF3DC98910CEF2B99", null, ["$orderby=C_TIMESTAMP desc&$top=1&$filter=G_DEVICE eq '" + id + "'"],
				false,
				function (oData, oResponse) {
					array1 = oData.results;
				});

			var directionsService = new data.google.maps.DirectionsService();
			var directionsDisplay = new data.google.maps.DirectionsRenderer();
			var origin = new data.google.maps.LatLng(array1.C_LOCLAT, array1.C_LOCLONG);
			var destination = new data.google.maps.LatLng(17.4218942, 78.3383297);

			map = new data.google.maps.Map(document.getElementById('map'), {

				center: origin,
				zoom: 19,
			});
			directionsDisplay.setMap(map);
			var newloc;
			reload(newloc);

			intervalHandle = setInterval(function () {

				var oModel = new sap.ui.model.odata.ODataModel(
					'/com.sap.iotservices.mms/v1/api/http/app.svc', true);
				var array1;
				oModel.read("/SYSTEM.T_IOT_F7FAF3DC98910CEF2B99", null, ["$orderby=C_TIMESTAMP desc&$top=1&$filter= G_DEVICE eq '" + id + "'"],
					false,
					function (oData, oResponse) {
						array1 = oData.results;
					});
				var newloc = array1.shift();
				var nasik = new data.google.maps.LatLng(newloc.C_LOCLAT, newloc.C_LOCLONG);
				if (nasik.lat() != origin.lat() || nasik.lng() != origin.lng()) {
					origin = nasik;
					reload(newloc);
				}
				// if (typeof array1 == 'undefined' || array1.length <= 0) {
				//                 Endinterval();
				// }
			}, 2000);

			function Endinterval() {
				clearInterval(intervalHandle);
			}

			function reload(newloc) {

				var request = {
					origin: origin,
					destination: destination,
					travelMode: 'WALKING'
				};

				directionsService.route(request, function (result, status) {
					if (status == 'OK') {
						directionsDisplay.setDirections(result);
						var myRoute = result.routes[0].legs[0];
						var eta = document.getElementById('eta');
						eta.innerHTML = '<u>ETA:</u><br>' + myRoute.duration.text;
						var distance = document.getElementById('distance');
						distance.innerHTML = '<u>Distance:</u><br>' + myRoute.distance.text;
						var origin = document.getElementById('origin');
						origin.innerHTML = '<u>Current Address:</u><br>' + myRoute.start_address;
						var destination = document.getElementById('destination');
						destination.innerHTML = '<u>Destination Address:</u><br>' + myRoute.end_address;
						// var TS= document.getElementById('TS');
						// TS.innerHTML += newloc.C_TIMESTAMP;
						var lat = document.getElementById('lat');
						lat.innerHTML = '<u>lat:</u><br>' + newloc.C_LOCLAT;
						var long = document.getElementById('long');
						long.innerHTML = '<u>long:</u><br>' + newloc.C_LOCLONG;

					} else {
						// window.alert("error");
					}
				});
			}

		},

		_onObjectMatched: function (oEvent) {
				var id = oEvent.getParameter("arguments").ids;
				var SSen = oEvent.getParameter("arguments").SSen;
				var SO = oEvent.getParameter("arguments").SO;
				var STo = oEvent.getParameter("arguments").STo;
				var SDate = oEvent.getParameter("arguments").SDate;
				
				// window.alert(id);
				var distance = document.getElementById('SSen');
				distance.innerHTML = '<u>Sensor:</u><br>' + SSen;
				var distance = document.getElementById('SO');
				distance.innerHTML = '<u>SO:</u><br>' + SO;
				var distance = document.getElementById('STo');
				distance.innerHTML = '<u>Ship To:</u><br>' + STo;
				var distance = document.getElementById('SDate');
				distance.innerHTML = '<u>Ship Date:</u><br>' + SDate;

				var that = this;
				$.ajax({
					type: "GET",
					//async: false,
					//crossDomain: true,
					url: 'https://maps.googleapis.com/maps/api/js?key=xxxyour_keyxxx',
					dataType: "jsonp",
					success: function (data, status, jqXHR) { //success function works when above connection is successfull.
					},
					error: function (e) { //success function works when above connection fails.
						self.error_msg("Error encountered. check connection and reload.");
					}
				}).done(function () {
					that.init(window, id);
				});
			}
			/**
			 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
			 * (NOT before the first rendering! onInit() is used for that one!).
			 * @memberOf saom.com.samplemap.shwetang28.SAPUI5-HACK-master.view.map
			 */
			//            onBeforeRendering: function() {
			//
			//            },

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf saom.com.samplemap.shwetang28.SAPUI5-HACK-master.view.map
		 */
		//            onAfterRendering: function() {
		//
		//            },

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf saom.com.samplemap.shwetang28.SAPUI5-HACK-master.view.map
		 */
		//            onExit: function() {
		//
		//            }

	});

});
