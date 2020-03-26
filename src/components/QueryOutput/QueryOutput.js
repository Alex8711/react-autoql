import React, { Fragment } from 'react'
import uuid from 'uuid'
import dayjs from 'dayjs'
import ReactTooltip from 'react-tooltip'
import Popover from 'react-tiny-popover'
import disableScroll from 'disable-scroll'
import _get from 'lodash.get'
import { scaleOrdinal } from 'd3-scale'
import {
  number,
  bool,
  string,
  func,
  shape,
  arrayOf,
  instanceOf
} from 'prop-types'

import {
  dataFormattingType,
  themeConfigType,
  autoQLConfigType,
  authenticationType
} from '../../props/types'
import {
  dataFormattingDefault,
  themeConfigDefault,
  autoQLConfigDefault,
  authenticationDefault
} from '../../props/defaults'
import { LIGHT_THEME, DARK_THEME } from '../../js/Themes'
import { setStyleVars, getQueryParams } from '../../js/Util'

import { ChataTable } from '../ChataTable'
import { ChataChart } from '../Charts/ChataChart'
import { QueryInput } from '../QueryInput'
import { SafetyNetMessage } from '../SafetyNetMessage'
import { Icon } from '../Icon'
// import { ChataForecast } from '../ChataForecast'

import ErrorBoundary from '../../containers/ErrorHOC/ErrorHOC'
import errorMessages from '../../js/errorMessages'

import {
  onlyUnique,
  formatElement,
  makeEmptyArray,
  getNumberOfGroupables,
  getSupportedDisplayTypes,
  getDefaultDisplayType,
  isDisplayTypeValid,
  getGroupBysFromPivotTable,
  getGroupBysFromTable,
  getGroupBysFrom3dChart,
  getGroupBysFrom2dChart,
  isTableType,
  isChartType,
  isForecastType
} from '../../js/Util.js'

import './QueryOutput.scss'

String.prototype.isUpperCase = function() {
  return this.valueOf().toUpperCase() === this.valueOf()
}

String.prototype.toProperCase = function() {
  return this.replace(/\w\S*/g, txt => {
    if (txt.isUpperCase()) {
      return txt
    }
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  })
}

export default class QueryOutput extends React.Component {
  supportedDisplayTypes = []
  SAFETYNET_KEY = uuid.v4()

  static propTypes = {
    queryResponse: shape({}).isRequired,
    queryInputRef: instanceOf(QueryInput),
    themeConfig: themeConfigType,
    autoQLConfig: autoQLConfigType,
    authentication: authenticationType,
    dataFormatting: dataFormattingType,
    onSuggestionClick: func,
    displayType: string,
    renderTooltips: bool,
    onQueryValidationSelectOption: func,
    autoSelectQueryValidationSuggestion: bool,
    queryValidationSelections: arrayOf(shape({})),
    renderSuggestionsAsDropdown: bool,
    suggestionSelection: string,
    height: number,
    width: number,
    hideColumnCallback: func,
    activeChartElementKey: string,
    onTableFilterCallback: func,
    enableColumnHeaderContextMenu: bool
  }

  static defaultProps = {
    themeConfig: themeConfigDefault,
    autoQLConfig: autoQLConfigDefault,
    authentication: authenticationDefault,
    dataFormatting: dataFormattingDefault,
    displayType: undefined,
    queryInputRef: undefined,
    onSuggestionClick: undefined,
    renderTooltips: true,
    autoSelectQueryValidationSuggestion: true,
    queryValidationSelections: undefined,
    renderSuggestionsAsDropdown: false,
    selectedSuggestion: undefined,
    height: undefined,
    width: undefined,
    activeChartElementKey: undefined,
    enableColumnHeaderContextMenu: false,
    onDataClick: () => {},
    onQueryValidationSelectOption: () => {},
    hideColumnCallback: () => {},
    onTableFilterCallback: () => {}
  }

  state = {
    displayType: null,
    tableFilters: [],
    suggestionSelection: this.props.selectedSuggestion
  }

