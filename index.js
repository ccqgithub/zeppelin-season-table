import Visualization from 'zeppelin-vis'
import PassthroughTransformation from 'zeppelin-tabledata/passthrough'
import HandsonHelper from './helper'

const SETTING_TEMPLATE = require('raw-loader!./visualization-table-setting.html')

const TABLE_OPTIONS = {
  name: 'Table Options',
  value: JSON.stringify({
    columnNames: {
      age: '年龄',
      count: '数量'
    },
    columnNameTips: {
      age: '年龄',
      count: '数量'
    }
  }, null, 2),
  description: 'Table Options'
}

/**
 * Visualize data in table format
 */
export default class TableVisualization extends Visualization {
  constructor (targetEl, config) {
    super(targetEl, config);
    const self = this;
    console.log('Init season table');
    targetEl.addClass('table');
    this.passthrough = new PassthroughTransformation(config);

    config.tableOptions = config.tableOptions || TABLE_OPTIONS;
  }

  // refresh() {
  //   const gridElemId = this.getGridElemId()
  //   const gridElem = angular.element(`#${gridElemId}`)

  //   if (gridElem) {
  //     gridElem.css('height', this.targetEl.height() - 10)
  //   }
  // }

  render (tableData) {
    var height = this.targetEl.height();
    var container = this.targetEl.css('height', height).get(0);
    var resultRows = tableData.rows;
    var columnNames = _.pluck(tableData.columns, 'name');
    var columns = Array.apply(null, Array(tableData.columns.length)).map(function() {
      return {type: 'text'};
    });

    if (this.hot) {
      this.hot.destroy();
    }

    var handsonHelper = new HandsonHelper();
    this.hot = new Handsontable(container, handsonHelper.getHandsonTableConfig(
      columns, columnNames, resultRows, this.config));
    this.hot.validateCells(null);
  }

  destroy () {
  }

  getTransformation () {
    return this.passthrough
  }

  // getScope() {
  //   const scope = this.targetEl.scope()
  //   return scope
  // }

  // persistConfigImmediatelyWithGridState(config) {
  //   this.persistConfigWithGridState(config)
  // }

  // persistConfigWithGridState(config) {
  //   if (this.isRestoring) { return }

  //   const gridApi = this.getGridApi()
  //   config.tableGridState = gridApi.saveState.save()
  //   this.emitConfig(config)
  // }

  // persistConfig(config) {
  //   this.emitConfig(config)
  // }

  getSetting (chart) {
    const self = this // for closure in scope
    const configObj = self.config

    configObj.setTableOptions = function() {
      console.log('setTableOptions')
      self.emitConfig(configObj);
    }

    return {
      template: SETTING_TEMPLATE,
      scope: {
        config: configObj,
      }
    }
  }
}
