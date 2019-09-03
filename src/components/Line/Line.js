import React, { Component } from 'react'
import { scaleOrdinal } from 'd3-scale'

export default class Line extends Component {
  colorScale = scaleOrdinal()
    .domain([...Array(10).keys()])
    .range(['#26A7E9', '#A5CD39', '#DD6A6A', '#FFA700', '#00C1B2'])

  static propTypes = {}

  state = {
    activeKey: null
  }

  makeLines = () => {
    const { scales, data, labelValue, dataValues } = this.props
    const { xScale, yScale } = scales

    const numberOfSeries = data[0][dataValues].length
    const allLines = []

    for (let series = 0; series < numberOfSeries; series++) {
      data.forEach((d, i) => {
        const d2 = data[i + 1]
        const xShift = xScale.bandwidth() / 2
        allLines.push(
          <line
            key={d[labelValue]}
            className="line"
            x1={xScale(d[labelValue]) + xShift}
            y1={yScale(d[dataValues][series])}
            x2={
              d2
                ? xScale(d2[labelValue]) + xShift
                : xScale(d[labelValue]) + xShift
            }
            y2={
              d2
                ? yScale(d2[dataValues][series])
                : yScale(d[dataValues][series])
            }
            stroke={this.colorScale(series)}
            opacity={0.7}
          />
        )
      })
    }

    return allLines
  }

  makeDots = () => {
    const { scales, data, labelValue, dataValues } = this.props
    const { xScale, yScale } = scales

    const numberOfSeries = data[0][dataValues].length
    const allDots = []

    for (let series = 0; series < numberOfSeries; series++) {
      data.forEach(d => {
        const xShift = xScale.bandwidth() / 2
        allDots.push(
          <circle
            key={d[labelValue]}
            className={`line-dot${
              this.state.activeKey === d[labelValue] ? ' active' : ''
            }`}
            cy={yScale(d[dataValues][series])}
            cx={xScale(d[labelValue]) + xShift}
            stroke="transparent"
            strokeWidth={5}
            r={2}
            onClick={() => this.setState({ activeKey: d[labelValue] })}
            onClick={() => {
              this.setState({ activeKey: d[labelValue] })
              this.props.onChartClick(d.origRow, d.origColumns)
            }}
            data-tip={this.props.tooltipFormatter(d, series)}
            data-for="chart-element-tooltip"
            style={{
              stroke: 'transparent',
              strokeWidth: 10,
              fill: this.colorScale(series),
              fillOpacity: 0.7
            }}
          />
        )
      })
    }
    return allDots
  }

  render = () => {
    return (
      <g>
        {this.makeLines()}
        {this.makeDots()}
      </g>
    )
  }
}