  componentDidMount = () => {
    try {
      const { theme, chartColors } = this.props.themeConfig
      this.COMPONENT_KEY = uuid.v4()
      this.colorScale = scaleOrdinal().range(chartColors)
      const themeStyles = theme === 'light' ? LIGHT_THEME : DARK_THEME
      setStyleVars({ themeStyles, prefix: '--chata-output-' })

      // Determine the supported visualization types based on the response data
      this.supportedDisplayTypes = getSupportedDisplayTypes(
        this.props.queryResponse
      )

      // Set the initial display type based on prop value, response, and supported display types
      this.setState({
        displayType: isDisplayTypeValid(
          this.props.queryResponse,
          this.props.displayType
        )
          ? this.props.displayType
          : getDefaultDisplayType(this.props.queryResponse)
      })
    } catch (error) {
      console.error(error)
      this.props.onErrorCallback(error)
    }
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (
      _get(prevProps, 'themeConfig.theme') !==
      _get(this.props, 'themeConfig.theme')
    ) {
      const { theme } = this.props.themeConfig
      const themeStyles = theme === 'light' ? LIGHT_THEME : DARK_THEME
      setStyleVars({ themeStyles, prefix: '--chata-output-' })
    }

    if (this.props.queryResponse && !prevProps.queryResponse) {
      this.setResponseData(this.state.displayType)
      this.forceUpdate()
    }

    // Initial display type has been determined, set the table and chart data now
    if (!prevState.displayType && this.state.displayType) {
      this.setResponseData(this.state.displayType)
      this.forceUpdate()
    }

    // Detected a display type change from props. We must make sure
    // the display type is valid before updating the state
    if (
      this.props.displayType &&
      this.props.displayType !== prevProps.displayType &&
      this.supportedDisplayTypes &&
      this.supportedDisplayTypes.includes(this.props.displayType)
    ) {
      this.setState({ displayType: this.props.displayType })
    }

    // Do not allow scrolling while the context menu is open
    if (!prevState.isContextMenuOpen && this.state.isContextMenuOpen) {
      disableScroll.on()
    } else if (prevState.isContextMenuOpen && !this.state.isContextMenuOpen) {
      disableScroll.off()
    }

    ReactTooltip.rebuild()
  }

  componentWillUnmount = () => {
    ReactTooltip.hide()
  }

  setResponseData = () => {
    // Initialize ID's of tables
    this.tableID = uuid.v4()
    this.pivotTableID = uuid.v4()

    const { displayType } = this.state
    const { queryResponse } = this.props

    if (_get(queryResponse, 'data.data') && displayType) {
      const responseBody = queryResponse.data.data
      this.queryID = responseBody.query_id // We need queryID for drilldowns (for now)
      this.interpretation = responseBody.interpretation
      this.data = responseBody.rows ? [...responseBody.rows] : null
      if (isTableType(displayType) || isChartType(displayType)) {
        this.generateTableData()
        this.shouldGeneratePivotData() && this.generatePivotData()
        this.shouldGenerateChartData() && this.generateChartData()
      } else if (isForecastType(displayType)) {
        this.generateForecastData()
      }
    }
  }

  shouldGeneratePivotData = () => {
    return this.tableData && this.supportedDisplayTypes.includes('pivot_table')
  }

  shouldGenerateChartData = () => {
    return !!getNumberOfGroupables(this.tableColumns) && this.tableData
  }

  generateForecastData = () => {
    // This is temporary until we create the forecast vis
    this.generateTableData()
    this.shouldGenerateChartData() && this.generateChartData()
  }

  generateTableData = () => {
    this.tableColumns = this.formatColumnsForTable(
      this.props.queryResponse.data.data.columns
    )

    this.tableData =
      typeof this.data === 'string' // This will change once the query response is refactored
        ? undefined
        : this.data
  }

  generatePivotData = newData => {
    try {
      if (this.tableColumns.length === 2) {
        this.generateDatePivotData(newData)
      } else {
        this.generatePivotTableData(newData)
      }
    } catch (error) {
      console.error(error)
      this.props.onErrorCallback(error)
      this.pivotTableData = undefined
    }
  }

