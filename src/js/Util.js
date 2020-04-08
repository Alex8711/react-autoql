import Numbro from 'numbro'
import dayjs from 'dayjs'
import _get from 'lodash.get'

import {
  MONTH_NAMES,
  CHART_TYPES,
  TABLE_TYPES,
  FORECAST_TYPES
} from './Constants'

export const getParameterByName = (
  parameterName,
  url = window.location.href
) => {
  const processedParameterName = parameterName.replace(/[\[\]]/g, '\\$&')
  const regex = new RegExp(`[?&]${processedParameterName}(=([^&#]*)|&|#|$)`)

  const results = regex.exec(url)
  if (!results) {
    return null
  }
  if (!results[2]) {
    return ''
  }
  return decodeURIComponent(results[2].replace(/\+/g, ' '))
}

export const onlyUnique = (value, index, self) => {
  return self.indexOf(value) === index
}

export const makeEmptyArray = (w, h) => {
  var arr = []
  for (let i = 0; i < h; i++) {
    arr[i] = []
    for (let j = 0; j < w; j++) {
      arr[i][j] = ''
    }
  }
  return arr
}

export const isDayJSDateValid = date => {
  return date !== 'Invalid Date'
}

export const formatEpochDate = (value, col, config) => {
  try {
    const { monthYearFormat, dayMonthYearFormat } = config
    const year = 'YYYY'
    const monthYear = monthYearFormat || 'MMM YYYY'
    const dayMonthYear = dayMonthYearFormat || 'MMM D, YYYY'

    // Use title to determine significant digits of date format
    const title = col.title
    let date = dayjs.unix(value).format(dayMonthYear)

    if (!Number(value)) {
      // Not an epoch time. Try converting using dayjs
      if (title && title.toLowerCase().includes('year')) {
        date = dayjs(value).format(year)
      } else if (title && title.toLowerCase().includes('month')) {
        date = dayjs(value).format(monthYear)
      }
      date = dayjs(value).format(dayMonthYear)
    } else if (title && title.toLowerCase().includes('year')) {
      date = dayjs.unix(value).format(year)
    } else if (title && title.toLowerCase().includes('month')) {
      date = dayjs.unix(value).format(monthYear)
    }

    if (isDayJSDateValid(date)) {
      return date
    }

    return value
  } catch (error) {
    console.error(error)
    return value
  }
}

export const formatStringDate = (value, config) => {
  if (value && typeof value === 'string') {
    const dateArray = value.split('-')
    const year = _get(dateArray, '[0]')
    const month = _get(dateArray, '[1]')
    const day = _get(dateArray, '[2]')

    const { monthYearFormat, dayMonthYearFormat } = config
    const monthYear = monthYearFormat || 'MMM YYYY'
    const dayMonthYear = dayMonthYearFormat || 'MMM D, YYYY'

    if (day) {
      const date = dayjs(value).format(dayMonthYear)
      if (isDayJSDateValid(date)) {
        return date
      }
    } else if (month) {
      const date = dayjs(value).format(monthYear)
      if (isDayJSDateValid(date)) {
        return date
      }
    } else if (year) {
      return year
    }
  }

  // Unable to parse...
  return value
}

export const isColumnNumberType = col => {
  const { type } = col
  return (
    type === 'DOLLAR_AMT' ||
    type === 'QUANTITY' ||
    type === 'PERCENT' ||
    type === 'RATIO'
  )
}

export const isColumnStringType = col => {
  const { type } = col
  return type === 'STRING' || type === 'DATE_STRING' || type === 'DATE'
}

