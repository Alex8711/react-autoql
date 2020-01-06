import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ReactTooltip from 'react-tooltip'
import uuid from 'uuid'
import _get from 'lodash.get'

import { select } from 'd3-selection'
import { max } from 'd3-array'
import { scaleOrdinal } from 'd3-scale'

import { ChataColumnChart } from '../ChataColumnChart'
import { ChataBarChart } from '../ChataBarChart'
import { ChataLineChart } from '../ChataLineChart'
import { ChataPieChart } from '../ChataPieChart'
import { ChataHeatmapChart } from '../ChataHeatmapChart'
import { ChataBubbleChart } from '../ChataBubbleChart'
import { ChataStackedBarChart } from '../ChataStackedBarChart'
import { ChataStackedColumnChart } from '../ChataStackedColumnChart'

import { svgToPng, formatElement } from '../../../js/Util.js'
import { getLegendLabelsForMultiSeries } from '../helpers.js'

import './ChataChart.scss'

export default class ChataChart extends Component {
  constructor(props) {
    super(props)
    const { chartColors } = props

    this.colorScale = scaleOrdinal().range(chartColors)
  }

  DEFAULT_MARGINS = {
    left: 50,
    right: 10,
    bottom: 100,
    top: 10
  }

  static propTypes = {
    data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    columns: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    type: PropTypes.string.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    chartColors: PropTypes.arrayOf(PropTypes.string).isRequired,
    onLegendClick: PropTypes.func,
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
    dataFormatting: {},
    onLegendClick: () => {}
  }

  state = {
    leftMargin: 50,
    rightMargin: 10,
    topMargin: 10,
    bottomMargin: 100,
    bottomLegendWidth: 0,
    bottomLegendMargin: 0
  }

  componentDidMount = () => {
    this.CHART_ID = uuid.v4()
    if (this.props.type !== 'pie') {
      setTimeout(this.updateMargins, 100)
      this.updateMargins()
    }
  }

  componentDidUpdate = prevProps => {
    if (
      this.props.type &&
      this.props.type !== prevProps.type &&
      this.props.type !== 'pie'
    ) {
      setTimeout(this.updateMargins, 100)
      this.updateMargins()
      ReactTooltip.rebuild()
    }
  }

  updateMargins = () => {
    try {
      const xAxisBBox = select(this.chartRef)
        .select('.axis-Bottom')
        .node()
        .getBBox()

      const yAxisLabels = select(this.chartRef)
        .select('.axis-Left')
        .selectAll('text')

      const maxYLabelWidth = max(yAxisLabels.nodes(), n =>
        n.getComputedTextLength()
      )

      // Space for legend
      const legendBBox = select(this.chartRef)
        .select('.legendOrdinal-container')
        .node()
        .getBBox()

      let bottomLegendMargin = this.state.bottomLegendMargin
      let bottomLegendWidth = this.state.bottomLegendWidth
      let rightMargin = this.DEFAULT_MARGINS.right
      if (
        // Legend goes on the side for these types
        (this.props.type === 'stacked_bar' ||
          this.props.type === 'stacked_column') &&
        _get(legendBBox, 'width')
      ) {
        rightMargin = legendBBox.width + this.DEFAULT_MARGINS.right
      } else if (
        (this.props.type === 'bar' ||
          this.props.type === 'column' ||
          this.props.type === 'line') &&
        _get(legendBBox, 'height')
      ) {
        // Legend goes on the bottom
        bottomLegendMargin = legendBBox.height + 20
        bottomLegendWidth = legendBBox.width
      }

      let bottomMargin = Math.ceil(xAxisBBox.height) + bottomLegendMargin + 30 // margin to include axis label

      if (this.props.type === 'bar' || this.props.type === 'stacked_bar') {
        // only for bar charts (vertical grid lines mess with the axis size)
        const innerTickSize =
          this.props.height - this.state.topMargin - this.state.bottomMargin
        bottomMargin = bottomMargin - innerTickSize + 10
      }

      let leftMargin = Math.ceil(maxYLabelWidth) + 45 // margin to include axis label
      // If the rotated labels in the x axis exceed the width of the chart, use that instead
      if (xAxisBBox.width > this.props.width) {
        leftMargin =
          xAxisBBox.width - this.props.width + this.state.leftMargin + 45
      }

      this.setState({
        leftMargin,
        bottomMargin,
        rightMargin,
        bottomLegendMargin,
        bottomLegendWidth
      })
    } catch (error) {
      // Something went wrong rendering the chart.
      console.error(error)
    }
  }

