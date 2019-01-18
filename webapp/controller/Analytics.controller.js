sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/viz/ui5/format/ChartFormatter"
], function (Controller, ChartFormatter) {
	"use strict";

	var intervalHandle;
	var objId;

	return Controller.extend("ts.zrefill.controller.Analytics", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf ts.zrefill.view.Analytics
		 */
		onInit: function () {

			this.getOwnerComponent().getRouter().getRoute("anlytics").attachPatternMatched(this._onMatched, this);

		},

		_onMatched: function (e) {

			objId = e.getParameter("arguments").objId;
			this.lineFunc(objId);
			this.activityChart("a");

		},

		lineFunc: function (oKey) {
			this.getView().byId('btnTrack').setVisible(false);
			var oModel = new sap.ui.model.odata.ODataModel(
				'/com.sap.iotservices.mms/v1/api/http/app.svc', true);
			var oArray;
			oModel.read("/SYSTEM.T_IOT_E5EA0ACDEC831C5F0D3A", null, ["$filter=C_NAME eq '" + oKey + "'" + "&$orderby=C_TIMESTAMP desc&$top=6"],
				false,
				function (oData, oResponse) {
					oArray = oData.results;
				});
			oArray.reverse();
			var lCdata = [];
			var obj = {};
			for (var j = 0; j < oArray.length; j++) {
				obj.level = oArray[j].C_LEVEL;
				obj.time = ((oArray[j].C_TIMESTAMP).getUTCHours()) + ":" + ((oArray[j].C_TIMESTAMP).getUTCMinutes()) + ":" +
					((oArray[j].C_TIMESTAMP).getUTCSeconds());
				lCdata.push(obj);
				obj = {};
			}

			var oJSONModel = this.getOwnerComponent().getModel("json");
			oJSONModel.setProperty("/ltModel", lCdata);

			var oModel1 = new sap.ui.model.json.JSONModel();
			oModel1.setData({
				data: lCdata
			});

			// var ointeractive = this.getView().byId("interactiveLineChart");
			var ointeractive1 = this.getView().byId("interactiveLineChart1");
			var flag = 0;

			for (var i = 0; i < oArray.length; i++) {
				flag = 0;
				var oPoint = new sap.suite.ui.microchart.InteractiveLineChartPoint();
				var FC_LEVEL = parseFloat(lCdata[i].level);
				if (FC_LEVEL < 190.0) { //Threshold is 190.0
					oPoint.setColor("Critical");
					flag = 1;
				}
				oPoint.setValue(FC_LEVEL);
				oPoint.setLabel(lCdata[i].time);
				// ointeractive.insertPoint(oPoint, i);
				ointeractive1.insertPoint(oPoint, i);
			}
			this.getView().byId("btnStart").setVisible();
			this.getView().byId("btnStop").setVisible();
			this.getView().byId("btnStart").setEnabled();
			if (flag) {
				this.getView().byId('btnTrack').setVisible();
			}
		},

		onStart: function () {
			var that = this;
			intervalHandle = setInterval(function () {
				that.lineFunc(objId);
			}, 10000); //10 seconds
			this.getView().byId("btnStart").setEnabled(false);
			this.getView().byId("btnStop").setEnabled();
		},

		onStop: function () {
			if (intervalHandle) {
				clearInterval(intervalHandle);
			}
			this.getView().byId("btnStop").setEnabled(false);
			this.getView().byId("btnStart").setEnabled();
			intervalHandle = " ";
		},
		gmapTrack: function () {
			// alert()
			var id;
			// var c_veh = "VEH1";
			// if (c_veh == "VEH1")
			// 	id = "d196f6b4-a5c8-4873-b1b9-ad89b2e6c211";
			// else
			// 	id = "3fbe0032-e802-406a-9b9d-552d2f94d3b3";

			

			var oModel1 = new sap.ui.model.odata.ODataModel(
				'/sap/opu/odata/sap/ZSO_IOT_SRV', true);
			var oArray1;
			oModel1.read("/SORDERSet(SENSOR='" + objId + "')", null, [],
				false,
				function (oData, oResponse) {
					oArray1 = oData;
				});
				
				
				// window.alert(objId+" "+oArray1.SO);

			var oModel2 = new sap.ui.model.odata.ODataModel(
				'/sap/opu/odata/sap/ZSO_VEH_SRV', true);
			var oArray2;
			oModel2.read("/VehicleSet(SO='" + oArray1.SO + "')", null, [],
				false,
				function (oData, oResponse) {
					oArray2 = oData;
				});
				
				if (oArray2.VEH == "VEH1")
				id = "d196f6b4-a5c8-4873-b1b9-ad89b2e6c211";
			else
				id = "3fbe0032-e802-406a-9b9d-552d2f94d3b3";
				
				
			// window.alert(oArray1.SENSOR+" "+oArray1.SO+" "+oArray1.SHIPTO+" "+oArray1.SDATE+" "+oArray2.VEH);

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("RouteView1", {
				ids: id,
				SSen: oArray1.SENSOR,
				SO: oArray1.SO,
				STo: oArray1.SHIPTO,
				SDate: oArray1.SDATE
			});
		},
		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf ts.zrefill.view.Analytics
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf ts.zrefill.view.Analytics
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf ts.zrefill.view.Analytics
		 */
		onExit: function () {
			if (intervalHandle) {
				clearInterval(intervalHandle);
			}
			this.getView().byId("btnStop").setEnabled(false);
			this.getView().byId("btnStart").setEnabled();
			objId = " ";
			intervalHandle = " ";
		},

		handleSelectionChange: function (e) {
			var that = this;
			var oItem = e.getSource().getProperty("selectedKey");
			that.activityChart(oItem);
		},

		activityChart: function (o) {
			var that = this;
			if (o === "a") {
				// var top = 100;
				var cDate = new Date();
				cDate.setDate(cDate.getDate() - 6);
				var month = cDate.getUTCMonth() + 1;
				month = month < 10 ? "0" + month : month;
				var date = cDate.getUTCDate();
				date = date < 10 ? "0" + date : date;
				var wDateSap = cDate.getUTCFullYear() + "-" + month + "-" + date + "T00:00:00";
				var wDate = new Date();
				month = wDate.getUTCMonth() + 1;
				month = month < 10 ? "0" + month : month;
				date = wDate.getUTCDate();
				date = date < 10 ? "0" + date : date;
				var cDateSap = wDate.getUTCFullYear() + "-" + month + "-" + date + "T00:00:00";
				var filter = "$filter=C_NAME eq '" + objId + "'" + " and ( C_TIMESTAMP ge (datetime'" + wDateSap + "'" +
					") and C_TIMESTAMP le (datetime'" + cDateSap + "'))";
			} else {
				cDate = new Date();
				cDate.setDate(cDate.getDate() - 12);
				month = cDate.getUTCMonth() + 1;
				month = month < 10 ? "0" + month : month;
				date = cDate.getUTCDate();
				date = date < 10 ? "0" + date : date;
				wDateSap = cDate.getUTCFullYear() + "-" + month + "-" + date + "T00:00:00";
				wDate = new Date();
				month = wDate.getUTCMonth() + 1;
				month = month < 10 ? "0" + month : month;
				date = wDate.getUTCDate();
				date = date < 10 ? "0" + date : date;
				cDateSap = wDate.getUTCFullYear() + "-" + month + "-" + date + "T00:00:00";
				filter = "$filter=C_NAME eq '" + objId + "'" + " and ( C_TIMESTAMP ge (datetime'" + wDateSap + "'" +
					") or C_TIMESTAMP le (datetime'" + cDateSap + "'))";

			}
			var oModel = new sap.ui.model.odata.ODataModel(
				'/com.sap.iotservices.mms/v1/api/http/app.svc', true);
			var oAct;
			oModel.read("/SYSTEM.T_IOT_E5EA0ACDEC831C5F0D3A", null, [filter],
				false,
				function (oData, oResponse) {
					oAct = oData.results;
				});
			oAct.sort(function (a, b) {
				var c = new Date(a.C_TIMESTAMP);
				var d = new Date(b.C_TIMESTAMP);
				if (c > d) {
					return 1;
				} else {
					if (c < d) {
						return -1;
					} else {
						return 0;
					}
				}
			});
			var resultArr = [];
			var dateArr = [];
			$.each(oAct, function () {
				// Easiest way to get your required date format
				var date = new Date(this.C_TIMESTAMP).toISOString().replace(/T/, ' ').split(' ')[0];
				var index = dateArr.indexOf(date);
				if (index === -1) {
					dateArr.push(date);
					var obj = {
						Date: date,
						Level: Number(this.C_LEVEL),
						Sales: Number(this.C_LEVEL) * 4
					};
					resultArr.push(obj);
				} else {
					resultArr[index].Level += Number(this.C_LEVEL);
					resultArr[index].Sales += (Number(this.C_LEVEL) * 40);
				}
			});
			var oModelIbar = new sap.ui.model.json.JSONModel();
			oModelIbar.setData({
				data: resultArr
			});
			var oJSONModel = that.getOwnerComponent().getModel("json");
			oJSONModel.setProperty("/actModel", resultArr);
			// var ointeractive = that.getView().byId("interactiveLineChart");
			// // ointeractive.setVizType("dual_timeseries_combination");
			// // A Dataset defines how the model data is mapped to the chart
			// var oDataset = new sap.viz.ui5.data.FlattenedDataset({
			// 	// a Bar Chart requires exactly one dimension (x-axis)
			// 	dimensions: [{
			// 		// axis: 1, // must be one for the x-axis, 2 for y-axis
			// 		name: 'Date',
			// 		value: "{Date}",
			// 		dataType: "date"
			// 	}],
			// 	// it can show multiple measures, each results in a new set of bars in a new color
			// 	measures: [
			// 		// measure 1
			// 		{
			// 			name: 'Level',
			// 			value: "{Level}"
			// 		} 
			// 		// {
			// 		// 	name: "Sales",
			// 		// 	value: "{Sales}"
			// 		// }
			// 	],
			// 	// 'data' is used to bind the whole data collection that is to be displayed in the chart
			// 	data: {
			// 		path: "/data"
			// 	}
			// });
			// 			ointeractive.setModel(oModelIbar);
			// 			ointeractive.setDataset(oDataset);
			// ointeractive.setVizProperties({
			// 	plotArea: {
			// 		window: {
			// 			start: "firstDataPoint",
			// 			end: "lastDataPoint"
			// 		},
			// 		dataLabel: {
			// 			formatString: ChartFormatter.DefaultPattern.SHORTFLOAT_MFD2,
			// 			visible: false
			// 		}
			// 	},
			// 	valueAxis: {
			// 		visible: true,
			// 		label: {
			// 			formatString: ChartFormatter.DefaultPattern.SHORTFLOAT
			// 		},
			// 		title: {
			// 			visible: false
			// 		}
			// 	},
			// 	valueAxis2: {
			// 		visible: true,
			// 		label: {
			// 			formatString: ChartFormatter.DefaultPattern.SHORTFLOAT
			// 		},
			// 		title: {
			// 			visible: false
			// 		}
			// 	},
			// 	timeAxis: {
			// 		title: {
			// 			visible: false
			// 		},
			// 		interval: {
			// 			unit: ''
			// 		}
			// 	},
			// 	title: {
			// 		visible: false
			// 	},
			// 	interaction: {
			// 		syncValueAxis: false
			// 	}
			// });
			// var feedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
			// 	'uid': "valueAxis",
			// 	'type': "Measure",
			// 	'values': ["Level"]
			// });
			// var feedValueAxis2 = new sap.viz.ui5.controls.common.feeds.FeedItem({
			// 	'uid': "valueAxis2",
			// 	'type': "Measure",
			// 	'values': ["Sales"]
			// });
			// var feedTimeAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
			// 	'uid': "timeAxis",
			// 	'type': "Dimension",
			// 	'values': ["Date"]
			// });
			// ointeractive.addFeed(feedValueAxis);
			// ointeractive.addFeed(feedValueAxis2);
			// ointeractive.addFeed(feedTimeAxis);
			// });
		}

	});
});