export const formatChartLabel = ({ d, col, config = {} }) => {
  if (d == null) {
    return {
      fullWidthLabel: 'Untitled Category',
      formattedLabel: 'Untitled Category',
      isTruncated: false
    }
  }

  if (!col || !col.type) {
    return d
  }

  const { currencyCode, languageCode } = config

  let formattedLabel = d
  switch (col.type) {
    case 'STRING': {
      break
    }
    case 'DOLLAR_AMT': {
      if (Number(d) || Number(d) === 0) {
        const currency = currencyCode || 'USD'
        // const sigDigs = String(parseInt(d)).length
        try {
          formattedLabel = new Intl.NumberFormat(languageCode, {
            style: 'currency',
            currency: `${currency}`,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
            // maximumSignificantDigits: sigDigs
          }).format(d)
        } catch (error) {
          console.error(error)
          formattedLabel = new Intl.NumberFormat(languageCode, {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
            // maximumSignificantDigits: sigDigs
          }).format(d)
        }
      }
      break
    }
    case 'QUANTITY': {
      break
    }
    case 'DATE': {
      formattedLabel = formatEpochDate(d, col, config)
      break
    }
    case 'DATE_STRING': {
      formattedLabel = formatStringDate(d, config)
      break
    }
    // case 'DATE_MONTH': {
    //   // This will be a string of the month number ie. "2", "12"
    //   const monthNumber = Number(d)
    //   if (monthNumber && MONTH_NAMES[monthNumber]) {
    //     formattedLabel = MONTH_NAMES[monthNumber]
    //   }
    //   break
    // }
    // case 'DATE_YEAR': {
    //   // This should always be a string of the year number ie. "2019"
    //   formattedLabel = Number(d)
    //   break
    // }
    case 'PERCENT': {
      if (Number(d)) {
        formattedLabel = Numbro(d).format('0%')
      }
      break
    }
    default: {
      break
    }
  }

  const fullWidthLabel = formattedLabel
  let isTruncated = false
  if (typeof formattedLabel === 'string' && formattedLabel.length > 50) {
    formattedLabel = `${formattedLabel.substring(0, 43)}...`
    isTruncated = true
  }

  return { fullWidthLabel, formattedLabel, isTruncated }
}

export const formatElement = ({
  element,
  column,
  config = {},
  htmlElement
}) => {
  try {
    let formattedElement = element
    const {
      currencyCode,
      languageCode,
      currencyDecimals,
      quantityDecimals
    } = config

    if (column) {
      switch (column.type) {
        case 'STRING': {
          // do nothing
          break
        }
        case 'DOLLAR_AMT': {
          // We will need to grab the actual currency symbol here. Will that be returned in the query response?
          if (Number(element) || Number(element) === 0) {
            const currency = currencyCode || 'USD'
            const validatedCurrencyDecimals =
              currencyDecimals || currencyDecimals === 0
                ? currencyDecimals
                : undefined

            try {
              formattedElement = new Intl.NumberFormat(languageCode, {
                style: 'currency',
                currency: `${currency}`,
                minimumFractionDigits: validatedCurrencyDecimals,
                maximumFractionDigits: validatedCurrencyDecimals
              }).format(element)
            } catch (error) {
              console.error(error)
              formattedElement = new Intl.NumberFormat(languageCode, {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: validatedCurrencyDecimals,
                maximumFractionDigits: validatedCurrencyDecimals
              }).format(element)
            }
          }
          break
        }
        case 'QUANTITY': {
          const validatedQuantityDecimals =
            quantityDecimals || quantityDecimals === 0 ? quantityDecimals : 1

          if (Number(element) && Number(element) % 1 !== 0) {
            formattedElement = Numbro(element).format({
              thousandSeparated: true,
              mantissa: validatedQuantityDecimals
            })
          }
          break
        }
        case 'DATE': {
          formattedElement = formatEpochDate(element, column, config)
          break
        }
        case 'DATE_STRING': {
          formattedElement = formatStringDate(element, config)
          break
        }
        // case 'DATE_MONTH': {
        //   // This will be a string of the month number ie. "2", "12"
        //   const monthNumber = Number(element)
        //   if (monthNumber && MONTH_NAMES[monthNumber]) {
        //     formattedElement = MONTH_NAMES[monthNumber]
        //   }
        //   break
        // }
        case 'RATIO': {
          if (Number(element)) {
            formattedElement = Numbro(element).format('0.0000')
          }
          break
        }
        // This is for QBO demo ratios. Not sure why it isn't RATIO
        // case 'NUMBER': {
        //   if (Number(element)) {
        //     formattedElement = Numbro(element).format('0.0000')
        //   }
        //   break
        // }
        case 'PERCENT': {
          if (Number(element)) {
            formattedElement = Numbro(element).format('0.00%')

            if (htmlElement) {
              htmlElement.classList.add(
                `comparison-value-${element < 0 ? 'negative' : 'positive'}`
              )
            }
          }
          break
        }
        default: {
          break
        }
      }
    }
    return formattedElement
  } catch (error) {
    console.error(error)
    // If something goes wrong, just display original value
    return element
  }
}

