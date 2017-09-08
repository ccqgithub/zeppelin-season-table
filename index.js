import Visualization from 'zeppelin-vis'
import PassthroughTransformation from 'zeppelin-tabledata/passthrough'
import HandsonHelper from './helper'

const SETTING_TEMPLATE = require('raw-loader!./visualization-table-setting.html')

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

    config.tableOptionList = config.tableOptionList || [];
  }

  // refresh() {
  //   const gridElemId = this.getGridElemId()
  //   const gridElem = angular.element(`#${gridElemId}`)

  //   if (gridElem) {
  //     gridElem.css('height', this.targetEl.height() - 10)
  //   }
  // }

  render (tableData) {
    var config = this.config;
    var height = this.targetEl.height();
    var resultRows = tableData.rows;
    var columnNames = _.pluck(tableData.columns, 'name');
    var columns = Array.apply(null, Array(tableData.columns.length)).map(function() {
      return {type: 'text'};
    });

    if (this.hot) {
      this.hot.destroy();
    }

    var $descriptionDiv = $(`
      <div style="height: 30px;">
        <span class="label label-default" data-toggle="popover">
          About this table 
          <i class="fa fa-info-circle" style="margin-left: 3px;"></i>
        </span>
      </div>
    `);

    var $tableDiv = $(`
      <div class="table"></div>
    `);

    this.targetEl.html('');
    if (config.tableDescription) {
      height = height - 30;
      this.targetEl.append($descriptionDiv);
      let options = {
        container: 'body',
        template: `
          <div class="popover" role="tooltip">
            <div class="arrow"></div>
            <h3 class="popover-title"></h3>
            <div class="popover-content" style="white-space: pre-wrap;"></div>
          </div>
        `,
        trigger: 'hover',
        title: 'Table description',
        content: config.tableDescription,
        placement: 'right'
      };
  
      $descriptionDiv.find('[data-toggle="popover"]').popover(options);
    }
    $tableDiv.css('height', height);
    this.targetEl.append($tableDiv);

    var container = $tableDiv.get(0);
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
    const configObj = self.config;

    if (!configObj.tabeleDescription) {
      configObj.tabeleDescription = '';
    }

    configObj.setTableDescription = function() {
      self.emitConfig(self.config);
    }

    configObj.addTableOptionList = function() {
      console.log('addTableOptionList')
      
      if (!self.config.tableOptionList) {
        self.config.tableOptionList = [];
      }
      self.config.tableOptionList.push({
        name: 'fieldName',
        title: 'Field Name',
        descriotion: 'Field Description',
        color: ''
      });

      self.emitConfig(self.config);
    }

    configObj.delTableOptionList = function(item) {
      console.log('delTableOptionList')

      let index = self.config.tableOptionList.indexOf(item);
      
      if (index != -1) {
        self.config.tableOptionList.splice(index, 1);
      }

      self.emitConfig(self.config);
    }

    configObj.setTableOptionList = function() {
      console.log('setTableOptionList')
      self.emitConfig(self.config);
    }

    return {
      template: SETTING_TEMPLATE,
      scope: {
        config: configObj,
      }
    }
  }
}