  tooltipFormatter2D = (data, colIndex) => {
    const { columns } = this.props
    const labelCol = columns[0]
    const valueCols = columns.slice(1) // Supports multi-series

    if (!labelCol || !valueCols || !(colIndex >= 0)) {
      return null
    }

    try {
      const tooltipElement = `<div>
      <div>
        <strong>${labelCol.title}:</strong> ${formatElement({
        element: data.label,
        column: labelCol,
        config: this.props.dataFormatting
      })}
      </div>
      <div><strong>${valueCols[colIndex].title}:</strong> ${formatElement({
        element: data.cells[colIndex].value,
        column: valueCols[colIndex],
        config: this.props.dataFormatting
      })}
      </div>
    </div>`
      return tooltipElement
    } catch (error) {
      console.error(error)
      return null
    }
  }

  tooltipFormatter3D = data => {
    const { columns } = this.props
    const labelColX = columns[1]
    const labelColY = columns[0]
    const valueCol = columns[2] // Only one value - does not support multi-series

    if (!labelColX || !labelColY || !valueCol) {
      return null
    }

    return `<div>
    <div>
      <strong>${labelColY.title}:</strong> ${formatElement({
      element: data.labelY,
      column: labelColY,
      config: this.props.dataFormatting
    })}
    </div>
    <div>
      <strong>${labelColX.title}:</strong> ${formatElement({
      element: data.labelX,
      column: labelColX,
      config: this.props.dataFormatting
    })}
    </div>
    <div>
      <strong>${valueCol.title}:</strong> ${formatElement({
      element: data.value,
      column: valueCol,
      config: this.props.dataFormatting
    })}
    </div>
  </div>`
  }

  saveAsPNG = () => {
    const svgElement = this.chartRef
    if (!svgElement) {
      return
    }

    svgToPng(svgElement, 20)
      .then(data => {
        let dt = data // << this fails in IE/Edge...
        dt = dt.replace(/^data:image\/[^;]*/, 'data:application/octet-stream')
        dt = dt.replace(
          /^data:application\/octet-stream/,
          'data:application/octet-stream;headers=Content-Disposition%3A%20attachment%3B%20filename=Canvas.png'
        )

        // Create link and simulate click for download
        const link = document.createElement('a')
        link.setAttribute('href', dt)
        link.setAttribute('download', 'Chart.png')
        link.setAttribute('target', '_blank')
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      })
      .catch(err => {})
  }

  getCommonChartProps = () => {
    const {
      topMargin,
      bottomMargin,
      rightMargin,
      leftMargin,
      bottomLegendMargin,
      bottomLegendWidth
    } = this.state

    const {
      width,
      height,
      data,
      columns,
      onChartClick,
      chartColors,
      activeChartElementKey,
      dataFormatting,
      onLegendClick
    } = this.props

    const filteredSeriesData = this.getFilteredSeriesData(data)

    return {
      data: filteredSeriesData,
      colorScale: this.colorScale,
      height,
      width,
      columns,
      topMargin,
      bottomMargin,
      rightMargin,
      leftMargin,
      bottomLegendMargin,
      bottomLegendWidth,
      onChartClick,
      dataFormatting,
      chartColors,
      activeChartElementKey,
      onLegendClick
    }
  }

  getFilteredSeriesData = data => {
    if (_get(data, '[0].cells')) {
      try {
        const filteredSeriesData = data.map(d => {
          const newCells = d.cells.filter(cell => {
            return !cell.hidden
          })

          return {
            ...d,
            cells: newCells
          }
        })

        return filteredSeriesData
      } catch (error) {
        console.error(error)
        return data
      }
    }
    return data
  }