/**
 * converts an svg string to base64 png using the domUrl
 * @param {string} svgElement the svgElement
 * @param {number} [margin=0] the width of the border - the image size will be height+margin by width+margin
 * @param {string} [fill] optionally backgrund canvas fill
 * @return {Promise} a promise to the bas64 png image
 */
export const svgToPng = (svgElement, margin = 0, fill) => {
  return new Promise(function (resolve, reject) {
    try {
      const domUrl = window.URL || window.webkitURL || window
      if (!domUrl) {
        throw new Error('(browser doesnt support this)')
      } else if (!svgElement) {
        throw new Error('(svg element does not exist)')
      }

      // get svg data
      var xml = new XMLSerializer().serializeToString(svgElement)
      // make it base64
      var svg64 = btoa(xml)
      var b64Start = 'data:image/svg+xml;base64,'
      // prepend a "header"
      var image64 = b64Start + svg64

      const bbox = svgElement.getBoundingClientRect()
      const width = bbox.width * 2
      const height = bbox.height * 2

      // create a canvas element to pass through
      var canvas = document.createElement('canvas')
      canvas.width = width + margin
      canvas.height = height + margin

      var ctx = canvas.getContext('2d')
      // ctx.imageSmoothingEnabled = true

      // create a new image to hold it the converted type
      var img = new Image()

      // when the image is loaded we can get it as base64 url
      img.onload = function () {
        // draw it to the canvas
        ctx.drawImage(this, margin, margin, width, height)

        // if it needs some styling, we need a new canvas
        if (fill) {
          var styled = document.createElement('canvas')
          styled.width = canvas.width
          styled.height = canvas.height
          var styledCtx = styled.getContext('2d')
          styledCtx.save()
          styledCtx.fillStyle = fill
          styledCtx.fillRect(0, 0, canvas.width, canvas.height)
          styledCtx.strokeRect(0, 0, canvas.width, canvas.height)
          styledCtx.restore()
          styledCtx.drawImage(canvas, 0, 0)
          canvas = styled
        }
        resolve(canvas.toDataURL('image/png', 1))
      }
      img.onerror = function (error) {
        reject('failed to load image with that url' + url)
      }

      // load image
      img.src = image64
    } catch (error) {
      console.error(error)
      reject('failed to convert svg to png ' + error)
    }
  })
}

export const getColumnTypeAmounts = columns => {
  let amountOfStringColumns = 0
  let amountOfNumberColumns = 0

  columns.forEach(col => {
    if (isColumnNumberType(col)) {
      amountOfNumberColumns += 1
    } else if (isColumnStringType(col)) {
      amountOfStringColumns += 1
    }
  })

  return { amountOfNumberColumns, amountOfStringColumns }
}

export const getNumberOfGroupables = columns => {
  let numberOfGroupables = 0
  if (columns) {
    columns.forEach(col => {
      if (col.groupable) {
        numberOfGroupables += 1
      }
    })
  }
  return numberOfGroupables
}

export const getGroupableColumns = columns => {
  const groupableColumns = []
  if (columns) {
    columns.forEach((col, index) => {
      if (col.groupable) {
        groupableColumns.push(index)
      }
    })
  }
  return groupableColumns
}

export const isChartType = type => CHART_TYPES.includes(type)
export const isTableType = type => TABLE_TYPES.includes(type)
export const isForecastType = type => FORECAST_TYPES.includes(type)

