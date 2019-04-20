'use strict';

System.register(['app/plugins/sdk', 'moment', 'lodash', 'app/core/time_series', './css/radargraph-panel.css!', './Chart.js'], function (_export, _context) {
  "use strict";

  var MetricsPanelCtrl, moment, _, TimeSeries, _createClass, panelDefaults, RadarGraphCtrl;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  return {
    setters: [function (_appPluginsSdk) {
      MetricsPanelCtrl = _appPluginsSdk.MetricsPanelCtrl;
    }, function (_moment) {
      moment = _moment.default;
    }, function (_lodash) {
      _ = _lodash.default;
    }, function (_appCoreTime_series) {
      TimeSeries = _appCoreTime_series.default;
    }, function (_cssRadargraphPanelCss) {}, function (_ChartJs) {}],
    execute: function () {
      _createClass = function () {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }

        return function (Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);
          if (staticProps) defineProperties(Constructor, staticProps);
          return Constructor;
        };
      }();

      panelDefaults = {
        bgColor: null,

        radarSettings: {
          fontColor: 'gray',
          gridColor: 'gray',
          fontSize: 14,
          legendType: 'right',
          ignoreTimeInfluxDB: false,
          limitAspectRatio: true,
          aspectRatio: 2.2,
          seriesAlias: '',
          autoScale: true,
          drawTicksBackground: true,
          scaleMin: 0,
          scaleMax: 0,
          scaleStep: 0,
          animationDurationMs: 0
        }
      };

      _export('RadarGraphCtrl', RadarGraphCtrl = function (_MetricsPanelCtrl) {
        _inherits(RadarGraphCtrl, _MetricsPanelCtrl);

        function RadarGraphCtrl($scope, $injector, $rootScope) {
          _classCallCheck(this, RadarGraphCtrl);

          var _this = _possibleConstructorReturn(this, (RadarGraphCtrl.__proto__ || Object.getPrototypeOf(RadarGraphCtrl)).call(this, $scope, $injector));

          _.defaultsDeep(_this.panel, panelDefaults);

          _this.$rootScope = $rootScope;

          _this.events.on('init-edit-mode', _this.onInitEditMode.bind(_this));
          _this.events.on('panel-teardown', _this.onPanelTeardown.bind(_this));
          _this.events.on('panel-initialized', _this.render.bind(_this));

          _this.events.on('render', _this.onRender.bind(_this));
          _this.events.on('data-received', _this.onDataReceived.bind(_this));
          _this.events.on('data-error', _this.onDataError.bind(_this));
          _this.events.on('data-snapshot-load', _this.onDataReceived.bind(_this));

          _this.percentPerLight = 100;

          _this.data = [];
          _this.canvasid = ("id" + Math.random() * 100000).replace('.', '');

          _this.ctx = null;
          _this.radar = null;

          _this.currentOptions = null;

          _this.updateRadar();
          return _this;
        }

        _createClass(RadarGraphCtrl, [{
          key: 'onDataError',
          value: function onDataError() {
            this.series = [];
            this.render();
          }
        }, {
          key: 'onRender',
          value: function onRender() {
            this.options = {
              legend: {
                display: true,
                position: this.panel.radarSettings.legendType,
                labels: {
                  fontColor: this.panel.radarSettings.fontColor
                }
              },
              scale: {
                angleLines: {
                  lineWidth: 2,
                  color: this.panel.radarSettings.gridColor
                },
                gridLines: {
                  lineWidth: 1,
                  color: this.panel.radarSettings.gridColor
                },
                pointLabels: {
                  fontSize: parseInt(this.panel.radarSettings.fontSize),
                  fontColor: this.panel.radarSettings.fontColor
                },
                animation: {
                  duration: Number(this.panel.radarSettings.animationDurationMs)
                },
                ticks: {
                  showLabelBackdrop: this.panel.radarSettings.drawTicksBackground
                }

              }
            };

            if (!this.panel.radarSettings.autoScale) {
              this.options.scale.ticks = {
                showLabelBackdrop: this.panel.radarSettings.drawTicksBackground,
                min: Number(this.panel.radarSettings.scaleMin),
                max: Number(this.panel.radarSettings.scaleMax),
                stepSize: Number(this.panel.radarSettings.scaleStep)
              };
            }

            if (this.currentOptions == null) this.currentOptions = JSON.stringify(this.options);

            if (this.ctx == null) if (document.getElementById(this.canvasid) != null) this.ctx = document.getElementById(this.canvasid).getContext('2d');

            if (this.ctx != null) {
              if (this.radar == null) {
                this.radar = new Chart(this.ctx, {
                  type: 'radar',
                  data: this.data,
                  options: this.options

                });
              } else {
                if (this.currentOptions != JSON.stringify(this.options)) {
                  console.log("Recreate radar graph.");
                  this.currentOptions = JSON.stringify(this.options);
                  if (this.ctx != null) {
                    if (this.radar != null) {
                      this.radar.destroy();
                      $("canvas#" + this.canvasid).remove();
                      $("div#panel" + this.canvasid).append('<canvas id="' + this.canvasid + '"></canvas>');
                      this.ctx = document.getElementById(this.canvasid).getContext('2d');
                    }
                    this.radar = new Chart(this.ctx, {
                      type: 'radar',
                      data: this.data,
                      options: this.options

                    });
                  }
                }
                this.radar.data = this.data;
                this.radar.update();
              }
            }
          }
        }, {
          key: 'decodeNonHistoricalData',
          value: function decodeNonHistoricalData(fulldata) {
            var labels = {};
            var datasets = {};

            var ignoretimeinfluxdn = this.panel.radarSettings.ignoreTimeInfluxDB;

            if (ignoretimeinfluxdn) {
              //      console.log('IGNORING')
              for (var i = 0; i < fulldata[0].rows.length; i++) {
                if (!(fulldata[0].rows[i][1] in labels)) labels[fulldata[0].rows[i][1]] = true;

                var serie = 'NA';

                if (fulldata[0]["columns"].length > 2) serie = fulldata[0]["columns"][2].text;else serie = fulldata[0]["columns"][0].text;

                if (!(serie in datasets)) datasets[serie] = {};
                datasets[serie][fulldata[0].rows[i][1]] = fulldata[0].rows[i][2];
              }
              for (var j = 1; j < fulldata.length; j++) {
                for (var i = 0; i < fulldata[j].rows.length; i++) {
                  if (!(fulldata[j].rows[i][1] in labels)) labels[fulldata[j].rows[i][1]] = true;

                  var serie = 'NA';

                  if (fulldata[j]["columns"].length > 2) serie = fulldata[j]["columns"][2].text;else serie = fulldata[j]["columns"][0].text;

                  if (!(serie in datasets)) datasets[serie] = {};
                  datasets[serie][fulldata[j].rows[i][1]] = fulldata[j].rows[i][2];
                }
              }
              //      console.log("LABELS="+JSON.stringify(labels))
            } else {
              for (var i = 0; i < fulldata[0].rows.length; i++) {

                if (fulldata[0].rows[i].length > 2) // more than 1 aggregation
                  {

                    if (!(fulldata[0].rows[i][0] in labels)) labels[fulldata[0].rows[i][0]] = true;
                    if (!(fulldata[0].rows[i][1] in datasets)) datasets[fulldata[0].rows[i][1]] = {};
                    datasets[fulldata[0].rows[i][1]][fulldata[0].rows[i][0]] = fulldata[0].rows[i][2];
                  } else {
                  if (!(fulldata[0].rows[i][0] in labels)) labels[fulldata[0].rows[i][0]] = true;

                  var serie = fulldata[0]["columns"][0].text;

                  if (!(serie in datasets)) datasets[serie] = {};
                  datasets[serie][fulldata[0].rows[i][0]] = fulldata[0].rows[i][1];
                }
              }
            }

            var finaldatasets = [];
            var finallabels = [];

            for (var key in labels) {
              finallabels.push(key);
            }var i = 0;

            for (var key in datasets) {

              var newdata = [];
              for (var key2 in labels) {
                if (key2 in datasets[key]) newdata.push(datasets[key][key2]);else newdata.push(0);
              }finaldatasets.push({
                label: key,
                data: newdata,
                backgroundColor: this.addTransparency(this.$rootScope.colors[i], 0.2), //'rgba(54, 162, 235, 0.2)',
                borderColor: this.$rootScope.colors[i] //'rgb(54, 162, 235)'
              });
              i++;
            }

            var finaldata = {
              labels: finallabels,
              datasets: finaldatasets
              //alert(JSON.stringify(finaldata))
            };this.data = finaldata;
          }
        }, {
          key: 'decodeHistoricalDataSQL',
          value: function decodeHistoricalDataSQL(fulldata) {
            var finallabels = [];
            var finallabelsht = {};
            var datasets = [];
            var datasetstemp = {};

            for (var i = 0; i < fulldata.length; i++) {
              if (!finallabelsht.hasOwnProperty(fulldata[i].target)) {
                finallabelsht[fulldata[i].target] = fulldata[i].target;
                finallabels.push(fulldata[i].target);
              }
              if (!datasetstemp.hasOwnProperty(fulldata[i].refId)) {
                datasetstemp[fulldata[i].refId] = {};
              }
              if (fulldata[i].datapoints.length >= 1) {
                var lastpoint = fulldata[i].datapoints[fulldata[i].datapoints.length - 1];
                datasetstemp[fulldata[i].refId][fulldata[i].target] = lastpoint[0];
              }
            }

            // loads alias
            var seriesAliasTable = [];
            if (this.panel.radarSettings.seriesAlias != null) seriesAliasTable = this.panel.radarSettings.seriesAlias.split(";");

            var seriesAliasHT = {};

            for (var j in seriesAliasTable) {
              var alias = seriesAliasTable[j].split('=');
              if (alias.length > 1) {
                seriesAliasHT[alias[0]] = alias[1];
              }
            }

            var count = 0;
            for (var ds in datasetstemp) {

              var ds2 = ds;
              if (seriesAliasHT[ds] != null) ds2 = seriesAliasHT[ds];

              var points = [];
              for (var ind in finallabels) {
                i = finallabels[ind];
                if (datasetstemp[ds].hasOwnProperty(i)) points.push(datasetstemp[ds][i]);else points.push(0);
              }
              var dataset = {};
              dataset.label = ds2;
              dataset.data = points;
              dataset.backgroundColor = this.addTransparency(this.$rootScope.colors[count], 0.2); //'rgba(54, 162, 235, 0.2)',
              dataset.borderColor = this.$rootScope.colors[count];

              datasets.push(dataset);
              count++;
            }

            var finaldata = {
              labels: finallabels,
              datasets: datasets
            };
            this.data = finaldata;
          }
        }, {
          key: 'decodeHistoricalData',
          value: function decodeHistoricalData(fulldata) {

            if (fulldata.length > 0 && fulldata[0].target != null) {
              console.log("PSQL detected");
              return this.decodeHistoricalDataSQL(fulldata);
            }
            console.log("PSQL not detected");
            var labels = {};
            var datasets = {};

            for (var i = 0; i < fulldata.length; i++) {
              var j = 0;
              var curkey = '';
              for (var key in fulldata[i].props) {
                if (j == 0) {
                  labels[fulldata[i].props[key]] = true;
                  curkey = fulldata[i].props[key];
                } else if (j == 1) {
                  if (!(fulldata[i].props[key] in datasets)) datasets[fulldata[i].props[key]] = {};
                  datasets[fulldata[i].props[key]][curkey] = fulldata[i].datapoints.slice(-1)[0][0];
                }
                j = j + 1;
              }
            }
            var finallabels = [];
            var finaldatasets = [];

            for (var key in labels) {
              finallabels.push(key);
            }var i = 0;

            for (key in datasets) {
              var newdata = [];
              for (var key2 in labels) {
                if (key2 in datasets[key]) newdata.push(datasets[key][key2]);else newdata.push(0);
              }finaldatasets.push({
                label: key,
                data: newdata,
                backgroundColor: this.addTransparency(this.$rootScope.colors[i], 0.2), //'rgba(54, 162, 235, 0.2)',
                borderColor: this.$rootScope.colors[i] //'rgb(54, 162, 235)'
              });
              i++;
            }

            var finaldata = {
              labels: finallabels,
              datasets: finaldatasets
            };
            this.data = finaldata;
          }
        }, {
          key: 'onDataReceived',
          value: function onDataReceived(dataList) {
            var newseries = [];

            this.data = {
              labels: ['Running', 'Swimming', 'Eating', 'Cycling', 'Sleeping'],
              datasets: [{
                data: [Math.random() * 100, 10, 4, 2, 30],
                label: 'serie 1',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgb(54, 162, 235)'
              }, {
                data: [10, 30, 14, 22, 3],
                label: 'serie 2',
                backgroundColor: 'rgba(235, 162, 54, 0.2)',
                borderColor: 'rgb(235, 162, 54)'
              }]
            };

            var fulldata = dataList;

            if (fulldata.length >= 1 && "columnMap" in fulldata[0]) {
              this.decodeNonHistoricalData(fulldata);
            } else {
              this.decodeHistoricalData(fulldata);
            }
            this.render();
          }
        }, {
          key: 'seriesHandler',
          value: function seriesHandler(seriesData) {
            var series = new TimeSeries({
              datapoints: seriesData.datapoints,
              alias: seriesData.target
            });
            return series;
          }
        }, {
          key: 'onInitEditMode',
          value: function onInitEditMode() {
            this.addEditorTab('Options', 'public/plugins/snuids-radar-panel/editor.html', 2);
          }
        }, {
          key: 'onPanelTeardown',
          value: function onPanelTeardown() {
            this.$timeout.cancel(this.nextTickPromise);
          }
        }, {
          key: 'updateRadar',
          value: function updateRadar() {
            this.nextTickPromise = this.$timeout(this.updateRadar.bind(this), 1000);
          }
        }, {
          key: 'addTransparency',
          value: function addTransparency(col, transp) {
            if (col[0] == "#") {
              col = col.slice(1);
            }

            var num = parseInt(col, 16);

            var r = num >> 16;
            var g = num >> 8 & 0x00FF;
            var b = num & 0x0000FF;

            return 'rgba(' + r + ',' + g + ',' + b + ',' + transp + ')';
          }
        }, {
          key: 'link',
          value: function link(scope, elem) {
            var _this2 = this;

            this.events.on('render', function () {
              var $panelContainer = elem.find('.panel-container');

              if (_this2.panel.bgColor) {
                $panelContainer.css('background-color', _this2.panel.bgColor);
              } else {
                $panelContainer.css('background-color', '');
              }
            });
          }
        }]);

        return RadarGraphCtrl;
      }(MetricsPanelCtrl));

      _export('RadarGraphCtrl', RadarGraphCtrl);

      RadarGraphCtrl.templateUrl = 'module.html';
    }
  };
});
//# sourceMappingURL=radargraph_ctrl.js.map
