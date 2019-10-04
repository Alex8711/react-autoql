import React, { Component, Fragment } from 'react'
import {
  ChatDrawer,
  ResponseRenderer,
  ChatBar,
  Dashboard,
  executeDashboard
} from '@chata-ai/core'
import uuid from 'uuid'

import { Radio, Input, InputNumber, Switch, Button, Menu } from 'antd'

import 'antd/dist/antd.css'
import './index.css'

export default class App extends Component {
  state = {
    currentPage: 'drawer',
    componentKey: uuid.v4(),
    isVisible: false,
    placement: 'right',
    showHandle: true,
    theme: 'light',
    response: null,
    showMask: true,
    shiftScreen: false,
    customerName: 'Nikki',
    introMessage: undefined,
    enableAutocomplete: true,
    enableSafetyNet: true,
    enableVoiceRecord: true,
    clearOnClose: false,
    height: 500,
    width: 500,
    title: 'Chat with your data',
    lightAccentColor: '#28a8e0',
    darkAccentColor: '#525252',
    maxMessages: 6,
    isEditing: false,
    demo: true,
    debug: true,
    apiKey: '',
    customerId: '',
    domain: '',
    userId: '',
    currencyCode: 'USD',
    languageCode: 'en-US',
    fontFamily: 'sans-serif',
    runDashboardAutomatically: false,
    dashboardTiles: [
      {
        key: '0',
        i: '0',
        w: 3,
        h: 2,
        x: 0,
        y: 0,
        query: 'total profit this month',
        title: 'Profit - Current Month'
      },
      {
        key: '1',
        i: '1',
        w: 3,
        h: 2,
        x: 3,
        y: 0,
        query: 'total profit last month',
        title: 'Profit - Previous Month'
      },
      {
        key: '2',
        i: '2',
        w: 3,
        h: 2,
        x: 6,
        y: 0,
        query: 'total profit ytd',
        title: 'Profit - YTD'
      },
      {
        key: '3',
        i: '3',
        w: 3,
        h: 2,
        x: 9,
        y: 0,
        query: 'last years profit',
        title: 'Profit - Previous Year'
      },
      {
        key: '4',
        i: '4',
        w: 6,
        h: 5,
        x: 0,
        y: 2,
        query: 'profit by month ytd',
        displayType: 'line',
        title: 'Monthly YTD Profit'
      },
      {
        key: '5',
        i: '5',
        w: 6,
        h: 5,
        x: 6,
        y: 2,
        query: 'profit by month last year',
        displayType: 'line',
        title: '2018 Monthly Profit'
      },
      {
        key: '6',
        i: '6',
        w: 6,
        h: 5,
        x: 0,
        y: 7,
        query: 'profit by class this year',
        displayType: 'column',
        title: 'Total Profit by Class (2019)'
      },
      {
        key: '7',
        i: '7',
        w: 6,
        h: 5,
        x: 6,
        y: 7,
        query: 'profit by customer this year',
        displayType: 'bar',
        title: 'Total Profit by Customer (2019)'
      },
      {
        key: '8',
        i: '8',
        w: 12,
        h: 5,
        x: 0,
        y: 10,
        query: 'total profit by class by month ytd',
        displayType: 'stacked_column',
        title: 'Product Profitability'
      },
      {
        key: '9',
        i: '9',
        w: 12,
        h: 8,
        x: 0,
        y: 12,
        query: 'total profit by customer by month ytd',
        displayType: 'stacked_bar',
        title: 'Customer Profitability'
      },
      {
        key: '10',
        i: '10',
        w: 12,
        h: 5,
        x: 0,
        y: 19,
        query: 'total profit by customer by month ytd',
        displayType: 'heatmap',
        title: 'Customer Profitability'
      }
    ]
  }

  createRadioInputGroup = (title, propName, propValues = []) => {
    return (
      <div>
        <h4>{title}</h4>
        <Radio.Group
          defaultValue={this.state[propName]}
          onChange={e => this.setState({ [propName]: e.target.value })}
          buttonStyle="solid"
        >
          {propValues.map(propValue => {
            return (
              <Radio.Button value={propValue} key={`${propName}-${propValue}`}>
                {propValue.toString()}
              </Radio.Button>
            )
          })}
        </Radio.Group>
      </div>
    )
  }