export const supportsRegularPivotTable = columns => {
  const hasTwoGroupables = getNumberOfGroupables(columns) === 2
  return hasTwoGroupables && columns.length === 3
}

export const supports2DCharts = columns => {
  const { amountOfNumberColumns, amountOfStringColumns } = getColumnTypeAmounts(
    columns
  )

  return amountOfNumberColumns > 0 && amountOfStringColumns > 0
}

export const getSupportedDisplayTypes = response => {
  try {
    if (!_get(response, 'data.data.display_type')) {
      return []
    }

    // For CaaS there should be 3 types: data, suggestion, help
    const displayType = response.data.data.display_type

    if (displayType === 'suggestion' || displayType === 'help') {
      return [displayType]
    }

    const columns = _get(response, 'data.data.columns')
    const rows = _get(response, 'data.data.rows', [])

    if (!columns || rows.length <= 1) {
      return []
    }

    if (supportsRegularPivotTable(columns)) {
      // The only case where 3D charts are supported (ie. heatmap, bubble, etc.)
      let supportedDisplayTypes = ['table']
      if (rows.length < 1000) {
        supportedDisplayTypes = [
          'pivot_table',
          'stacked_bar',
          'stacked_column',
          'bubble',
          'heatmap',
          'table'
        ]
      }
      return supportedDisplayTypes
    } else if (supports2DCharts(columns)) {
      // If there is at least one string column and one number
      // column, we should be able to chart anything
      const supportedDisplayTypes = ['table', 'bar', 'column', 'line']

      // if (rows.length < 11) {
      supportedDisplayTypes.push('pie')
      // }

      // create pivot based on month and year
      const dateColumn = columns.find(
        col => col.type === 'DATE' || col.type === 'DATE_STRING'
      )

      if (
        dateColumn &&
        dateColumn.display_name.toLowerCase().includes('month') &&
        columns.length === 2
      ) {
        supportedDisplayTypes.push('pivot_table')
      }

      return supportedDisplayTypes
    }

    // We should always be able to display the table type by default
    return ['table']
  } catch (error) {
    console.error(error)
    return ['table']
  }
}

export const isDisplayTypeValid = (response, displayType) => {
  const supportedDisplayTypes = getSupportedDisplayTypes(response)
  const isValid = supportedDisplayTypes.includes(displayType)
  if (!isValid) {
    console.warn(
      'Warning: provided display type is not valid for this response data'
    )
  }
  return isValid
}

export const getDefaultDisplayType = response => {
  const supportedDisplayTypes = getSupportedDisplayTypes(response)
  const responseDisplayType = _get(response, 'data.data.display_type')

  // If the display type is a recognized non-chart or non-table type
  if (responseDisplayType === 'suggestion' || responseDisplayType === 'help') {
    return responseDisplayType
  }

  // We want to default on pivot table if it is one of the supported types
  if (supportedDisplayTypes.includes('pivot_table')) {
    return 'pivot_table'
  }

  // If there is no display type in the response, default to regular table
  if (!responseDisplayType || responseDisplayType === 'data') {
    return 'table'
  }

  // ----------------- This probably won't happen anymore with CaaS ---------------
  // If the display type is a recognized table type
  if (isTableType(responseDisplayType)) {
    return 'table'
  }

  // If the display type is a recognized chart type
  // This probably won't happen with chata.io, it is
  // usually returned as a table type initially
  if (isChartType(responseDisplayType)) {
    return responseDisplayType
  }
  // ------------------------------------------------------------------------------

  // Default to table type
  return 'table'
}

export const getGroupBysFromPivotTable = (
  cell,
  tableColumns,
  pivotTableColumns,
  originalColumnData
) => {
  let groupByName1
  let groupByValue1
  let groupByName2
  let groupByValue2
  try {
    if (tableColumns[0].type === 'DATE') {
      const year = Number(pivotTableColumns[cell.getField()].name)
      const month = cell.getData()[0]
      groupByName1 = tableColumns[0].name
      groupByValue1 = `${originalColumnData[year][month]}`
    } else {
      groupByName1 = tableColumns[0].name
      groupByValue1 = cell.getData()[0]

      groupByName2 = tableColumns[1].name
      groupByValue2 = pivotTableColumns[cell.getField()].name
    }

    if (groupByName2) {
      return [
        {
          name: groupByName1,
          value: groupByValue1
        }
      ]
    }

    return [
      {
        name: groupByName1,
        value: groupByValue1
      },
      {
        name: groupByName2,
        value: groupByValue2
      }
    ]
  } catch (error) {
    console.error(error)
    return undefined
  }
}

