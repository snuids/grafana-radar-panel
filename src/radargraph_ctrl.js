import {
  MetricsPanelCtrl
} from 'app/plugins/sdk';
import moment from 'moment';
import _ from 'lodash';
import TimeSeries from 'app/core/time_series';

import './css/radargraph-panel.css!';
import './Chart.js'

const panelDefaults = {
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
    drawTicksBackground:true,
    scaleMin: 0,
    scaleMax: 0,
    scaleStep: 0,
    animationDurationMs: 0
  }
};

export class RadarGraphCtrl extends MetricsPanelCtrl {
  constructor($scope, $injector, $rootScope) {
    super($scope, $injector);
    _.defaultsDeep(this.panel, panelDefaults);

    this.$rootScope = $rootScope;

    this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
    this.events.on('panel-teardown', this.onPanelTeardown.bind(this));
    this.events.on('panel-initialized', this.render.bind(this));

    this.events.on('render', this.onRender.bind(this));
    this.events.on('data-received', this.onDataReceived.bind(this));
    this.events.on('data-error', this.onDataError.bind(this));
    this.events.on('data-snapshot-load', this.onDataReceived.bind(this));

    this.percentPerLight = 100;

    this.data = [];
    this.canvasid = ("id" + (Math.random() * 100000)).replace('.', '')

    this.ctx = null;
    this.radar = null;

    this.currentOptions = null;

    this.updateRadar();
  }

  onDataError() {
    this.series = [];
    this.render();
  }