  createSuggestionMessage = (userInput, suggestions) => {
    return (
      <div className="chata-suggestion-message">
        <div className="chata-suggestions-container">
          {this.props.renderSuggestionsAsDropdown ? (
            <select
              key={uuid.v4()}
              onChange={e => {
                this.setState({ suggestionSelection: e.target.value })
                this.onSuggestionClick(
                  e.target.value,
                  undefined,
                  undefined,
                  'suggestion'
                )
              }}
              value={this.state.suggestionSelection}
              className="chata-suggestions-select"
            >
              <option key={uuid.v4()} value={userInput}>
                {userInput}
              </option>
              {suggestions.map((suggestion, i) => {
                return (
                  <option key={uuid.v4()} value={suggestion}>
                    {suggestion}
                  </option>
                )
              })}
            </select>
          ) : (
            suggestions.map(suggestion => {
              return (
                <div key={uuid.v4()}>
                  <button
                    onClick={() =>
                      this.onSuggestionClick(
                        suggestion,
                        true,
                        undefined,
                        'suggestion'
                      )
                    }
                    className="chata-suggestion-btn"
                  >
                    {suggestion}
                  </button>
                  <br />
                </div>
              )
            })
          )}
        </div>
      </div>
    )
  }

  renderSuggestionMessage = suggestions => {
    // if (!this.props.autoQLConfig.enableQuerySuggestions) {
    //   return this.renderErrorMessage("Oops! We didn't understand that query.")
    // }
    // There is actually a suggestion for this case
    const { queryResponse } = this.props
    // const responseBody = { ...queryResponse.data }
    // if (
    //   queryResponse.config &&
    //   responseBody.data.rows.length !== 0
    // ) {
    // const suggestions = responseBody.data.rows

    const queryParams = getQueryParams(_get(queryResponse, 'config.url'))
    if (suggestions.length && queryParams) {
      const originalQuery = queryParams.search
      // const theUserInput = JSON.parse(queryResponse.config.data).search
      return this.createSuggestionMessage(originalQuery, suggestions)
    }

    // }

    // No suggestions
    else {
      return this.createSuggestionMessage()
    }

    // return this.renderErrorMessage()
  }

  renderSingleValueResponse = () => {
    return (
      <a
        className="single-value-response"
        onClick={() => {
          this.props.onDataClick(
            this.props.authentication.demo ? {} : [],
            this.queryID,
            true
          )
        }}
      >
        {formatElement({
          element: this.tableData[0],
          column: this.tableColumns[0],
          config: this.props.dataFormatting
        })}
      </a>
    )
  }

  copyTableToClipboard = () => {
    if (this.state.displayType === 'table' && this.tableRef) {
      this.tableRef.copyToClipboard()
    } else if (this.state.displayType === 'pivot_table' && this.pivotTableRef) {
      this.pivotTableRef.copyToClipboard()
    }
  }

  saveTableAsCSV = () => {
    if (this.state.displayType === 'table' && this.tableRef) {
      this.tableRef.saveAsCSV()
    } else if (this.state.displayType === 'pivot_table' && this.pivotTableRef) {
      this.pivotTableRef.saveAsCSV()
    }
  }

  saveChartAsPNG = () => {
    if (this.chartRef) {
      this.chartRef.saveAsPNG()
    }
  }

  renderForecastVis = () => {
    return this.renderTable()
    // return <ChataForecast />
  }

  processCellClick = cell => {
    if (this.state.isContextMenuOpen) {
      this.setState({ isContextMenuOpen: false })
    } else {
      let groupByObject = {}
      if (this.pivotTableColumns && this.state.displayType === 'pivot_table') {
        groupByObject = getGroupBysFromPivotTable(
          cell,
          this.tableColumns,
          this.pivotTableColumns,
          this.pivotOriginalColumnData,
          this.props.authentication.demo
        )
      } else {
        groupByObject = getGroupBysFromTable(
          cell,
          this.tableColumns,
          this.props.authentication.demo
        )
      }

      this.props.onDataClick(groupByObject, this.queryID)
    }
  }

  // processRowClick = row => {
  //   if (this.state.isContextMenuOpen) {
  //     this.setState({ isContextMenuOpen: false })
  //   } else {
  //     groupByObject = getGroupBysFromTable(
  //       row,
  //       this.tableColumns,
  //       this.props.authentication.demo
  //     )
  //     this.props.onDataClick(groupByObject, this.queryID)
  //   }
  // }