  createBooleanRadioGroup = (title, propName, propValues = []) => {
    return (
      <div>
        <h4>{title}</h4>
        <Switch
          defaultChecked={this.state[propName]}
          checked={this.state[propName] === true}
          onChange={e => this.setState({ [propName]: e })}
        />
      </div>
    )
  }

  renderChatBarAndResponse = () => {
    return (
      <div>
        <ChatBar
          ref={r => (this.chatBarRef = r)}
          autoCompletePlacement="bottom"
          onSubmit={() => this.setState({ response: null })}
          onResponseCallback={response => {
            this.setState({ response })
          }}
          showChataIcon
          showLoadingDots
        />
        {this.state.response ? (
          <div
            style={{
              height: '300px',
              padding: '30px',
              fontFamily: 'Helvetica, Arial, Sans-Serif', // Text, tables, and charts will inherit font
              color: '#565656' // Text, tables, and charts will inherit text color
            }}
          >
            <ResponseRenderer
              chatBarRef={this.chatBarRef}
              response={this.state.response}
            />
          </div>
        ) : (
          <div
            style={{
              height: '75px',
              width: 'calc(100% - 60px)',
              padding: '30px',
              fontFamily: 'Helvetica, Arial, Sans-Serif',
              color: '#999',
              textAlign: 'center',
              fontSize: '14px'
            }}
          >
            <em>The response will go here</em>
          </div>
        )}
      </div>
    )
  }

