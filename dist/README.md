# Description

This grafana panel displays radar graphs using the Chart.JS library. (http://www.chartjs.org/)

The plugin was tested with:

  * Elastic Search 5.5 as data source.
  * InfluxDB 1.3.6
  * PostGreSQL
  * MariaDB

## Installation

Copy the dist folder in your grafana plugin directory and rename it to radarpanel.


## Compile

Run

* npm i
* grunt

# Screenshots

## Showcase

![Radar](https://raw.githubusercontent.com/snuids/grafana-radar-panel/master/src/img/screenshot-radar-showcase.jpg)
![Radar](https://raw.githubusercontent.com/snuids/grafana-radar-panel/master/src/img/screenshot-radar-showcase2.jpg)
![Radar](https://raw.githubusercontent.com/snuids/grafana-radar-panel/master/src/img/screenshot-radar-showcase3.jpg)

## Metrics Configuration

### Elastic Search Configuration
The panel datasource must include a single query having the following characteristics:
* A single group (No date histogram)
* Two groups (No date histogram)
* Three groups. In this case the last group is a date histogram (As shown in the following screenshot) The value used is the last time serie point of the aggregation.


![Radar](https://raw.githubusercontent.com/snuids/grafana-radar-panel/master/src/img/screenshot-radar-metrics.jpg)
![Radar](https://raw.githubusercontent.com/snuids/grafana-radar-panel/master/src/img/screenshot-radar-metrics2.jpg)

### Influx DB Configuration

Note that the checkbox Ingnore TIME (InfluxDB) checkbox must be checked in the Options panel.

![Radar](https://raw.githubusercontent.com/snuids/grafana-radar-panel/master/src/img/screenshot-radar-metrics3.jpg)

### PostGreSQL configuration

Note the graph displays the last value of each time serie.

![Radar](https://raw.githubusercontent.com/snuids/grafana-radar-panel/master/src/img/screenshot-radar-metrics4.jpg)

## Panel Options

![Radar](https://raw.githubusercontent.com/snuids/grafana-radar-panel/master/src/img/screenshot-radar-options.jpg)

# Versions
## v1.1.0 (19/Oct/2017)
- First Version Compatible with InfluxDB

## v1.2.0 (27/Oct/2017)
- Panel renamed to snuids-radar-panel. (Edit your panels plugin id when upgrading from 1.1.0)

## v1.3.0 (01/Nov/2017)
- Aspect ratio option added in order to limit the height of the graph

## v1.4.0 (10/Dec/2017)
- PostGreSQL support added

## v1.4.1 (12/Dec/2017)
- Fixed a bug that prevents the graph to be corrrectly displayed when the serie has only one point. (Thx shizacat) 

## v1.4.2 (30/Sep/2018)
- Alias option added in order to rename the serie for SQL datasources 

## v1.4.3 (06/Mar/2019)
- Merged fremag modifications: New chart options: min, max, step, animation 

## v1.4.4 (20/Apr/2019)
- Autoscale option added
- Tick background can be hidden 