  onChartClick = ({ row, column, activeKey }) => {
    let groupByObject = {}
    if (
      this.pivotTableColumns &&
      !this.tableColumns[0].name.includes('month')
    ) {
      groupByObject = getGroupBysFrom3dChart(
        row,
        column,
        this.tableColumns,
        this.props.authentication.demo
      )
    } else {
      groupByObject = getGroupBysFrom2dChart(
        row,
        this.tableColumns,
        this.props.authentication.demo
      )
    }

    this.props.onDataClick(groupByObject, this.queryID, activeKey)
  }

  onTableFilter = async filters => {
    if (
      this.state.displayType === 'table' &&
      _get(this.tableRef, 'ref.table')
    ) {
      this.headerFilters = filters
      setTimeout(() => {
        const tableRef = _get(this.tableRef, 'ref.table')
        if (tableRef) {
          const newTableData = tableRef.getData(true)
          this.shouldGenerateChartData() && this.generateChartData(newTableData)
          this.props.onTableFilterCallback(newTableData)
        }
      }, 500)
    } else if (
      this.state.displayType === 'pivot_table' &&
      _get(this.pivotTableRef, 'ref.table')
    ) {
      this.pivotHeaderFilters = filters
      setTimeout(() => {
        const pivotTableRef = _get(this.pivotTableRef, 'ref.table')
        if (pivotTableRef) {
          const newTableData = pivotTableRef.getData(true)
          this.props.onTableFilterCallback(newTableData)
        }
      }, 500)
    }
  }

  onLegendClick = d => {
    const newChartData = this.chartData.map(data => {
      const newCells = data.cells.map(cell => {
        if (cell.label === d) {
          return {
            ...cell,
            hidden: !cell.hidden
          }
        }
        return cell
      })

      return {
        ...data,
        cells: newCells
      }
    })

    const newColumns = this.tableColumns.map(col => {
      if (col.title === d) {
        return {
          ...col,
          isSeriesHidden: !col.isSeriesHidden
        }
      }
      return col
    })

    this.tableColumns = newColumns
    this.chartData = newChartData

    this.forceUpdate()
  }

  renderTable = () => {
    if (
      !this.tableData ||
      (this.state.displayType === 'pivot_table' && !this.pivotTableData)
    ) {
      return 'Error: There was no data supplied for this table'
    }

    if (this.tableData.length === 1 && this.tableData[0].length === 1) {
      // This is a single cell of data
      return this.renderSingleValueResponse()
    }

    const tableBorderColor =
      this.props.themeConfig.theme === 'light'
        ? LIGHT_THEME['--chata-messenger-border-color']
        : DARK_THEME['--chata-messenger-border-color']

    const tableHoverColor =
      this.props.themeConfig.theme === 'light'
        ? LIGHT_THEME['--chata-messenger-hover-color']
        : DARK_THEME['--chata-messenger-hover-color']

    if (this.state.displayType === 'pivot_table') {
      return (
        <ChataTable
          key={this.pivotTableID}
          ref={ref => (this.pivotTableRef = ref)}
          columns={this.pivotTableColumns}
          data={this.pivotTableData}
          borderColor={tableBorderColor}
          hoverColor={tableHoverColor}
          onCellClick={this.processCellClick}
          headerFilters={this.pivotHeaderFilters}
          onFilterCallback={this.onTableFilter}
          setFilterTagsCallback={this.props.setFilterTagsCallback}
          enableColumnHeaderContextMenu={
            this.props.enableColumnHeaderContextMenu
          }
        />
      )
    }

    return (
      <ChataTable
        key={this.tableID}
        ref={ref => (this.tableRef = ref)}
        columns={this.tableColumns}
        data={this.tableData}
        borderColor={tableBorderColor}
        hoverColor={tableHoverColor}
        onCellClick={this.processCellClick}
        headerFilters={this.headerFilters}
        onFilterCallback={this.onTableFilter}
        setFilterTagsCallback={this.props.setFilterTagsCallback}
      />
    )
  }