export const nameValueObject = (name, value) => {
  return {
    name,
    value
  }
}

export const getGroupBysFromTable = (row, tableColumns) => {
  const groupableColumns = getGroupableColumns(tableColumns)
  const numGroupables = groupableColumns.length
  if (!numGroupables) {
    return undefined
  }

  const rowData = row.getData()

  const groupByArray = []
  groupableColumns.forEach(colIndex => {
    const groupByName = tableColumns[colIndex].name
    const groupByValue = rowData[colIndex]
    groupByArray.push(nameValueObject(groupByName, groupByValue))
  })

  return groupByArray
}

export const getgroupByObjectFromTable = (
  rowData,
  origColumns,
  forceDateAxis
) => {
  const jsonData = {}
  let columns = [...origColumns]

  if (!columns[0]) {
    return
  }

  if (forceDateAxis) {
    // Swap first two columns if second one is DATE and first is not
    // rowData is already swapped here if necessary so don't swap again.
    if (
      columns[1] &&
      (columns[0].type !== 'DATE' && columns[1].type === 'DATE')
    ) {
      columns = [columns[1], columns[0], ...columns.slice(2)]
    }
  }

  columns.forEach((column, index) => {
    if (column.groupable) {
      const columnName = column.name
      if (column.type === 'DATE') {
        jsonData[columnName] = `${rowData[index]}`
      } else {
        jsonData[columnName.toLowerCase()] = `${rowData[index]}`
      }
    }
  })
  return jsonData
}

export const getObjSize = obj => Object.keys(obj).length

export const getMaxValueFromKeyValueObj = obj => {
  const size = getObjSize(obj)

  let maxValue = 0
  if (size === 1) {
    maxValue = obj[Object.keys(obj)[0]]
  } else if (size > 1) {
    maxValue = Math.max(...Object.values(obj))
  }
  return maxValue
}

export const getMinValueFromKeyValueObj = obj => {
  const size = getObjSize(obj)

  let minValue = 0
  if (size === 1) {
    minValue = obj[Object.keys(obj)[0]]
  } else if (size > 1) {
    minValue = Math.min(...Object.values(obj))
  }
  return minValue
}

export const calculateMinAndMaxSums = (data, labelValue, dataValue) => {
  const positiveSumsObject = {}
  const negativeSumsObject = {}

  // Loop through data array to get maximum and minimum sums of postive and negative values
  // These will be used to get the max and min values for the x Scale (data values)
  for (let i = 0; i < data.length; i++) {
    const value = data[i][dataValue]

    if (value >= 0) {
      // Calculate positive sum
      if (positiveSumsObject[data[i][labelValue]]) {
        positiveSumsObject[data[i][labelValue]] += value
      } else {
        positiveSumsObject[data[i][labelValue]] = value
      }
    } else if (value < 0) {
      // Calculate negative sum
      if (negativeSumsObject[data[i][labelValue]]) {
        negativeSumsObject[data[i][labelValue]] -= value
      } else {
        negativeSumsObject[data[i][labelValue]] = value
      }
    }
  }

  // Get max and min sums from those sum objects
  const maxValue = getMaxValueFromKeyValueObj(positiveSumsObject)
  const minValue = getMinValueFromKeyValueObj(negativeSumsObject)

  return {
    max: maxValue,
    min: minValue
  }
}