  renderPropOptions = () => {
    return (
      <div>
        <h1>Data Source</h1>
        {this.createBooleanRadioGroup('Demo Data', 'demo', [true, false])}
        {!this.state.demo && (
          <Fragment>
            <h4>API key</h4>
            <Input
              onChange={e => {
                this.setState({ apiKey: e.target.value })
              }}
              value={this.state.apiKey}
            />
            <h4>Customer ID</h4>
            <Input
              onChange={e => {
                this.setState({ customerId: e.target.value })
              }}
              value={this.state.customerId}
            />
            <h4>User ID (email)</h4>
            <Input
              onChange={e => {
                this.setState({ userId: e.target.value })
              }}
              value={this.state.userId}
            />
            <h4>Domain URL</h4>
            <Input
              onChange={e => {
                this.setState({ domain: e.target.value })
              }}
              value={this.state.domain}
            />
          </Fragment>
        )}
        <h1>Drawer Props</h1>
        <Button
          onClick={() => this.setState({ componentKey: uuid.v4() })}
          style={{ marginRight: '10px' }}
          icon="reload"
        >
          Reload Drawer
        </Button>
        <Button
          onClick={() => this.setState({ isVisible: true })}
          type="primary"
          icon="menu-unfold"
        >
          Open Drawer
        </Button>
        {this.createBooleanRadioGroup('Show Drawer Handle', 'showHandle', [
          true,
          false
        ])}
        {this.createBooleanRadioGroup('Show Mask', 'showMask', [true, false])}
        {this.createBooleanRadioGroup(
          'Shift Screen on Open/Close',
          'shiftScreen',
          [true, false]
        )}
        {this.createRadioInputGroup('Theme', 'theme', ['light', 'dark'])}
        {this.createRadioInputGroup('Drawer Placement', 'placement', [
          'top',
          'bottom',
          'left',
          'right'
        ])}
        <h4>Currency Code</h4>
        <Input
          type="text"
          onBlur={e => {
            this.setState({ currencyCode: e.target.value })
          }}
          style={{ width: '55px' }}
          defaultValue={this.state.currencyCode}
        />
        <h4>Language Code</h4>
        <Input
          type="text"
          onBlur={e => {
            this.setState({ languageCode: e.target.value })
          }}
          style={{ width: '55px' }}
          defaultValue={this.state.languageCode}
        />
        <h4>Customer Name</h4>
        <h6>(Must click 'Reload Drawer' to apply this)</h6>
        <Input
          type="text"
          onChange={e => {
            this.setState({ customerName: e.target.value })
          }}
          value={this.state.customerName}
        />
        <h4>Intro Message</h4>
        <h6>(Must click 'Reload Drawer' to apply this)</h6>
        <Input
          type="text"
          onChange={e => {
            this.setState({ introMessage: e.target.value })
          }}
          value={this.state.introMessage}
        />
        {this.createBooleanRadioGroup(
          'Clear All Messages on Close',
          'clearOnClose',
          [true, false]
        )}
        <h4>Height</h4>
        <h5>Only for top/bottom placement</h5>
        <h6>(Must click 'Reload Drawer' to apply this)</h6>
        <InputNumber
          // type="number"
          onChange={e => {
            this.setState({ height: e })
          }}
          value={this.state.height}
        />
        <h4>Width</h4>
        <h5>Only for left/right placement</h5>
        <h6>(Must click 'Reload Drawer' to apply this)</h6>
        <InputNumber
          type="number"
          onChange={e => {
            this.setState({ width: e })
          }}
          value={this.state.width}
        />
        <h4>Title</h4>
        <Input
          type="text"
          onChange={e => {
            this.setState({ title: e.target.value })
          }}
          value={this.state.title}
        />
        <h4>Font Family</h4>
        <h6>(Must click 'Reload Drawer' to apply this)</h6>
        <Input
          type="text"
          onChange={e => {
            this.setState({ fontFamily: e.target.value })
          }}
          value={this.state.fontFamily}
        />
        <h4>Light Theme Accent Color</h4>
        <h5>
          For production version, the user will just choose "accentColor" and it
          <br />
          will be applied to whatever theme. If not provided, the default color
          <br />
          will be used
        </h5>
        <h6>(Must click 'Reload Drawer' to apply this)</h6>
        <Input
          type="color"
          onChange={e => {
            this.setState({ lightAccentColor: e.target.value })
          }}
          value={this.state.lightAccentColor}
        />
        <h4>Dark Theme Accent Color</h4>
        <h6>(Must click 'Reload Drawer' to apply this)</h6>
        <Input
          type="color"
          onChange={e => {
            this.setState({ darkAccentColor: e.target.value })
          }}
          value={this.state.darkAccentColor}
        />
        <h4>Maximum Number of Messages</h4>
        <InputNumber
          type="number"
          onChange={e => {
            this.setState({ maxMessages: e })
          }}
          value={this.state.maxMessages}
        />
        {this.createBooleanRadioGroup(
          'Enable Autocomplete',
          'enableAutocomplete',
          [true, false]
        )}
        {this.createBooleanRadioGroup('Enable Safety Net', 'enableSafetyNet', [
          true,
          false
        ])}
        {this.createBooleanRadioGroup(
          'Enable Speech to Text',
          'enableVoiceRecord',
          [true, false]
        )}
        {this.createBooleanRadioGroup(
          'Debug Mode (Shows SQL in the info tooltip)',
          'debug',
          [true, false]
        )}
      </div>
    )
  }

  renderChatDrawerPage = () => {
    return (
      <div className="test-page-container">
        {
          // this.renderChatBarAndResponse()
        }
        {this.renderPropOptions()}
        <ChatDrawer
          apiKey={this.state.apiKey} // required if demo is false
          customerId={this.state.customerId} // required if demo is false
          userId={this.state.userId} // required if demo is false
          domain={this.state.domain}
          key={this.state.componentKey}
          isVisible={this.state.isVisible}
          onHandleClick={() =>
            this.setState({ isVisible: !this.state.isVisible })
          }
          onMaskClick={() => this.setState({ isVisible: false })}
          showHandle={this.state.showHandle}
          placement={this.state.placement}
          customerName={this.state.customerName}
          introMessage={this.state.introMessage}
          showMask={this.state.showMask}
          shiftScreen={this.state.shiftScreen}
          enableAutocomplete={this.state.enableAutocomplete}
          enableVoiceRecord={this.state.enableVoiceRecord}
          clearOnClose={this.state.clearOnClose}
          width={this.state.width}
          height={this.state.height}
          title={this.state.title}
          enableSafetyNet={this.state.enableSafetyNet}
          theme={this.state.theme}
          accentColor={
            this.state.theme === 'light'
              ? this.state.lightAccentColor
              : this.state.darkAccentColor
          }
          fontFamily={this.state.fontFamily}
          maxMessages={this.state.maxMessages}
          demo={this.state.demo}
          debug={this.state.debug}
          currencyCode={this.state.currencyCode}
          languageCode={this.state.languageCode}
          // handleImage={spiraLogo}
          // inputStyles
          // autocompleteStyles
          // handleStyles={{ right: '25px' }}
        />
      </div>
    )
  }

