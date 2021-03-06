import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Axes } from '../Axes'
import { StackedLines } from '../StackedLines'
import { scaleLinear, scaleBand } from 'd3-scale'
import _get from 'lodash.get'

import { calculateMinAndMaxSums, shouldRotateLabels } from '../../../js/Util'
import { getTickValues } from '../helpers'
import { dataFormattingType, themeConfigType } from '../../../props/types'
import {
  dataFormattingDefault,
  themeConfigDefault,
  getDataFormatting,
  getThemeConfig,
} from '../../../props/defaults'

export default class ChataStackedLineChart extends Component {
  xScale = scaleBand()
  yScale = scaleLinear()

  static propTypes = {
    themeConfig: themeConfigType,
    dataFormatting: dataFormattingType,

    data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    columns: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    tableColumns: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    leftMargin: PropTypes.number,
    rightMargin: PropTypes.number,
    topMargin: PropTypes.number,
    bottomMargin: PropTypes.number,
    onLabelChange: PropTypes.func,
    onXAxisClick: PropTypes.func,
    onYAxisClick: PropTypes.func,
    legendLocation: PropTypes.string,
  }

  static defaultProps = {
    themeConfig: themeConfigDefault,
    dataFormatting: dataFormattingDefault,

    leftMargin: 0,
    rightMargin: 0,
    topMargin: 0,
    bottomMargin: 0,
    numberColumnIndices: [],
    legendLocation: undefined,
    onXAxisClick: () => {},
    onYAxisClick: () => {},
    onLabelChange: () => {},
  }

  componentDidUpdate = () => {
    if (
      typeof this.prevRotateLabels !== 'undefined' &&
      this.prevRotateLabels !== this.rotateLabels
    ) {
      this.props.onLabelChange()
    }
  }

  handleLabelRotation = (tickWidth, labelArray) => {
    this.prevRotateLabels = this.rotateLabels
    this.rotateLabels = shouldRotateLabels(
      tickWidth,
      labelArray,
      this.props.columns[0],
      getDataFormatting(this.props.dataFormatting)
    )
  }

  render = () => {
    const {
      onLegendTitleClick,
      activeChartElementKey,
      enableDynamicCharting,
      bottomLegendMargin,
      numberColumnIndex,
      numberAxisTitle,
      dataFormatting,
      legendLocation,
      onLegendClick,
      tableColumns,
      legendColumn,
      bottomMargin,
      onChartClick,
      legendLabels,
      onXAxisClick,
      onYAxisClick,
      themeConfig,
      rightMargin,
      leftMargin,
      topMargin,
      columns,
      height,
      width,
      data,
    } = this.props

    // Get max and min values from all series
    const { max, min } = calculateMinAndMaxSums(data)

    const xScale = this.xScale
      .domain(data.map((d) => d.label))
      .range([leftMargin, width - rightMargin])
      .paddingInner(1)
      .paddingOuter(0)

    const yScale = this.yScale
      .domain([min, max]) // do we want to deal with negative values for these visualizations?
      .range([height - bottomMargin, topMargin])
      .nice()

    const labelArray = data.map((element) => element.label)
    const tickWidth = Math.abs(
      xScale(_get(data, '[0].label')) - xScale(_get(data, '[1].label'))
    )
    const xTickValues = getTickValues(tickWidth, this.props.width, labelArray)
    this.handleLabelRotation(tickWidth, labelArray)

    return (
      <g data-test="react-autoql-stacked-line-chart">
        <Axes
          themeConfig={themeConfig}
          scales={{ xScale, yScale }}
          xCol={columns[0]}
          yCol={_get(tableColumns, `[${numberColumnIndex}]`)}
          margins={{
            left: leftMargin,
            right: rightMargin,
            bottom: bottomMargin,
            top: topMargin,
            bottomLegend: bottomLegendMargin,
          }}
          width={width}
          height={height}
          xTicks={xTickValues}
          rotateLabels={this.rotateLabels}
          dataFormatting={dataFormatting}
          hasRightLegend={legendLocation === 'right'}
          hasBottomLegend={legendLocation === 'bottom'}
          legendLabels={legendLabels}
          onLegendClick={onLegendClick}
          legendTitle={_get(legendColumn, 'title')}
          onLegendTitleClick={onLegendTitleClick}
          yGridLines
          onXAxisClick={onXAxisClick}
          onYAxisClick={onYAxisClick}
          hasXDropdown={enableDynamicCharting}
          yAxisTitle={numberAxisTitle}
        />
        <StackedLines
          themeConfig={themeConfig}
          scales={{ xScale, yScale }}
          margins={{
            left: leftMargin,
            right: rightMargin,
            bottom: bottomMargin,
            top: topMargin,
          }}
          data={data}
          width={width}
          height={height}
          onChartClick={onChartClick}
          activeKey={activeChartElementKey}
          legendTitle={_get(legendColumn, 'title')}
          minValue={0} // change to min if we want to account for negative values at some point
        />
      </g>
    )
  }
}