  renderColumnChart = () => (
    <ChataColumnChart
      {...this.getCommonChartProps()}
      labelValue="label"
      tooltipFormatter={this.tooltipFormatter2D}
      legendLabels={getLegendLabelsForMultiSeries(
        this.props.columns,
        this.colorScale
      )}
    />
  )

  renderBarChart = () => (
    <ChataBarChart
      {...this.getCommonChartProps()}
      labelValue="label"
      tooltipFormatter={this.tooltipFormatter2D}
      legendLabels={getLegendLabelsForMultiSeries(
        this.props.columns,
        this.colorScale
      )}
    />
  )

  renderLineChart = () => (
    <ChataLineChart
      {...this.getCommonChartProps()}
      labelValue="label"
      tooltipFormatter={this.tooltipFormatter2D}
      legendLabels={getLegendLabelsForMultiSeries(
        this.props.columns,
        this.colorScale
      )}
    />
  )

  renderPieChart = () => (
    <ChataPieChart
      {...this.getCommonChartProps()}
      labelValue="label"
      backgroundColor={this.props.backgroundColor}
      tooltipFormatter={d => {
        const { columns } = this.props
        const label = _get(d, `data.value.label`)
        const value = _get(d, 'value')

        if (!label || !value) {
          return null
        }

        try {
          const tooltipElement = `<div>
          <div>
            <strong>${columns[0].title}:</strong> ${formatElement({
            element: label,
            column: columns[0],
            config: this.props.dataFormatting
          })}
          </div>
          <div><strong>${columns[1].title}:</strong> ${formatElement({
            element: value,
            column: columns[1],
            config: this.props.dataFormatting
          })}
          </div>
        </div>`
          return tooltipElement
        } catch (error) {
          console.error(error)
          return null
        }
      }}
    />
  )

  renderHeatmapChart = () => (
    <ChataHeatmapChart
      {...this.getCommonChartProps()}
      dataValue="value"
      labelValueX="labelX"
      labelValueY="labelY"
      tooltipFormatter={this.tooltipFormatter3D}
    />
  )

  renderBubbleChart = () => (
    <ChataBubbleChart
      {...this.getCommonChartProps()}
      dataValue="value"
      labelValueX="labelX"
      labelValueY="labelY"
      tooltipFormatter={this.tooltipFormatter3D}
    />
  )

  renderStackedColumnChart = () => (
    <ChataStackedColumnChart
      {...this.getCommonChartProps()}
      dataValue="value"
      labelValueX="labelY"
      labelValueY="labelX"
      tooltipFormatter={this.tooltipFormatter3D}
    />
  )

  renderStackedBarChart = () => (
    <ChataStackedBarChart
      {...this.getCommonChartProps()}
      dataValue="value"
      labelValueX="labelY"
      labelValueY="labelX"
      tooltipFormatter={this.tooltipFormatter3D}
    />
  )

  render = () => {
    let chart
    switch (this.props.type) {
      case 'column': {
        chart = this.renderColumnChart()
        break
      }
      case 'bar': {
        chart = this.renderBarChart()
        break
      }
      case 'line': {
        chart = this.renderLineChart()
        break
      }
      case 'pie': {
        chart = this.renderPieChart()
        break
      }
      case 'bubble': {
        chart = this.renderBubbleChart()
        break
      }
      case 'heatmap': {
        chart = this.renderHeatmapChart()
        break
      }
      case 'stacked_column': {
        chart = this.renderStackedColumnChart()
        break
      }
      case 'stacked_bar': {
        chart = this.renderStackedBarChart()
        break
      }
      case 'contrast_column': {
        chart = this.renderContrastColumnChart()
        break
      }
      case 'contrast_bar': {
        chart = this.renderContrastBarChart()
        break
      }
      case 'contrast_line': {
        chart = this.renderContrastLineChart()
        break
      }
      default: {
        chart = 'Unknown Display Type'
        break
      }
    }
    return (
      <div className="chata-chart-container" data-test="chata-chart">
        <svg
          ref={r => (this.chartRef = r)}
          xmlns="http://www.w3.org/2000/svg"
          width={this.props.width}
          height={this.props.height}
          style={{
            fontFamily: 'inherit',
            background: 'inherit'
          }}
        >
          {chart}
        </svg>
      </div>
    )
  }
}