  renderDashboardPage = () => {
    return (
      <div
        className="dashboard-container"
        style={{ width: '100%', height: 'auto' }}
      >
        <div
          className="dashboard-toolbar-container"
          style={{
            display: 'flex',
            justifyContent: 'center',
            background: '#fafafa',
            padding: '10px'
          }}
        >
          <Button
            onClick={() => this.setState({ isEditing: !this.state.isEditing })}
            icon={this.state.isEditing ? 'stop' : 'edit'}
          >
            {this.state.isEditing ? 'Stop Editing' : 'Edit'}
          </Button>
          <Button
            onClick={() => executeDashboard(this.dashboardRef)}
            icon="play-circle"
            style={{ marginLeft: '10px' }}
          >
            Execute Dashboard
          </Button>
          <Button
            onClick={() => console.log(this.state.dashboardTiles)}
            style={{ marginLeft: '10px' }}
          >
            Log Current Tile State
          </Button>
          <div style={{ paddingTop: '6px', marginLeft: '10px' }}>
            Run Dashboard Automatically&nbsp;&nbsp;
            <Switch
              defaultChecked={this.state.runDashboardAutomatically}
              checked={this.state.runDashboardAutomatically === true}
              onChange={e => {
                if (e) {
                  executeDashboard(this.dashboardRef)
                }
                this.setState({ runDashboardAutomatically: e })
              }}
            />
          </div>
          {this.state.isEditing && (
            <Button
              onClick={() => this.dashboardRef && this.dashboardRef.addTile()}
              type="primary"
              icon="plus"
              style={{ marginLeft: '10px' }}
            >
              Add Tile
            </Button>
          )}
        </div>
        <Dashboard
          ref={ref => (this.dashboardRef = ref)}
          apiKey={this.state.apiKey} // required if demo is false
          customerId={this.state.customerId} // required if demo is false
          userId={this.state.userId} // required if demo is false
          domain={this.state.domain} // required if demo is false
          demo={this.state.demo}
          debug={this.state.debug}
          enableSafetyNet={this.state.enableSafetyNet}
          isEditing={this.state.isEditing}
          currencyCode={this.state.currencyCode}
          languageCode={this.state.languageCode}
          fontFamily={this.state.fontFamily}
          executeOnMount={this.state.runDashboardAutomatically}
          executeOnStopEditing={this.state.runDashboardAutomatically}
          tiles={this.state.dashboardTiles}
          notExecutedText='Hit "Execute" to run this dashboard'
          onChangeCallback={newTiles =>
            this.setState({ dashboardTiles: newTiles })
          }
        />
      </div>
    )
  }

  renderNavMenu = () => {
    return (
      <Menu
        onClick={({ key }) => this.setState({ currentPage: key })}
        selectedKeys={[this.state.currentPage]}
        mode="horizontal"
      >
        <Menu.Item key="drawer">Chat Drawer</Menu.Item>
        <Menu.Item key="dashboard">Dashboard</Menu.Item>
      </Menu>
    )
  }

  render = () => {
    const { currentPage } = this.state

    let pageToRender = null
    switch (currentPage) {
      case 'drawer': {
        pageToRender = this.renderChatDrawerPage()
        break
      }
      case 'dashboard': {
        pageToRender = this.renderDashboardPage()
        break
      }
      default: {
        break
      }
    }

    return (
      <Fragment>
        {this.renderNavMenu()}
        {pageToRender}
      </Fragment>
    )
  }
}
