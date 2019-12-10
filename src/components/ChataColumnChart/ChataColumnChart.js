import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Axes } from '../Axes'
import { Columns } from '../Columns'
import { scaleLinear, scaleBand } from 'd3-scale'
import { max, min } from 'd3-array'

export default class ChataBarChart extends Component {
  xScale = scaleBand()
  yScale = scaleLinear()

  static propTypes = {
    data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    columns: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    leftMargin: PropTypes.number.isRequired,
    rightMargin: PropTypes.number.isRequired,
    topMargin: PropTypes.number.isRequired,
    bottomMargin: PropTypes.number.isRequired,
    chartColors: PropTypes.arrayOf(PropTypes.string).isRequired,
    dataValues: PropTypes.string,
    labelValue: PropTypes.string,
    tooltipFormatter: PropTypes.func,
    dataFormatting: PropTypes.shape({
      currencyCode: PropTypes.string,
      languageCode: PropTypes.string,
      currencyDecimals: PropTypes.number,
      quantityDecimals: PropTypes.number,
      comparisonDisplay: PropTypes.string,
      monthYearFormat: PropTypes.string,
      dayMonthYearFormat: PropTypes.string
    })
  }

  static defaultProps = {
    dataValues: 'values',
    labelValue: 'label',
    dataFormatting: {},
    tooltipFormatter: () => {}
  }

  render = () => {
    const {
      activeChartElementKey,
      bottomLegendMargin,
      tooltipFormatter,
      chartColors,
      bottomMargin,
      onChartClick,
      rightMargin,
      leftMargin,
      labelValue,
      dataValues,
      topMargin,
      columns,
      height,
      width,
      data
    } = this.props

    // Get max and min values from all series
    const numberOfSeries = data[0][dataValues].length
    const maxValuesFromArrays = []
    const minValuesFromArrays = []

    for (let i = 0; i < numberOfSeries; i++) {
      maxValuesFromArrays.push(max(data, d => d[dataValues][i]))
      minValuesFromArrays.push(min(data, d => d[dataValues][i]))
    }

    const maxValue = max(maxValuesFromArrays)
    let minValue = min(minValuesFromArrays)

    // Make sure 0 is always visible on the y axis
    if (minValue > 0) {
      minValue = 0
    }

    const xScale = this.xScale
      .domain(data.map(d => d[labelValue]))
      .range([leftMargin, width - rightMargin])
      .paddingInner(0.1)

    const yScale = this.yScale
      .domain([minValue, maxValue])
      .range([height - bottomMargin, topMargin])

    const barWidth = width / data.length
    const interval = Math.ceil((data.length * 16) / width)
    let xTickValues
    if (barWidth < 16) {
      xTickValues = []
      data.forEach((element, index) => {
        if (index % interval === 0) {
          xTickValues.push(element[labelValue])
        }
      })
    }

    const legendLabels = columns.slice(1).map(column => {
      return column.title
    })

    return (
      <g>
        <Axes
          scales={{ xScale, yScale }}
          xCol={columns[0]}
          yCol={columns[1]}
          margins={{
            left: leftMargin,
            right: rightMargin,
            bottom: bottomMargin,
            top: topMargin,
            bottomLegend: bottomLegendMargin
          }}
          width={width}
          height={height}
          xTicks={xTickValues}
          rotateLabels={barWidth < 135}
          dataFormatting={this.props.dataFormatting}
          hasBottomLegend={data[0].values.length > 1}
          bottomLegendWidth={this.props.bottomLegendWidth}
          legendLabels={legendLabels}
          chartColors={chartColors}
          yGridLines
        />
        <Columns
          scales={{ xScale, yScale }}
          margins={{
            left: leftMargin,
            right: rightMargin,
            bottom: bottomMargin,
            top: topMargin
          }}
          data={data}
          maxValue={maxValue}
          width={width}
          height={height}
          dataValues={dataValues}
          labelValue={labelValue}
          onChartClick={onChartClick}
          tooltipFormatter={tooltipFormatter}
          chartColors={chartColors}
          activeKey={activeChartElementKey}
        />
      </g>
    )
  }
}