  renderChart = (width, height, displayType) => {
    if (!this.chartData) {
      return 'Error: There was no data supplied for this chart'
    }

    // let data = this.chartData
    // let columns = this.tableColumns
    // if (
    //   this.state.displayType === 'stacked_bar' ||
    //   this.state.displayType === 'stacked_column'
    // ) {
    //   data = this.pivotTableData
    //   columns = this.pivotTableColumns
    // }

    return (
      <ErrorBoundary>
        <ChataChart
          ref={ref => (this.chartRef = ref)}
          type={displayType || this.state.displayType}
          data={this.chartData}
          columns={this.tableColumns}
          height={height}
          width={width}
          dataFormatting={this.props.dataFormatting}
          chartColors={this.props.themeConfig.chartColors}
          backgroundColor={this.props.backgroundColor}
          activeChartElementKey={this.props.activeChartElementKey}
          onLegendClick={this.onLegendClick}
          // valueFormatter={formatElement}
          // onChartClick={(row, columns) => {
          //   if (!this.props.isDrilldownDisabled) {
          //     this.props.processDrilldown(row, columns, this.queryID)
          //   }
          // }}
          onChartClick={this.onChartClick}
        />
      </ErrorBoundary>
    )
  }

  renderHelpResponse = () => {
    const url = this.data
    if (!url) {
      return null
    }

    const hasHashTag = url.includes('#')
    let linkText = url
    if (hasHashTag) {
      const endOfUrl = url.split('#')[1].replace(/-/g, ' ')
      linkText = endOfUrl.charAt(0).toUpperCase() + endOfUrl.substr(1)
    }

    return (
      <Fragment>
        Great news, I can help with that:
        <br />
        {
          <button
            className="chata-help-link-btn"
            target="_blank"
            onClick={() => window.open(url, '_blank')}
          >
            <Icon type="globe" className="chata-help-link-icon" />
            {linkText}
          </button>
        }
      </Fragment>
    )
  }

  generateChartData = data => {
    try {
      const columns = this.tableColumns
      const tableData = data || this.tableData

      if (getNumberOfGroupables(this.tableColumns) === 1) {
        this.chartData = Object.values(
          tableData.reduce((chartDataObject, row) => {
            // Loop through columns and create a series for each
            const cells = []
            row.forEach((value, i) => {
              if (i > 0) {
                cells.push({
                  value: Number(value) || value,
                  label: columns[i].title,
                  color: this.colorScale(i),
                  hidden: false
                })
              }
            })

            // Make sure the row label doesn't exist already
            if (!chartDataObject[row[0]]) {
              chartDataObject[row[0]] = {
                origColumns: columns,
                origRow: row,
                label: row[0],
                cells,
                formatter: (value, column) => {
                  return formatElement({
                    element: value,
                    column,
                    config: this.props.dataFormatting
                  })
                }
              }
            } else {
              // If this label already exists, just add the values together
              // The BE should prevent this from happening though
              chartDataObject[row[0]].cells = chartDataObject[row[0]].cells.map(
                (cell, index) => {
                  return {
                    ...cell,
                    value: cell.value + Number(cells[index].value)
                  }
                }
              )
            }
            return chartDataObject
          }, {})
        )
      } else if (getNumberOfGroupables(this.tableColumns) === 2) {
        this.chartData = tableData.map(row => {
          return {
            origColumns: columns,
            origRow: row,
            labelX: row[1],
            labelY: row[0],
            value: Number(row[2]) || row[2],
            formatter: (value, column) => {
              return formatElement({
                element: value,
                column,
                config: this.props.dataFormatting
              })
            }
          }
        })
      }
    } catch (error) {
      console.error(error)
      this.props.onErrorCallback(error)
      // Something went wrong. Do not show chart options
      this.supportedDisplayTypes = ['table']
      this.chartData = undefined
    }
  }

