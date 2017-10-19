# Description

This grafana panel displays radar graphs using the Chart.JS library. (http://www.chartjs.org/)

The plugin was tested with:

  * Elastic Search 5.5 as data source.
  * InfluxDB 1.3.6

## Installation

Copy the dist folder in your grafana plugin directory and rename it to radarpanel.

# Screenshots

## Showcase

![Radar](https://raw.githubusercontent.com/snuids/grafana-radar-panel/master/src/img/screenshot-radar-showcase.jpg)
![Radar](https://raw.githubusercontent.com/snuids/grafana-radar-panel/master/src/img/screenshot-radar-showcase2.jpg)

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


## Panel Options

![Radar](https://raw.githubusercontent.com/snuids/grafana-radar-panel/master/src/img/screenshot-radar-options.jpg)

# Versions
## v1.1.0 (19/Oct/2017)
- First Version Compatible with InfluxDB

