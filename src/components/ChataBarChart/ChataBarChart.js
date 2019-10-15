import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Axes } from '../Axes'
import { Bars } from '../Bars'
import { scaleLinear, scaleBand } from 'd3-scale'
import { max, min } from 'd3-array'

export default class ChataBarChart extends Component {
  xScale = scaleLinear()
  yScale = scaleBand()

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
    currencyCode: PropTypes.string,
    languageCode: PropTypes.string
  }

  static defaultProps = {
    dataValues: 'values',
    labelValue: 'label',
    currencyCode: undefined,
    languageCode: undefined,
    tooltipFormatter: () => {}
  }

  render = () => {
    const {
      bottomLegendMargin,
      bottomLegendWidth,
      tooltipFormatter,
      chartColors,
      bottomMargin,
      onChartClick,
      rightMargin,
      dataValues,
      leftMargin,
      labelValue,
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
    // if (minValue > 0) {
    //   minValue = 0
    // }

    const xScale = this.xScale
      .domain([minValue, maxValue])
      .range([leftMargin, width - rightMargin])

    const yScale = this.yScale
      .domain(data.map(d => d[labelValue]))
      .range([height - bottomMargin, topMargin])
      .paddingInner(0.1)

    const tickWidth = (width - leftMargin - rightMargin) / 6

    const barHeight = height / data.length
    const interval = Math.ceil((data.length * 16) / height)
    let yTickValues
    if (barHeight < 16) {
      yTickValues = []
      data.forEach((element, index) => {
        if (index % interval === 0) {
          yTickValues.push(element[labelValue])
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
          xCol={columns[1]}
          yCol={columns[0]}
          margins={{
            left: leftMargin,
            right: rightMargin,
            bottom: bottomMargin,
            top: topMargin,
            bottomLegend: bottomLegendMargin
          }}
          width={width}
          height={height}
          yTicks={yTickValues}
          rotateLabels={tickWidth < 135}
          currencyCode={this.props.currencyCode}
          languageCode={this.props.languageCode}
          hasBottomLegend={data[0].values.length > 1}
          bottomLegendWidth={bottomLegendWidth}
          legendLabels={legendLabels}
          chartColors={chartColors}
          xGridLines
        />
        {
          <Bars
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
          />
        }
      </g>
    )
  }
}