export const changeTooltipText = (id, text, tooltipShiftDistance, duration) => {
  const tooltip = document.getElementById(id)
  const prevText = tooltip.innerHTML

  tooltip.innerHTML = text
  if (tooltipShiftDistance) {
    tooltip.style.left = `${Number(
      tooltip.style.left.substring(0, tooltip.style.left.length - 2)
    ) + tooltipShiftDistance}px`
  }

  if (duration) {
    setTimeout(() => {
      tooltip.innerHTML = prevText
      if (tooltipShiftDistance) {
        tooltip.style.left = `${Number(
          tooltip.style.left.substring(0, tooltip.style.left.length - 2)
        ) - tooltipShiftDistance}px`
      }
    }, duration)
  }
}

export const getChartLabelTextWidthInPx = text => {
  try {
    const tempDiv = document.createElement('DIV')
    tempDiv.innerHTML = text
    tempDiv.style.display = 'inline-block'
    tempDiv.style.position = 'absolute'
    tempDiv.style.visibility = 'hidden'
    tempDiv.style.fontSize = '11px'
    document.body.appendChild(tempDiv)
    const textWidth = tempDiv.clientWidth
    document.body.removeChild(tempDiv)

    return textWidth
  } catch (error) {
    console.error(error)
    return 0
  }
}

export const getLongestLabelInPx = (labels, col, config) => {
  let max = getChartLabelTextWidthInPx(labels[0])
  labels.forEach(label => {
    const formattedLabel = formatChartLabel({ d: label, col, config })
      .formattedLabel
    const newLabelWidth = getChartLabelTextWidthInPx(formattedLabel)

    if (newLabelWidth > max) {
      max = newLabelWidth
    }
  })

  return max
}

export const shouldRotateLabels = (tickWidth, labels, col, config) => {
  const labelWidth = getLongestLabelInPx(labels, col, config)
  return tickWidth < labelWidth
}

export const getTickWidth = (scale, innerPadding) => {
  try {
    const width = scale.bandwidth() + innerPadding * scale.bandwidth() * 2
    return width
  } catch (error) {
    console.error(error)
    return 0
  }
}

export const setStyleVars = ({ themeStyles, prefix }) => {
  for (let property in themeStyles) {
    document.documentElement.style.setProperty(
      `${prefix}${property}`,
      themeStyles[property]
    )
  }
}

export const getQueryParams = url => {
  try {
    let queryParams = {}
    // create an anchor tag to use the property called search
    let anchor = document.createElement('a')
    // assigning url to href of anchor tag
    anchor.href = url
    // search property returns the query string of url
    let queryStrings = anchor.search.substring(1)
    let params = queryStrings.split('&')

    for (var i = 0; i < params.length; i++) {
      var pair = params[i].split('=')
      queryParams[pair[0]] = decodeURIComponent(pair[1])
    }
    return queryParams
  } catch (error) {
    return undefined
  }
}

export const getNumberColumnIndices = columns => {
  const dollarAmtIndices = []
  const quantityIndices = []
  const ratioIndices = []

  columns.forEach((col, index) => {
    const { type } = col
    if (type === 'DOLLAR_AMT') {
      dollarAmtIndices.push(index)
    } else if (type === 'QUANTITY') {
      quantityIndices.push(index)
    } else if (type === 'PERCENT' || type === 'RATIO') {
      ratioIndices.push(index)
    }
  })

  // Returning highest priority of non-empty arrays
  if (dollarAmtIndices.length) {
    return dollarAmtIndices
  }

  if (quantityIndices.length) {
    return quantityIndices
  }

  if (ratioIndices.length) {
    return ratioIndices
  }

  return []
}

export const filterDataForDrilldown = (response, drilldownData) => {
  const drilldownDataObject = drilldownData[0]
  const clickedColumnIndex = _get(response, 'data.data.columns', []).findIndex(
    col => col.name === drilldownDataObject.name
  )

  const filteredRows = _get(response, 'data.data.rows', []).filter(
    row => row[clickedColumnIndex] === drilldownDataObject.value
  )

  const newResponseData = {
    ...response,
    data: {
      ...response.data,
      data: {
        ...response.data.data,
        rows: filteredRows
      }
    }
  }

  return newResponseData
}