  setFilterFunction = col => {
    const self = this
    if (col.type === 'DATE' || col.type === 'DATE_STRING') {
      return (headerValue, rowValue, rowData, filterParams) => {
        // headerValue - the value of the header filter element
        // rowValue - the value of the column in this row
        // rowData - the data for the row being filtered
        // filterParams - params object passed to the headerFilterFuncParams property

        try {
          const formattedElement = formatElement({
            element: rowValue,
            column: col,
            config: self.props.dataFormatting
          })

          const shouldFilter = formattedElement
            .toLowerCase()
            .includes(headerValue.toLowerCase())

          return shouldFilter
        } catch (error) {
          console.error(error)
          this.props.onErrorCallback(error)
          return false
        }
      }
    } else if (
      col.type === 'DOLLAR_AMT' ||
      col.type === 'QUANTITY' ||
      col.type === 'PERCENT'
    ) {
      return (headerValue, rowValue, rowData, filterParams) => {
        // headerValue - the value of the header filter element
        // rowValue - the value of the column in this row
        // rowData - the data for the row being filtered
        // filterParams - params object passed to the headerFilterFuncParams property

        try {
          const trimmedValue = headerValue.trim()
          if (trimmedValue.length >= 2) {
            const number = Number(
              trimmedValue.substr(1).replace(/[^0-9.]/g, '')
            )
            if (trimmedValue[0] === '>' && trimmedValue[1] === '=') {
              return rowValue >= number
            } else if (trimmedValue[0] === '>') {
              return rowValue > number
            } else if (trimmedValue[0] === '<' && trimmedValue[1] === '=') {
              return rowValue <= number
            } else if (trimmedValue[0] === '<') {
              return rowValue < number
            } else if (trimmedValue[0] === '!' && trimmedValue[1] === '=') {
              return rowValue !== number
            } else if (trimmedValue[0] === '=') {
              return rowValue === number
            }
          }

          // No logical operators detected, just compare strings
          const strippedHeader = headerValue.replace(/[^0-9.]/g, '')
          return rowValue.toString().includes(strippedHeader)
        } catch (error) {
          console.error(error)
          this.props.onErrorCallback(error)
          return false
        }
      }
    }
    return undefined
  }

  getColTitle = col => {
    if (col.display_name) {
      return col.display_name
    }

    let title
    const nameFragments = col.name.split('___')
    if (nameFragments.length === 2) {
      let firstFragment = nameFragments[0]
      let secondFragment = nameFragments[1]

      if (!firstFragment.isUpperCase()) {
        firstFragment = firstFragment.toProperCase()
      }
      if (!secondFragment.isUpperCase()) {
        secondFragment = secondFragment.toProperCase()
      }
      title = `${firstFragment} (${secondFragment})`
    } else if (nameFragments.length === 1) {
      // all good
    } else {
      console.warn(`unexpected nameFragments.length ${nameFragments.length}`)
    }

    // replace underscores with spaces, then collapse all consecutive spaces to 1
    title = col.name.replace(/_/g, ' ').replace(/\s+/g, ' ')
    title = `${title.toProperCase()}`

    return title
  }

  formatColumnsForTable = columns => {
    if (!columns) {
      return null
    }
    const formattedColumns = columns.map((col, i) => {
      // Regardless of the BE response, we want to default to percent
      if (
        (col.type === 'RATIO' || col.type === 'NUMBER') &&
        _get(this.props.dataFormatting, 'comparisonDisplay') === 'PERCENT'
      ) {
        col.type = 'PERCENT'
      }

      col.field = `${i}`
      col.title = this.getColTitle(col)
      col.id = uuid.v4()

      // Visibility flag: this can be changed through the column visibility editor modal
      col.visible = col.is_visible

      // Cell alignment
      if (
        col.type === 'DOLLAR_AMT' ||
        col.type === 'RATIO' ||
        col.type === 'NUMBER'
      ) {
        col.align = 'right'
      } else {
        col.align = 'center'
      }

      // Cell formattingg
      col.formatter = (cell, formatterParams, onRendered) => {
        return formatElement({
          element: cell.getValue(),
          column: col,
          config: this.props.dataFormatting,
          htmlElement: cell.getElement()
        })
      }

      // Always have filtering enabled, but only
      // display if filtering is toggled by user
      col.headerFilter = 'input'

      // Need to set custom filters for cells that are
      // displayed differently than the data (ie. dates)
      col.headerFilterFunc = this.setFilterFunction(col)

      // Context menu when right clicking on column header
      col.headerContext = (e, column) => {
        // Do not show native context menu
        e.preventDefault()
        this.setState({
          isContextMenuOpen: true,
          activeColumn: column,
          contextMenuPosition: { top: e.clientY + 10, left: e.clientX - 20 }
        })
      }

      // Allow proper chronological sorting for date strings
      if (col.type === 'DATE' || col.type === 'DATE_STRING') {
        col.sorter = function(a, b, aRow, bRow, column, dir, sorterParams) {
          const aDate = dayjs(a).unix()
          const bDate = dayjs(b).unix()

          if (!aDate || !bDate) {
            return a - b
          }

          return aDate - bDate
        }
      }

      return col
    })
    return formattedColumns
  }

