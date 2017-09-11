/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * HandsonHelper class
 */
export default class HandsonHelper {
  constructor(columns, rows, comment) {
    this.columns = columns || [];
    this.rows = rows || [];
    this.comment = comment || '';
    this._numericValidator = this._numericValidator.bind(this);
  };

  getHandsonTableConfig(columns, columnNames, resultRows, config) {
    var self = this;
    var tableOptionList = config.tableOptionList || [];
    var tableOptions = {};

    tableOptionList.forEach(item => {
      tableOptions[item.name] = item;
    });

    return {
      colHeaders: columnNames,
      data: resultRows,
      rowHeaders: false,
      stretchH: 'all',
      sortIndicator: true,
      columns: columns,
      columnSorting: true,
      contextMenu: false,
      manualColumnResize: true,
      manualRowResize: true,
      readOnly: true,
      readOnlyCellClassName: '',
      fillHandle: false,
      fragmentSelection: true,
      disableVisualSelection: true,
      allowHtml: true,
      cells: function(ro, co, pro) {
        let filedName = columnNames[co];
        let tableOptionsObj = tableOptions[filedName] || {};
        let color = tableOptionsObj.color || '';

        var cellProperties = {};
        var colType = columns[co].type;
        cellProperties.renderer = function(instance, td, row, col, prop, value, cellProperties) {
          if (color) {
            td.style.color = color;
          }
          self._cellRenderer(instance, td, row, col, prop, value, cellProperties, colType);
        };
        return cellProperties;
      },
      colHeaders(index) {
        let filedName = columnNames[index];
        let tableOptionsObj = tableOptions[filedName] || {};
        let title = tableOptionsObj.title || filedName;
        let color = tableOptionsObj.color || '';
        let description = tableOptionsObj.description || '';

        return `
          <span class="columnSorting" style="${color ? 'color:' + color + ';' : ''}" data-toggle="popover">
            <span class="columnSorting">${title}</span>
            <i class="fa fa-info-circle ${!description ? 'hide' : ''}" style="margin-top: 2px; margin-right: 3px; color: #7b7bbd;" aria-hidden="true"></i>
          </span>
        `;
      },
      afterGetColHeader: function(col, TH) {
        var instance = this;
        var menu = self._buildDropDownMenu(columns[col].type);
        var button = self._buildTypeSwitchButton();

        let filedName = columnNames[col];
        let tableOptionsObj = tableOptions[filedName] || {};
        let title = tableOptionsObj.title || filedName;
        let color = tableOptionsObj.color || '';
        let description = tableOptionsObj.description || '';

        self._addButtonMenuEvent(button, menu);

        Handsontable.Dom.addEvent(menu, 'click', function(event) {
          if (event.target.nodeName === 'LI') {
            self._setColumnType(columns, event.target.data.colType, instance, col);
          }
        });
        if (TH.firstChild.lastChild.nodeName === 'BUTTON') {
          TH.firstChild.removeChild(TH.firstChild.lastChild);
        }
     
        TH.firstChild.appendChild(button);
        TH.style['white-space'] = 'normal';

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
          title: title,
          content: description,
          placement: 'bottom'
        };

        $(TH).find('[data-toggle="popover"]').popover(options);

        $(TH).find('[data-toggle="popover"]').on('DOMNodeRemoved', function() {
          $(TH).find('[data-toggle="popover"]').popover('destroy');
        });
      }
    };
  };

  /*
  ** Private Service Functions
  */

  _addButtonMenuEvent(button, menu) {
    Handsontable.Dom.addEvent(button, 'click', function(event) {
      var changeTypeMenu;
      var position;
      var removeMenu;

      document.body.appendChild(menu);

      event.preventDefault();
      event.stopImmediatePropagation();

      changeTypeMenu = document.querySelectorAll('.changeTypeMenu');

      for (var i = 0, len = changeTypeMenu.length; i < len; i++) {
        changeTypeMenu[i].style.display = 'none';
      }
      menu.style.display = 'block';
      position = button.getBoundingClientRect();

      menu.style.top = (position.top + (window.scrollY || window.pageYOffset)) + 2 + 'px';
      menu.style.left = (position.left) + 'px';

      removeMenu = function(event) {
        if (menu.parentNode) {
          menu.parentNode.removeChild(menu);
        }
      };
      Handsontable.Dom.removeEvent(document, 'click', removeMenu);
      Handsontable.Dom.addEvent(document, 'click', removeMenu);
    });
  }

  _buildDropDownMenu(activeCellType) {
    var menu = document.createElement('UL');
    var types = ['text', 'numeric', 'date'];
    var item;

    menu.className = 'changeTypeMenu';

    for (var i = 0, len = types.length; i < len; i++) {
      item = document.createElement('LI');
      if ('innerText' in item) {
        item.innerText = types[i];
      } else {
        item.textContent = types[i];
      }

      item.data = {'colType': types[i]};

      if (activeCellType === types[i]) {
        item.className = 'active';
      }
      menu.appendChild(item);
    }

    return menu;
  }

  _buildTypeSwitchButton() {
    var button = document.createElement('BUTTON');

    button.innerHTML = '\u25BC';
    button.className = 'changeType';

    return button;
  }

  _isNumeric(value) {
    if (!isNaN(value)) {
      if (value.length !== 0) {
        if (Number(value) <= Number.MAX_SAFE_INTEGER && Number(value) >= Number.MIN_SAFE_INTEGER) {
          return true;
        }
      }
    }
    return false;
  }

  _cellRenderer(instance, td, row, col, prop, value, cellProperties, colType) {
    if (colType === 'numeric' && this._isNumeric(value)) {
      cellProperties.format = '0,0.[00000]';
      td.style.textAlign = 'left';
      Handsontable.renderers.NumericRenderer.apply(this, arguments);
    } else if (value.length > '%html'.length && '%html ' === value.substring(0, '%html '.length)) {
      td.innerHTML = value.substring('%html'.length);
    } else {
      Handsontable.renderers.TextRenderer.apply(this, arguments);
    }
  }

  _dateValidator(value, callback) {
    var d = moment(value);
    return callback(d.isValid());
  }

  _numericValidator(value, callback) {
    return callback(this._isNumeric(value));
  }

  _setColumnType(columns, type, instance, col) {
    columns[col].type = type;
    this._setColumnValidator(columns, col);
    instance.updateSettings({columns: columns});
    instance.validateCells(null);
    if (this._isColumnSorted(instance, col)) {
      instance.sort(col, instance.sortOrder);
    }
  }

  _isColumnSorted(instance, col) {
    return instance.sortingEnabled && instance.sortColumn === col;
  }

  _setColumnValidator(columns, col) {
    if (columns[col].type === 'numeric') {
      columns[col].validator = this._numericValidator;
    } else if (columns[col].type === 'date') {
      columns[col].validator = this._dateValidator;
    } else {
      columns[col].validator = null;
    }
  }
}