  onRender() {
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
        ticks:{
          showLabelBackdrop: this.panel.radarSettings.drawTicksBackground
        }

      }
    };

    if(!this.panel.radarSettings.autoScale)
    {
      this.options.scale.ticks={
        showLabelBackdrop: this.panel.radarSettings.drawTicksBackground,
        min: Number(this.panel.radarSettings.scaleMin),
        max: Number(this.panel.radarSettings.scaleMax),
        stepSize: Number(this.panel.radarSettings.scaleStep)
      }
    }

    if (this.currentOptions == null)
      this.currentOptions = JSON.stringify(this.options);


    if (this.ctx == null)
      if (document.getElementById(this.canvasid) != null)
        this.ctx = document.getElementById(this.canvasid).getContext('2d');

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

  decodeNonHistoricalData(fulldata) {
    var labels = {};
    var datasets = {};

    var ignoretimeinfluxdn = this.panel.radarSettings.ignoreTimeInfluxDB;

    if (ignoretimeinfluxdn) {
      //      console.log('IGNORING')
      for (var i = 0; i < fulldata[0].rows.length; i++) {
        if (!(fulldata[0].rows[i][1] in labels))
          labels[fulldata[0].rows[i][1]] = true;

        var serie = 'NA';

        if (fulldata[0]["columns"].length > 2)
          serie = fulldata[0]["columns"][2].text;
        else
          serie = fulldata[0]["columns"][0].text;

        if (!(serie in datasets))
          datasets[serie] = {};
        datasets[serie][fulldata[0].rows[i][1]] = fulldata[0].rows[i][2]
      }
      for (var j = 1; j < fulldata.length; j++) {
        for (var i = 0; i < fulldata[j].rows.length; i++) {
          if (!(fulldata[j].rows[i][1] in labels))
            labels[fulldata[j].rows[i][1]] = true;

          var serie = 'NA';

          if (fulldata[j]["columns"].length > 2)
            serie = fulldata[j]["columns"][2].text;
          else
            serie = fulldata[j]["columns"][0].text;

          if (!(serie in datasets))
            datasets[serie] = {}
          datasets[serie][fulldata[j].rows[i][1]] = fulldata[j].rows[i][2]
        }
      }
      //      console.log("LABELS="+JSON.stringify(labels))
    } else {
      for (var i = 0; i < fulldata[0].rows.length; i++) {

        if (fulldata[0].rows[i].length > 2) // more than 1 aggregation
        {

          if (!(fulldata[0].rows[i][0] in labels))
            labels[fulldata[0].rows[i][0]] = true;
          if (!(fulldata[0].rows[i][1] in datasets))
            datasets[fulldata[0].rows[i][1]] = {};
          datasets[fulldata[0].rows[i][1]][fulldata[0].rows[i][0]] = fulldata[0].rows[i][2];
        } else {
          if (!(fulldata[0].rows[i][0] in labels))
            labels[fulldata[0].rows[i][0]] = true;

          var serie = fulldata[0]["columns"][0].text;


          if (!(serie in datasets))
            datasets[serie] = {}
          datasets[serie][fulldata[0].rows[i][0]] = fulldata[0].rows[i][1];
        }
      }
    }

    var finaldatasets = []
    var finallabels = []

    for (var key in labels)
      finallabels.push(key);

    var i = 0;

    for (var key in datasets) {

      var newdata = [];
      for (var key2 in labels)
        if (key2 in datasets[key])
          newdata.push(datasets[key][key2]);
        else
          newdata.push(0);

      finaldatasets.push({
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
    }
    //alert(JSON.stringify(finaldata))
    this.data = finaldata;
  }

  //***************************************************
  // DECODE POSTGRESQL data source data
  //***************************************************
  decodeHistoricalDataSQL(fulldata) {
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
        datasetstemp[fulldata[i].refId][fulldata[i].target] = lastpoint[0]
      }
    }

    // loads alias
    var seriesAliasTable = [];
    if (this.panel.radarSettings.seriesAlias != null)
      seriesAliasTable = this.panel.radarSettings.seriesAlias.split(";");

    var seriesAliasHT = {}

    for (var j in seriesAliasTable) {
      var alias = seriesAliasTable[j].split('=');
      if (alias.length > 1) {
        seriesAliasHT[alias[0]] = alias[1]
      }
    }

    var count = 0;
    for (var ds in datasetstemp) {

      var ds2 = ds;
      if (seriesAliasHT[ds] != null)
        ds2 = seriesAliasHT[ds];

      var points = [];
      for (var ind in finallabels) {
        i = finallabels[ind];
        if (datasetstemp[ds].hasOwnProperty(i))
          points.push(datasetstemp[ds][i]);
        else
          points.push(0);
      }
      var dataset = {}
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

  //***************************************************
  // DECODE hsitorical data
  //***************************************************
  decodeHistoricalData(fulldata) {

    if ((fulldata.length > 0) && (fulldata[0].target != null)) {
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
          if (!(fulldata[i].props[key] in datasets))
            datasets[fulldata[i].props[key]] = {};
          datasets[fulldata[i].props[key]][curkey] = (fulldata[i].datapoints.slice(-1))[0][0];
        }
        j = j + 1;
      }
    }
    var finallabels = [];
    var finaldatasets = [];

    for (var key in labels)
      finallabels.push(key);

    var i = 0;

    for (key in datasets) {
      var newdata = [];
      for (var key2 in labels)
        if (key2 in datasets[key])
          newdata.push(datasets[key][key2]);
        else
          newdata.push(0);

      finaldatasets.push({
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

  //***************************************************
  // Data received
  //***************************************************
  onDataReceived(dataList) {
    var newseries = [];

    this.data = {
      labels: ['Running', 'Swimming', 'Eating', 'Cycling', 'Sleeping'],
      datasets: [{
        data: [Math.random() * 100, 10, 4, 2, 30],
        label: 'serie 1',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgb(54, 162, 235)'
      },
      {
        data: [10, 30, 14, 22, 3],
        label: 'serie 2',
        backgroundColor: 'rgba(235, 162, 54, 0.2)',
        borderColor: 'rgb(235, 162, 54)'
      }
      ]
    };

    var fulldata = dataList;

    if (fulldata.length >= 1 && ("columnMap" in fulldata[0])) {
      this.decodeNonHistoricalData(fulldata);
    } else {
      this.decodeHistoricalData(fulldata);
    }
    this.render();
  }

  //***************************************************
  // seriesHandler
  //***************************************************
  seriesHandler(seriesData) {
    var series = new TimeSeries({
      datapoints: seriesData.datapoints,
      alias: seriesData.target
    });
    return series;
  }

  onInitEditMode() {
    this.addEditorTab('Options', 'public/plugins/snuids-radar-panel/editor.html', 2);
  }

  onPanelTeardown() {
    this.$timeout.cancel(this.nextTickPromise);
  }

  updateRadar() {
    this.nextTickPromise = this.$timeout(this.updateRadar.bind(this), 1000);
  }


  addTransparency(col, transp) {
    if (col[0] == "#") {
      col = col.slice(1);
    }

    var num = parseInt(col, 16);

    var r = (num >> 16);
    var g = ((num >> 8) & 0x00FF);
    var b = (num & 0x0000FF);

    return 'rgba(' + r + ',' + g + ',' + b + ',' + transp + ')';
  }

  link(scope, elem) {
    this.events.on('render', () => {
      const $panelContainer = elem.find('.panel-container');

      if (this.panel.bgColor) {
        $panelContainer.css('background-color', this.panel.bgColor);
      } else {
        $panelContainer.css('background-color', '');
      }
    });
  }
}

RadarGraphCtrl.templateUrl = 'module.html';