  generateDatePivotData = newData => {
    const uniqueMonths = {
      January: 0,
      February: 1,
      March: 2,
      April: 3,
      May: 4,
      June: 5,
      July: 6,
      August: 7,
      September: 8,
      October: 9,
      November: 10,
      December: 11
    }

    const tableData = newData || this.tableData

    const uniqueYears = tableData
      .map(d => Number(dayjs.unix(d[0]).format('YYYY')))
      .filter(onlyUnique)
      .sort()
      .reduce((map, title, i) => {
        map[title] = i + 1
        return map
      }, {})

    // Generate new column array
    const pivotTableColumns = [
      {
        title: 'Month',
        name: 'Month',
        field: '0',
        // sorter: 'date',
        frozen: true
      }
    ]
    Object.keys(uniqueYears).forEach((year, i) => {
      pivotTableColumns.push({
        ...this.tableColumns[1], // value column
        name: year,
        title: year,
        field: `${i + 1}`,
        headerContext: undefined
      })
    })

    const pivotTableData = makeEmptyArray(Object.keys(uniqueYears).length, 12)
    const pivotOriginalColumnData = {}

    // Populate first column
    Object.keys(uniqueMonths).forEach((month, i) => {
      pivotTableData[i][0] = month
    })
    // Populate remaining columns
    tableData.forEach(row => {
      const year = dayjs.unix(row[0]).format('YYYY')
      const month = dayjs.unix(row[0]).format('MMMM')
      pivotTableData[uniqueMonths[month]][uniqueYears[year]] = row[1]
      // pivotOriginalColumnData[uniqueYears[year]][uniqueMonths[month]] = row[0]
      pivotOriginalColumnData[year] = {
        ...pivotOriginalColumnData[year],
        [month]: row[0]
      }
    })

    this.pivotOriginalColumnData = pivotOriginalColumnData
    this.pivotTableColumns = pivotTableColumns
    this.pivotTableData = pivotTableData
  }

  generatePivotTableData = newData => {
    const tableData = newData || this.tableData
    const uniqueValues0 = tableData
      .map(d => d[0])
      .filter(onlyUnique)
      .sort()
      .reduce((map, title, i) => {
        map[title] = i
        return map
      }, {})

    const uniqueValues1 = tableData
      .map(d => d[1])
      .filter(onlyUnique)
      .sort()
      .reduce((map, title, i) => {
        map[title] = i + 1
        return map
      }, {})

    // Generate new column array
    const pivotTableColumns = [
      {
        ...this.tableColumns[0],
        frozen: true,
        headerContext: undefined
      }
    ]
    Object.keys(uniqueValues1).forEach((columnName, i) => {
      const formattedColumnName = formatElement({
        element: columnName,
        column: this.tableColumns[1],
        config: this.props.dataFormatting
      })
      pivotTableColumns.push({
        ...this.tableColumns[2], // value column
        name: columnName,
        title: formattedColumnName,
        field: `${i + 1}`,
        headerContext: undefined
      })
    })

    const pivotTableData = makeEmptyArray(
      Object.keys(uniqueValues1).length,
      Object.keys(uniqueValues0).length
    )
    tableData.forEach(row => {
      // Populate first column
      pivotTableData[uniqueValues0[row[0]]][0] = row[0]
      // Populate data for remaining columns
      pivotTableData[uniqueValues0[row[0]]][uniqueValues1[row[1]]] = row[2]
    })

    this.pivotTableColumns = pivotTableColumns
    this.pivotTableData = pivotTableData
  }

  onSuggestionClick = (suggestion, isButtonClick, skipSafetyNet, source) => {
    if (suggestion === 'None of these') {
      this.setState({ customResponse: 'Thank you for your feedback.' })
    } else {
      if (this.props.onSuggestionClick) {
        this.props.onSuggestionClick(
          suggestion,
          isButtonClick,
          skipSafetyNet,
          source
        )
      }
      if (this.props.queryInputRef) {
        this.props.queryInputRef.submitQuery({
          queryText: suggestion,
          skipSafetyNet: true,
          source
        })
      }
    }
  }

  renderErrorMessage = message => {
    if (message) {
      return message
    }

    return errorMessages.GENERAL_ERROR_MESSAGE
  }

