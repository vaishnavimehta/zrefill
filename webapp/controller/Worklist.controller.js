/*global location history */
sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (BaseController, JSONModel, History, formatter, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("ts.zrefill.controller.Worklist", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function () {
			var oViewModel,
				iOriginalBusyDelay,
				oTable = this.byId("table");

			// Put down worklist table's original value for busy indicator delay,
			// so it can be restored later on. Busy handling on the table is
			// taken care of by the table itself.
			//iOriginalBusyDelay = oTable.getBusyIndicatorDelay();
			// keeps the search state
			this._aTableSearchState = [];

			// Model used to manipulate control states
			oViewModel = new JSONModel({
				worklistTableTitle: this.getResourceBundle().getText("worklistTableTitle"),
				saveAsTileTitle: this.getResourceBundle().getText("saveAsTileTitle", this.getResourceBundle().getText("worklistViewTitle")),
				shareOnJamTitle: this.getResourceBundle().getText("worklistTitle"),
				shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
				shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href]),
				tableNoDataText: this.getResourceBundle().getText("tableNoDataText")
					//	tableBusyDelay: 0
			});
			this.setModel(oViewModel, "worklistView");
			var oModel = this.getOwnerComponent().getModel();
			var oJSONModel = this.getOwnerComponent().getModel("json");
			sap.ui.core.BusyIndicator.show();

			var oModel = new sap.ui.model.odata.ODataModel(
				'/com.sap.iotservices.mms/v1/api/http/app.svc', true);
			var oChart;
			var oEod;
			oModel.read("/SYSTEM.T_IOT_E5EA0ACDEC831C5F0D3A", null, ["$orderby=C_TIMESTAMP desc&$top=10"],
				false,
				function (oData, oResponse) {
					oChart = oData.results;
				});
			var tsEod = this.ts();
			oModel.read("/SYSTEM.T_IOT_E5EA0ACDEC831C5F0D3A", null, ["$filter=C_TIMESTAMP eq datetime'" + tsEod + "'"],
				false,
				function (data, res) {
					oEod = data.results;

				});

			var oModelw = this.getOwnerComponent().getModel("oAbap");
			oModelw.read("/MainSet", {
				success: function (r, s) {
					var oArray = r.results;
					oJSONModel.setProperty("/listModel", r.results);
					var p1 = [];
					var p2 = [];
					var p3 = [];
					var f = [];
					// oChart.reverse();
					for (var i = 0; i < oChart.length; i++) {
						if (oChart[i].C_NAME === "PP1") {
							p1.push(oChart[i]);
						} else {
							if (oChart[i].C_NAME === "PP2") {
								p2.push(oChart[i]);
							} else {
								p3.push(oChart[i]);
							}
						}
					}
					// p1.reverse();
					// p2.reverse();
					// p3.reverse();
					var x = {};
					for (var j = 0; j < oArray.length; j++) {
						if (oArray[j].Name === "PP1") {
							x.Name = oArray[j].Name;
							x.Capacity = oArray[j].Capacity;
							x.Value = (oArray[j].Capacity - p1[0].C_LEVEL) * 140;
							x.Meins = oArray[j].Meins;
							x.Curr = p1[0].C_LEVEL;
							x.Perc = Number((((oArray[j].Capacity - p1[0].C_LEVEL) / oArray[j].Capacity) * 100).toFixed(1));
							for (var y = 0; y < oEod.length; y++) {
								if (oEod[y].C_NAME === "PP1") {
									x.Eod = oEod[y].C_LEVEL;
									break;
								}
							}
							// x.Perc = 31.8;
							if (x.Perc >= 50) {
								x.Col = "#76ee00";
							} else {
								if (x.Perc >= 40) {
									x.Col = "#ff8c00";
								} else {
									x.Col = "#ee2c2c";
								}
							}
						} else {
							if (oArray[j].Name === "PP2") {
								x.Name = oArray[j].Name;
								x.Capacity = oArray[j].Capacity;
								x.Value = (oArray[j].Capacity - p2[0].C_LEVEL) * 140;
								x.Meins = oArray[j].Meins;
								x.Curr = p2[0].C_LEVEL;
								x.Perc = Number((((oArray[j].Capacity - p2[0].C_LEVEL) / oArray[j].Capacity) * 100).toFixed(1));
								y = 0;
								for (y = 0; y < oEod.length; y++) {
									if (oEod[y].C_NAME === "PP2") {
										x.Eod = oEod[y].C_LEVEL;
										break;
									}
								}
								// x.Perc = perc.toString();
								// x.Perc = 21.5;
								if (x.Perc >= 50) {
									x.Col = "#76ee00";
								} else {
									if (x.Perc >= 40) {
										x.Col = "#ff8c00";
									} else {
										x.Col = "#ee2c2c";
									}
								}
							} else {
								x.Name = oArray[j].Name;
								x.Capacity = oArray[j].Capacity;
								x.Value = (oArray[j].Capacity - p3[0].C_LEVEL) * 140;
								x.Meins = oArray[j].Meins;
								x.Curr = p3[0].C_LEVEL;
								x.Perc = Number((((oArray[j].Capacity - p2[0].C_LEVEL) / oArray[j].Capacity) * 100).toFixed(1));
								y = 0;
								for (y = 0; y < oEod.length; y++) {
									if (oEod[y].C_NAME === "PP3") {
										x.Eod = oEod[y].C_LEVEL;
										break;
									}
								}
								// x.Perc = 15.5;
								if (x.Perc >= 50) {
									x.Col = "#76ee00";
								} else {
									if (x.Perc >= 40) {
										x.Col = "#ff8c00";
									} else {
										x.Col = "#ee2c2c";
									}
								}
							}
						}
						f.push(x);
						x = {};
					}
					oJSONModel.setProperty("/lineModel", f);
					sap.ui.core.BusyIndicator.hide();
				},
				error: function () {
					sap.ui.core.BusyIndicator.hide();
				}
			});

			// Make sure, busy indication is showing immediately so there is no
			// break after the busy indication for loading the view's meta data is
			// ended (see promise 'oWhenMetadataIsLoaded' in AppController)
			oTable.attachEventOnce("updateFinished", function () {
				// Restore original busy indicator delay for worklist's table
				// oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);

			});
			// Add the worklist page to the flp routing history
			this.addHistoryEntry({
				title: this.getResourceBundle().getText("worklistViewTitle"),
				icon: "sap-icon://table-view",
				intent: "#SenseandStock-display"
			}, true);
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Triggered by the table's 'updateFinished' event: after new table
		 * data is available, this handler method updates the table counter.
		 * This should only happen if the update was successful, which is
		 * why this handler is attached to 'updateFinished' and not to the
		 * table's list binding's 'dataReceived' method.
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 * @public
		 */
		onUpdateFinished: function (oEvent) {
			// update the worklist's object counter after the table update
			var sTitle,
				oTable = oEvent.getSource(),
				iTotalItems = oEvent.getParameter("total");
			// only update the counter if the length is final and
			// the table is not empty
			if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
				sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
			} else {
				sTitle = this.getResourceBundle().getText("worklistTableTitle");
			}
			this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);

		},

		/**
		 * Event handler when a table item gets pressed
		 * @param {sap.ui.base.Event} oEvent the table selectionChange event
		 * @public
		 */
		onPress: function (oEvent) {
			// The source is the list item that got pressed
			this._showObject(oEvent.getSource());
		},

		/**
		 * Event handler when the share in JAM button has been clicked
		 * @public
		 */
		onShareInJamPress: function () {
			var oViewModel = this.getModel("worklistView"),
				oShareDialog = sap.ui.getCore().createComponent({
					name: "sap.collaboration.components.fiori.sharing.dialog",
					settings: {
						object: {
							id: location.href,
							share: oViewModel.getProperty("/shareOnJamTitle")
						}
					}
				});
			oShareDialog.open();
		},

		onSearch: function (oEvent) {
			if (oEvent.getParameters().refreshButtonPressed) {
				// Search field's 'refresh' button has been pressed.
				// This is visible if you select any master list item.
				// In this case no new search is triggered, we only
				// refresh the list binding.
				this.onRefresh();
			} else {
				var aTableSearchState = [];
				var sQuery = oEvent.getParameter("query");

				if (sQuery && sQuery.length > 0) {
					aTableSearchState = [new Filter("C_NAME", FilterOperator.Contains, sQuery)];
				}
				this._applySearch(aTableSearchState);
			}

		},

		/**
		 * Event handler for refresh event. Keeps filter, sort
		 * and group settings and refreshes the list binding.
		 * @public
		 */
		onRefresh: function () {
			var oTable = this.byId("table");
			oTable.getBinding("items").refresh();
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Shows the selected item on the object page
		 * On phones a additional history entry is created
		 * @param {sap.m.ObjectListItem} oItem selected Item
		 * @private
		 */
		_showObject: function (oItem) {
			this.getRouter().navTo("anlytics", {
				objId: oItem.getCells()[0].getProperty("text")
			});
		},

		/**
		 * Internal helper method to apply both filter and search state together on the list binding
		 * @param {sap.ui.model.Filter[]} aTableSearchState An array of filters for the search
		 * @private
		 */
		_applySearch: function (aTableSearchState) {
			var oTable = this.byId("table"),
				oViewModel = this.getModel("worklistView");
			oTable.getBinding("items").filter(aTableSearchState, "Application");
			// changes the noDataText of the list in case there are no filter results
			if (aTableSearchState.length !== 0) {
				oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
			}
		},
		/**
		 * custom methods-line chart
		 */

		ts: function () {

			var dt = new Date(),
				current_date = dt.getDate(),
				current_month = dt.getMonth() + 1,
				current_year = dt.getFullYear(),
				// current_hrs = dt.getHours(),
				// current_mins = dt.getMinutes(),
				// current_secs = dt.getSeconds(),
				current_datetime;

			// Add 0 before date, month, hrs, mins or secs if they are less than 0
			current_date = current_date < 10 ? '0' + current_date : current_date;
			current_month = current_month < 10 ? '0' + current_month : current_month;
			// current_hrs = current_hrs < 10 ? '0' + current_hrs : current_hrs;
			// current_mins = current_mins < 10 ? '0' + current_mins : current_mins;
			// current_secs = current_secs < 10 ? '0' + current_secs : current_secs;

			// Current datetime
			// String such as 2016-07-16T19:20:30
			current_datetime = current_year + '-' + current_month + '-' + current_date + 'T00:00:01';
			return current_datetime;
		}

	});
});