  renderResponse = (width, height) => {
    const { displayType } = this.state
    const { queryResponse } = this.props

    // This is used for "Thank you for your feedback" response
    // when user clicks on "None of these" in the suggestion list
    // Eventually we will want to send this info to the BE
    if (this.state.customResponse) {
      return this.state.customResponse
    }

    // No response prop was provided to <QueryOutput />
    if (!queryResponse) {
      console.warn('Warning: No response object supplied')
      return this.renderErrorMessage('No response supplied')
      // return null
    }

    // Response prop was provided, but it has no response data
    const responseBody = { ...queryResponse.data }
    if (!responseBody) {
      console.warn('Warning: No response body supplied')
      return this.renderErrorMessage()
    }

    // Safetynet was triggered, display safetynet message
    if (responseBody.full_suggestion) {
      return (
        <SafetyNetMessage
          key={this.SAFETYNET_KEY}
          response={this.props.queryResponse}
          onSuggestionClick={query =>
            this.onSuggestionClick(query, true, true, 'safety_net')
          }
          onQueryValidationSelectOption={
            this.props.onQueryValidationSelectOption
          }
          initialSelections={this.props.queryValidationSelections}
          autoSelectSuggestion={this.props.autoSelectSafetyNetSuggestion}
        />
      )
    }

    // Response is not a suggestion list, but no query data object was provided
    // There is no valid query data. This is an error. Return message from UMS
    const responseData = responseBody.data
    if (!responseData) {
      console.warn('Warning: No response data supplied')
      return this.renderErrorMessage(_get(queryResponse, 'message'))
    }

    const isSuggestionList = !!responseData.items
    if (isSuggestionList) {
      return this.renderSuggestionMessage(responseData.items)
    }

    if (!_get(responseData, 'rows.length')) {
      // This is not an error. There is just no data in the DB
      return _get(responseBody, 'message')
    }

    if (displayType && this.data) {
      if (displayType === 'help') {
        return this.renderHelpResponse()
      } else if (isForecastType(displayType)) {
        return this.renderForecastVis()
      } else if (isTableType(displayType)) {
        return this.renderTable()
      } else if (isChartType(displayType)) {
        return this.renderChart(width, height)
      }
      return this.renderErrorMessage(
        `display type not recognized: ${this.state.displayType}`
      )
    }
    // return this.renderErrorMessage('Error: No Display Type')
    return null
  }

  renderContextMenuContent = ({
    position,
    nudgedLeft,
    nudgedTop,
    targetRect,
    popoverRect
  }) => {
    return (
      <div className="context-menu">
        <ul className="context-menu-list">
          <li
            onClick={() => {
              this.setState({ isContextMenuOpen: false })
              this.props.hideColumnCallback(this.state.activeColumn)
            }}
          >
            Hide Column
          </li>
        </ul>
      </div>
    )
  }

  renderContextMenu = () => {
    return (
      <Popover
        isOpen={this.state.isContextMenuOpen}
        position="bottom" // if you'd like, supply an array of preferred positions ordered by priority
        padding={10} // adjust padding here!
        onClickOutside={() => this.setState({ isContextMenuOpen: false })}
        contentLocation={this.state.contextMenuPosition}
        content={props => this.renderContextMenuContent(props)}
      >
        <div />
      </Popover>
    )
  }

  render = () => {
    const responseContainer = document.getElementById(
      `chata-response-content-container-${this.COMPONENT_KEY}`
    )

    let height = 0
    let width = 0

    if (responseContainer) {
      height = responseContainer.offsetHeight
      width = responseContainer.offsetWidth
    }

    if (this.props.height) {
      height = this.props.height
    }

    if (this.props.width) {
      width = this.props.width
    }

    return (
      <Fragment>
        <div
          key={this.COMPONENT_KEY}
          id={`chata-response-content-container-${this.COMPONENT_KEY}`}
          data-test="query-response-wrapper"
          className="chata-response-content-container"
          // style={{ ...style }}
        >
          {this.renderResponse(width, height)}
        </div>
        {this.renderContextMenu()}
        {
          //   this.props.renderTooltips && (
          //   <ReactTooltip
          //     className="chata-chart-tooltip"
          //     id="chart-element-tooltip"
          //     effect="solid"
          //     html
          //   />
          // )
        }
      </Fragment>
    )
  }
}
