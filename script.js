/* ============================================
   SQL BUILDER - Enhanced JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {

    // ============================================
    // DDL / DML TAB SWITCHING
    // ============================================
    const sidebarTabs = document.querySelectorAll('.sidebar-tab');
    const ddlQueries = document.getElementById('ddl-queries');
    const dmlQueries = document.getElementById('dml-queries');

    sidebarTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            sidebarTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            if (this.dataset.tab === 'ddl') {
                ddlQueries.style.display = 'block';
                dmlQueries.style.display = 'none';
                // Activate first DDL item if none active
                const activeDdl = ddlQueries.querySelector('.query-type.active');
                if (activeDdl) {
                    activeDdl.click();
                } else {
                    const firstDdl = ddlQueries.querySelector('.query-type');
                    if (firstDdl) firstDdl.click();
                }
            } else {
                ddlQueries.style.display = 'none';
                dmlQueries.style.display = 'block';
                // Activate first DML item
                const firstDml = dmlQueries.querySelector('.query-type');
                if (firstDml) firstDml.click();
            }
        });
    });

    // ============================================
    // QUERY TYPE SWITCHING
    // ============================================
    const queryTypes = document.querySelectorAll('.query-type');
    const queryBuilders = document.querySelectorAll('.query-builder');

    queryTypes.forEach(type => {
        type.addEventListener('click', function() {
            const targetType = this.dataset.type;

            // Update active state in current visible list only
            const parentList = this.closest('.query-types');
            parentList.querySelectorAll('.query-type').forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            // Show/hide query builders
            queryBuilders.forEach(builder => {
                builder.style.display = 'none';
                builder.classList.remove('active');
                if (builder.id === targetType + '-query') {
                    builder.style.display = 'block';
                    builder.classList.add('active');
                }
            });

            // Hide SQL preview
            document.getElementById('sql-preview-section').style.display = 'none';
        });
    });

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================
    function showToast(message, type = 'success') {
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'toast ' + type;
        toast.innerHTML = '<i class="fas ' + (type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle') + '"></i> ' + message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    }

    function showSqlPreview(sql) {
        const preview = document.getElementById('sql-preview');
        const section = document.getElementById('sql-preview-section');

        // Syntax highlighting
        let highlighted = sql
            .replace(/\b(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|FROM|WHERE|SET|VALUES|INTO|TABLE|VIEW|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AND|OR|NOT|NULL|PRIMARY|KEY|AUTO_INCREMENT|DEFAULT|UNIQUE|INDEX|FOREIGN|REFERENCES|AS|ORDER|BY|GROUP|HAVING|LIMIT|OFFSET|ASC|DESC|LIKE|IN|BETWEEN|EXISTS|UNION|ALL|DISTINCT|COUNT|SUM|AVG|MIN|MAX|IF|CASE|WHEN|THEN|ELSE|END|CAST|CONVERT|CONCAT|SUBSTRING|UPPER|LOWER|TRIM|LENGTH|ROUND|NOW|CURDATE|CURTIME|DATE_FORMAT|ADD|COLUMN|MODIFY|CHANGE|RENAME|TO|IF EXISTS|IF NOT EXISTS|ENGINE|CHARSET|COLLATE|OR REPLACE)\b/gi, '<span class="keyword">$1</span>')
            .replace(/\b(COUNT|SUM|AVG|MIN|MAX|CONCAT|SUBSTRING|UPPER|LOWER|TRIM|LENGTH|ROUND|NOW|CURDATE|CURTIME|DATE_FORMAT|CAST|CONVERT)\b/gi, '<span class="function">$1</span>')
            .replace(/'([^']*)'/g, "<span class='string'>'$1'</span>")
            .replace(/\b(\d+)\b/g, '<span class="number">$1</span>')
            .replace(/(--.*$)/gm, '<span class="comment">$1</span>');

        preview.innerHTML = highlighted;
        section.style.display = 'block';
        section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // ============================================
    // ADD / REMOVE ROWS - Universal Handler
    // ============================================
    function setupAddRemove(containerId, templateHTML, addBtnId) {
        const container = document.getElementById(containerId);
        const addBtn = document.getElementById(addBtnId);

        if (!container || !addBtn) return;

        addBtn.addEventListener('click', function() {
            const wrapper = document.createElement('div');
            wrapper.innerHTML = templateHTML;
            const row = wrapper.firstElementChild;
            container.appendChild(row);

            row.querySelector('.remove-btn').addEventListener('click', function() {
                row.remove();
            });
        });
    }

    // Initialize all remove buttons
    function initRemoveButtons() {
        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const row = this.closest('.condition-row, .column-row');
                if (row) row.remove();
            });
        });
    }
    initRemoveButtons();

    // ============================================
    // SELECT QUERY BUILDER
    // ============================================
    setupAddRemove('columns-container', `
        <div class="column-row">
            <input class="column-select" placeholder="Enter column's Name">
            <input class="column-alias" placeholder="Alias (optional)" style="flex:1">
            <button class="remove-btn"><i class="fas fa-times"></i></button>
        </div>
    `, 'add-column');

    setupAddRemove('joins-container', `
        <div class="condition-row">
            <select class="join-type">
                <option value="INNER JOIN">INNER JOIN</option>
                <option value="LEFT JOIN">LEFT JOIN</option>
                <option value="RIGHT JOIN">RIGHT JOIN</option>
                <option value="FULL OUTER JOIN">FULL OUTER JOIN</option>
            </select>
            <input class="join-table" placeholder="Table to join">
            <input class="join-on" placeholder="ON condition (e.g., t1.id = t2.id)">
            <button class="remove-btn"><i class="fas fa-times"></i></button>
        </div>
    `, 'add-join');

    setupAddRemove('conditions-container', `
        <div class="condition-row">
            <input class="condition-column" placeholder="Column's Name for Conditions">
            <select class="condition-operator">
                <option value="=">=</option>
                <option value="!=">!=</option>
                <option value="<">&lt;</option>
                <option value=">">&gt;</option>
                <option value="<=">&lt;=</option>
                <option value=">=">&gt;=</option>
                <option value="LIKE">LIKE</option>
                <option value="NOT LIKE">NOT LIKE</option>
                <option value="IN">IN</option>
                <option value="NOT IN">NOT IN</option>
                <option value="IS NULL">IS NULL</option>
                <option value="IS NOT NULL">IS NOT NULL</option>
                <option value="BETWEEN">BETWEEN</option>
            </select>
            <input type="text" class="condition-value" placeholder="Value">
            <button class="remove-btn"><i class="fas fa-times"></i></button>
        </div>
    `, 'add-condition');

    setupAddRemove('groupby-container', `
        <div class="column-row">
            <input class="groupby-column" placeholder="Column name">
            <button class="remove-btn"><i class="fas fa-times"></i></button>
        </div>
    `, 'add-groupby');

    document.getElementById('generate-sql').addEventListener('click', function() {
        const database = document.getElementById('select-database').value.trim();
        const table = document.getElementById('select-table').value.trim();

        if (!database || !table) {
            showToast('Please select a database and table', 'error');
            return;
        }

        // Get columns
        const columns = [];
        document.querySelectorAll('#select-query .column-row').forEach(row => {
            const col = row.querySelector('.column-select')?.value.trim();
            const alias = row.querySelector('.column-alias')?.value.trim();
            if (col) columns.push(alias ? col + ' AS ' + alias : col);
        });

        if (columns.length === 0) columns.push('*');

        // Get joins
        const joins = [];
        document.querySelectorAll('#joins-container .condition-row').forEach(row => {
            const type = row.querySelector('.join-type')?.value;
            const joinTable = row.querySelector('.join-table')?.value.trim();
            const onCondition = row.querySelector('.join-on')?.value.trim();
            if (joinTable && onCondition) joins.push(type + ' ' + joinTable + ' ON ' + onCondition);
        });

        // Get conditions
        const conditions = [];
        document.querySelectorAll('#conditions-container .condition-row').forEach(row => {
            const column = row.querySelector('.condition-column')?.value.trim();
            const operator = row.querySelector('.condition-operator')?.value;
            const value = row.querySelector('.condition-value')?.value.trim();

            if (column) {
                if (operator === 'IS NULL' || operator === 'IS NOT NULL') {
                    conditions.push(column + ' ' + operator);
                } else if (operator === 'IN' || operator === 'NOT IN') {
                    conditions.push(column + ' ' + operator + ' (' + value + ')');
                } else if (operator === 'BETWEEN') {
                    conditions.push(column + ' ' + operator + ' ' + value);
                } else if (value) {
                    const val = isNaN(value) ? "'" + value + "'" : value;
                    conditions.push(column + ' ' + operator + ' ' + val);
                }
            }
        });

        // Get GROUP BY
        const groupByCols = [];
        document.querySelectorAll('#groupby-container .column-row').forEach(row => {
            const col = row.querySelector('.groupby-column')?.value.trim();
            if (col) groupByCols.push(col);
        });
        const having = document.getElementById('having-clause')?.value.trim();

        // Get sorting
        const sortColumn = document.getElementById('sort-column').value.trim();
        const sortDirection = document.getElementById('sort-direction').value;
        const limit = document.getElementById('limit-value')?.value.trim();
        const offset = document.getElementById('offset-value')?.value.trim();
        const distinct = document.getElementById('distinct-check')?.checked;

        // Build SQL
        let sql = 'SELECT ';
        if (distinct) sql += 'DISTINCT ';
        sql += columns.join(', ') + '\nFROM ' + database + '.' + table;

        if (joins.length > 0) sql += '\n' + joins.join('\n');
        if (conditions.length > 0) sql += '\nWHERE ' + conditions.join(' AND ');
        if (groupByCols.length > 0) {
            sql += '\nGROUP BY ' + groupByCols.join(', ');
            if (having) sql += '\nHAVING ' + having;
        }
        if (sortColumn) sql += '\nORDER BY ' + sortColumn + ' ' + sortDirection;
        if (limit) {
            sql += '\nLIMIT ' + limit;
            if (offset) sql += ' OFFSET ' + offset;
        }
        sql += ';';

        showSqlPreview(sql);
    });

    document.getElementById('reset-query').addEventListener('click', function() {
        document.getElementById('select-database').value = '';
        document.getElementById('select-table').value = '';
        document.getElementById('distinct-check').checked = false;
        document.getElementById('columns-container').innerHTML = `
            <div class="column-row">
                <input class="column-select" placeholder="Enter column's Name">
                <input class="column-alias" placeholder="Alias (optional)" style="flex:1">
                <button class="remove-btn"><i class="fas fa-times"></i></button>
            </div>
        `;
        document.getElementById('joins-container').innerHTML = '';
        document.getElementById('conditions-container').innerHTML = `
            <div class="condition-row">
                <input class="condition-column" placeholder="Column's Name for Conditions">
                <select class="condition-operator">
                    <option value="=">=</option>
                    <option value="!=">!=</option>
                    <option value="<">&lt;</option>
                    <option value=">">&gt;</option>
                    <option value="<=">&lt;=</option>
                    <option value=">=">&gt;=</option>
                    <option value="LIKE">LIKE</option>
                    <option value="NOT LIKE">NOT LIKE</option>
                    <option value="IN">IN</option>
                    <option value="NOT IN">NOT IN</option>
                    <option value="IS NULL">IS NULL</option>
                    <option value="IS NOT NULL">IS NOT NULL</option>
                    <option value="BETWEEN">BETWEEN</option>
                </select>
                <input type="text" class="condition-value" placeholder="Value">
                <button class="remove-btn"><i class="fas fa-times"></i></button>
            </div>
        `;
        document.getElementById('groupby-container').innerHTML = '';
        document.getElementById('having-clause').value = '';
        document.getElementById('sort-column').value = '';
        document.getElementById('sort-direction').value = 'ASC';
        document.getElementById('limit-value').value = '';
        document.getElementById('offset-value').value = '';
        document.getElementById('sql-preview-section').style.display = 'none';
        initRemoveButtons();
    });

    // ============================================
    // INSERT QUERY BUILDER
    // ============================================
    setupAddRemove('insert-columns-container', `
        <div class="column-row">
            <input class="insert-column" placeholder="Column name">
            <input class="insert-value" placeholder="Value">
            <button class="remove-btn"><i class="fas fa-times"></i></button>
        </div>
    `, 'add-insert-column');

    document.getElementById('generate-insert-sql').addEventListener('click', function() {
        const database = document.getElementById('insert-database').value.trim();
        const table = document.getElementById('insert-table').value.trim();

        if (!database || !table) {
            showToast('Please select a database and table', 'error');
            return;
        }

        const columns = [];
        const values = [];
        document.querySelectorAll('#insert-columns-container .column-row').forEach(row => {
            const col = row.querySelector('.insert-column')?.value.trim();
            const val = row.querySelector('.insert-value')?.value.trim();
            if (col && val !== '') {
                columns.push(col);
                values.push(isNaN(val) ? "'" + val + "'" : val);
            }
        });

        if (columns.length === 0) {
            showToast('Please add at least one column-value pair', 'error');
            return;
        }

        let sql = 'INSERT INTO ' + database + '.' + table + ' (' + columns.join(', ') + ')\nVALUES (' + values.join(', ') + ');';
        showSqlPreview(sql);
    });

    document.getElementById('reset-insert-query').addEventListener('click', function() {
        document.getElementById('insert-database').value = '';
        document.getElementById('insert-table').value = '';
        document.getElementById('insert-columns-container').innerHTML = `
            <div class="column-row">
                <input class="insert-column" placeholder="Column name">
                <input class="insert-value" placeholder="Value">
                <button class="remove-btn"><i class="fas fa-times"></i></button>
            </div>
        `;
        document.getElementById('sql-preview-section').style.display = 'none';
        initRemoveButtons();
    });

    // ============================================
    // UPDATE QUERY BUILDER
    // ============================================
    setupAddRemove('update-set-container', `
        <div class="column-row">
            <input class="update-column" placeholder="Column name">
            <input class="update-value" placeholder="New value">
            <button class="remove-btn"><i class="fas fa-times"></i></button>
        </div>
    `, 'add-update-set');

    setupAddRemove('update-conditions-container', `
        <div class="condition-row">
            <input class="condition-column" placeholder="Column's Name for Conditions">
            <select class="condition-operator">
                <option value="=">=</option>
                <option value="!=">!=</option>
                <option value="<">&lt;</option>
                <option value=">">&gt;</option>
                <option value="<=">&lt;=</option>
                <option value=">=">&gt;=</option>
                <option value="LIKE">LIKE</option>
            </select>
            <input type="text" class="condition-value" placeholder="Value">
            <button class="remove-btn"><i class="fas fa-times"></i></button>
        </div>
    `, 'add-update-condition');

    document.getElementById('generate-update-sql').addEventListener('click', function() {
        const database = document.getElementById('update-database').value.trim();
        const table = document.getElementById('update-table').value.trim();

        if (!database || !table) {
            showToast('Please select a database and table', 'error');
            return;
        }

        const sets = [];
        document.querySelectorAll('#update-set-container .column-row').forEach(row => {
            const col = row.querySelector('.update-column')?.value.trim();
            const val = row.querySelector('.update-value')?.value.trim();
            if (col && val !== '') {
                sets.push(col + ' = ' + (isNaN(val) ? "'" + val + "'" : val));
            }
        });

        if (sets.length === 0) {
            showToast('Please add at least one SET clause', 'error');
            return;
        }

        const conditions = [];
        document.querySelectorAll('#update-conditions-container .condition-row').forEach(row => {
            const column = row.querySelector('.condition-column')?.value.trim();
            const operator = row.querySelector('.condition-operator')?.value;
            const value = row.querySelector('.condition-value')?.value.trim();
            if (column && value) {
                conditions.push(column + ' ' + operator + ' ' + (isNaN(value) ? "'" + value + "'" : value));
            }
        });

        let sql = 'UPDATE ' + database + '.' + table + '\nSET ' + sets.join(', ');
        if (conditions.length > 0) sql += '\nWHERE ' + conditions.join(' AND ');
        sql += ';';
        showSqlPreview(sql);
    });

    document.getElementById('reset-update-query').addEventListener('click', function() {
        document.getElementById('update-database').value = '';
        document.getElementById('update-table').value = '';
        document.getElementById('update-set-container').innerHTML = `
            <div class="column-row">
                <input class="update-column" placeholder="Column name">
                <input class="update-value" placeholder="New value">
                <button class="remove-btn"><i class="fas fa-times"></i></button>
            </div>
        `;
        document.getElementById('update-conditions-container').innerHTML = `
            <div class="condition-row">
                <input class="condition-column" placeholder="Column's Name for Conditions">
                <select class="condition-operator">
                    <option value="=">=</option>
                    <option value="!=">!=</option>
                    <option value="<">&lt;</option>
                    <option value=">">&gt;</option>
                    <option value="<=">&lt;=</option>
                    <option value=">=">&gt;=</option>
                    <option value="LIKE">LIKE</option>
                </select>
                <input type="text" class="condition-value" placeholder="Value">
                <button class="remove-btn"><i class="fas fa-times"></i></button>
            </div>
        `;
        document.getElementById('sql-preview-section').style.display = 'none';
        initRemoveButtons();
    });

    // ============================================
    // DELETE QUERY BUILDER
    // ============================================
    setupAddRemove('delete-conditions-container', `
        <div class="condition-row">
            <input class="condition-column" placeholder="Column's Name for Conditions">
            <select class="condition-operator">
                <option value="=">=</option>
                <option value="!=">!=</option>
                <option value="<">&lt;</option>
                <option value=">">&gt;</option>
                <option value="<=">&lt;=</option>
                <option value=">=">&gt;=</option>
                <option value="LIKE">LIKE</option>
                <option value="IN">IN</option>
            </select>
            <input type="text" class="condition-value" placeholder="Value">
            <button class="remove-btn"><i class="fas fa-times"></i></button>
        </div>
    `, 'add-delete-condition');

    document.getElementById('generate-delete-sql').addEventListener('click', function() {
        const database = document.getElementById('delete-database').value.trim();
        const table = document.getElementById('delete-table').value.trim();

        if (!database || !table) {
            showToast('Please select a database and table', 'error');
            return;
        }

        const conditions = [];
        document.querySelectorAll('#delete-conditions-container .condition-row').forEach(row => {
            const column = row.querySelector('.condition-column')?.value.trim();
            const operator = row.querySelector('.condition-operator')?.value;
            const value = row.querySelector('.condition-value')?.value.trim();
            if (column && value) {
                conditions.push(column + ' ' + operator + ' ' + (isNaN(value) ? "'" + value + "'" : value));
            }
        });

        let sql = 'DELETE FROM ' + database + '.' + table;
        if (conditions.length > 0) sql += '\nWHERE ' + conditions.join(' AND ');
        sql += ';';
        showSqlPreview(sql);
    });

    document.getElementById('reset-delete-query').addEventListener('click', function() {
        document.getElementById('delete-database').value = '';
        document.getElementById('delete-table').value = '';
        document.getElementById('delete-conditions-container').innerHTML = `
            <div class="condition-row">
                <input class="condition-column" placeholder="Column's Name for Conditions">
                <select class="condition-operator">
                    <option value="=">=</option>
                    <option value="!=">!=</option>
                    <option value="<">&lt;</option>
                    <option value=">">&gt;</option>
                    <option value="<=">&lt;=</option>
                    <option value=">=">&gt;=</option>
                    <option value="LIKE">LIKE</option>
                    <option value="IN">IN</option>
                </select>
                <input type="text" class="condition-value" placeholder="Value">
                <button class="remove-btn"><i class="fas fa-times"></i></button>
            </div>
        `;
        document.getElementById('sql-preview-section').style.display = 'none';
        initRemoveButtons();
    });

    // ============================================
    // CREATE TABLE BUILDER
    // ============================================
    setupAddRemove('create-columns-container', `
        <div class="column-row">
            <input type="text" class="column-name" placeholder="Column name">
            <select class="column-type">
                <option value="INT">INT</option>
                <option value="VARCHAR">VARCHAR</option>
                <option value="TEXT">TEXT</option>
                <option value="DATE">DATE</option>
                <option value="DATETIME">DATETIME</option>
                <option value="TIMESTAMP">TIMESTAMP</option>
                <option value="DECIMAL">DECIMAL</option>
                <option value="FLOAT">FLOAT</option>
                <option value="DOUBLE">DOUBLE</option>
                <option value="BOOLEAN">BOOLEAN</option>
                <option value="BLOB">BLOB</option>
                <option value="JSON">JSON</option>
                <option value="ENUM">ENUM</option>
            </select>
            <input type="text" class="column-length" placeholder="Length" style="width: 80px;">
            <div>
                <input type="checkbox" class="column-pk">
                <label style="display: inline;">PK</label>
            </div>
            <div>
                <input type="checkbox" class="column-null" checked>
                <label style="display: inline;">NULL</label>
            </div>
            <div>
                <input type="checkbox" class="column-ai">
                <label style="display: inline;">AI</label>
            </div>
            <div>
                <input type="checkbox" class="column-unique">
                <label style="display: inline;">UQ</label>
            </div>
            <input type="text" class="column-default" placeholder="Default" style="width: 100px;">
            <button class="remove-btn"><i class="fas fa-times"></i></button>
        </div>
    `, 'add-create-column');

    document.getElementById('generate-create-sql').addEventListener('click', function() {
        const database = document.getElementById('create-database')?.value.trim();
        const tableName = document.getElementById('table-name')?.value.trim();
        const ifNotExists = document.getElementById('if-not-exists')?.checked;
        const engine = document.getElementById('table-engine')?.value || 'InnoDB';

        if (!database) {
            showToast('Please enter a database name', 'error');
            return;
        }
        if (!tableName) {
            showToast('Please enter a table name', 'error');
            return;
        }

        const columns = [];
        const primaryKeys = [];
        const uniqueKeys = [];
        let hasColumns = false;

        document.querySelectorAll('#create-columns-container .column-row').forEach(row => {
            const name = row.querySelector('.column-name')?.value.trim();
            const type = row.querySelector('.column-type')?.value;
            const length = row.querySelector('.column-length')?.value.trim();
            const isPK = row.querySelector('.column-pk')?.checked;
            const isNull = row.querySelector('.column-null')?.checked;
            const isAI = row.querySelector('.column-ai')?.checked;
            const isUnique = row.querySelector('.column-unique')?.checked;
            const defaultVal = row.querySelector('.column-default')?.value.trim();

            if (!name) return;
            hasColumns = true;

            let columnDef = '  ' + name + ' ' + type;
            if (length && (type === 'VARCHAR' || type === 'DECIMAL' || type === 'FLOAT' || type === 'DOUBLE' || type === 'ENUM')) {
                columnDef += '(' + length + ')';
            }
            if (!isNull) columnDef += ' NOT NULL';
            if (isAI) columnDef += ' AUTO_INCREMENT';
            if (defaultVal) columnDef += ' DEFAULT ' + (isNaN(defaultVal) && defaultVal.toUpperCase() !== 'NULL' ? "'" + defaultVal + "'" : defaultVal);
            if (isUnique) columnDef += ' UNIQUE';

            columns.push(columnDef);
            if (isPK) primaryKeys.push(name);
            if (isUnique && !isPK) uniqueKeys.push(name);
        });

        if (!hasColumns) {
            showToast('Please add at least one column', 'error');
            return;
        }

        let sql = 'CREATE TABLE ';
        if (ifNotExists) sql += 'IF NOT EXISTS ';
        sql += database + '.' + tableName + ' (\n' + columns.join(',\n');

        if (primaryKeys.length > 0) sql += ',\n  PRIMARY KEY (' + primaryKeys.join(', ') + ')';
        if (uniqueKeys.length > 0) {
            uniqueKeys.forEach(uk => {
                sql += ',\n  UNIQUE KEY uk_' + uk + ' (' + uk + ')';
            });
        }

        sql += '\n) ENGINE=' + engine + ';';
        showSqlPreview(sql);
    });

    document.getElementById('reset-create-query').addEventListener('click', function() {
        document.getElementById('create-database').value = '';
        document.getElementById('table-name').value = '';
        document.getElementById('if-not-exists').checked = false;
        document.getElementById('table-engine').value = 'InnoDB';
        document.getElementById('create-columns-container').innerHTML = `
            <div class="column-row">
                <input type="text" class="column-name" placeholder="Column name">
                <select class="column-type">
                    <option value="INT">INT</option>
                    <option value="VARCHAR">VARCHAR</option>
                    <option value="TEXT">TEXT</option>
                    <option value="DATE">DATE</option>
                    <option value="DATETIME">DATETIME</option>
                    <option value="TIMESTAMP">TIMESTAMP</option>
                    <option value="DECIMAL">DECIMAL</option>
                    <option value="FLOAT">FLOAT</option>
                    <option value="DOUBLE">DOUBLE</option>
                    <option value="BOOLEAN">BOOLEAN</option>
                    <option value="BLOB">BLOB</option>
                    <option value="JSON">JSON</option>
                    <option value="ENUM">ENUM</option>
                </select>
                <input type="text" class="column-length" placeholder="Length" style="width: 80px;">
                <div>
                    <input type="checkbox" class="column-pk" id="pk-1">
                    <label for="pk-1" style="display: inline;">PK</label>
                </div>
                <div>
                    <input type="checkbox" class="column-null" id="null-1" checked>
                    <label for="null-1" style="display: inline;">NULL</label>
                </div>
                <div>
                    <input type="checkbox" class="column-ai" id="ai-1">
                    <label for="ai-1" style="display: inline;">AI</label>
                </div>
                <div>
                    <input type="checkbox" class="column-unique" id="uq-1">
                    <label for="uq-1" style="display: inline;">UQ</label>
                </div>
                <input type="text" class="column-default" placeholder="Default" style="width: 100px;">
                <button class="remove-btn"><i class="fas fa-times"></i></button>
            </div>
        `;
        document.getElementById('sql-preview-section').style.display = 'none';
        initRemoveButtons();
    });

    // ============================================
    // ALTER TABLE BUILDER
    // ============================================
    setupAddRemove('alter-operations-container', `
        <div class="column-row">
            <select class="alter-action">
                <option value="ADD">ADD COLUMN</option>
                <option value="MODIFY">MODIFY COLUMN</option>
                <option value="CHANGE">CHANGE COLUMN</option>
                <option value="DROP">DROP COLUMN</option>
                <option value="RENAME">RENAME COLUMN</option>
            </select>
            <input class="alter-column" placeholder="Column name">
            <input class="alter-new-column" placeholder="New name (for CHANGE/RENAME)">
            <select class="alter-type">
                <option value="">Type</option>
                <option value="INT">INT</option>
                <option value="VARCHAR(255)">VARCHAR(255)</option>
                <option value="TEXT">TEXT</option>
                <option value="DATE">DATE</option>
                <option value="DATETIME">DATETIME</option>
                <option value="DECIMAL(10,2)">DECIMAL(10,2)</option>
                <option value="BOOLEAN">BOOLEAN</option>
            </select>
            <div>
                <input type="checkbox" class="alter-null" checked>
                <label style="display: inline;">NULL</label>
            </div>
            <button class="remove-btn"><i class="fas fa-times"></i></button>
        </div>
    `, 'add-alter-operation');

    document.getElementById('generate-alter-sql').addEventListener('click', function() {
        const database = document.getElementById('alter-database').value.trim();
        const tableName = document.getElementById('alter-table-name').value.trim();

        if (!database || !tableName) {
            showToast('Please enter database and table names', 'error');
            return;
        }

        const operations = [];
        document.querySelectorAll('#alter-operations-container .column-row').forEach(row => {
            const action = row.querySelector('.alter-action')?.value;
            const column = row.querySelector('.alter-column')?.value.trim();
            const newColumn = row.querySelector('.alter-new-column')?.value.trim();
            const type = row.querySelector('.alter-type')?.value;
            const isNull = row.querySelector('.alter-null')?.checked;

            if (!column) return;

            let op = '';
            switch(action) {
                case 'ADD':
                    op = 'ADD COLUMN ' + column + ' ' + (type || 'VARCHAR(255)');
                    if (!isNull) op += ' NOT NULL';
                    break;
                case 'MODIFY':
                    op = 'MODIFY COLUMN ' + column + ' ' + (type || 'VARCHAR(255)');
                    if (!isNull) op += ' NOT NULL';
                    break;
                case 'CHANGE':
                    op = 'CHANGE COLUMN ' + column + ' ' + (newColumn || column) + ' ' + (type || 'VARCHAR(255)');
                    if (!isNull) op += ' NOT NULL';
                    break;
                case 'DROP':
                    op = 'DROP COLUMN ' + column;
                    break;
                case 'RENAME':
                    op = 'RENAME COLUMN ' + column + ' TO ' + (newColumn || column);
                    break;
            }
            if (op) operations.push(op);
        });

        if (operations.length === 0) {
            showToast('Please add at least one operation', 'error');
            return;
        }

        let sql = 'ALTER TABLE ' + database + '.' + tableName + '\n' + operations.join(',\n') + ';';
        showSqlPreview(sql);
    });

    document.getElementById('reset-alter-query').addEventListener('click', function() {
        document.getElementById('alter-database').value = '';
        document.getElementById('alter-table-name').value = '';
        document.getElementById('alter-operations-container').innerHTML = `
            <div class="column-row">
                <select class="alter-action">
                    <option value="ADD">ADD COLUMN</option>
                    <option value="MODIFY">MODIFY COLUMN</option>
                    <option value="CHANGE">CHANGE COLUMN</option>
                    <option value="DROP">DROP COLUMN</option>
                    <option value="RENAME">RENAME COLUMN</option>
                </select>
                <input class="alter-column" placeholder="Column name">
                <input class="alter-new-column" placeholder="New name (for CHANGE/RENAME)">
                <select class="alter-type">
                    <option value="">Type</option>
                    <option value="INT">INT</option>
                    <option value="VARCHAR(255)">VARCHAR(255)</option>
                    <option value="TEXT">TEXT</option>
                    <option value="DATE">DATE</option>
                    <option value="DATETIME">DATETIME</option>
                    <option value="DECIMAL(10,2)">DECIMAL(10,2)</option>
                    <option value="BOOLEAN">BOOLEAN</option>
                </select>
                <div>
                    <input type="checkbox" class="alter-null" checked>
                    <label style="display: inline;">NULL</label>
                </div>
                <button class="remove-btn"><i class="fas fa-times"></i></button>
            </div>
        `;
        document.getElementById('sql-preview-section').style.display = 'none';
        initRemoveButtons();
    });

    // ============================================
    // CREATE VIEW BUILDER
    // ============================================
    document.getElementById('generate-view-sql').addEventListener('click', function() {
        const database = document.getElementById('view-database').value.trim();
        const viewName = document.getElementById('view-name').value.trim();
        const orReplace = document.getElementById('or-replace')?.checked;
        const query = document.getElementById('view-query-text').value.trim();

        if (!database || !viewName) {
            showToast('Please enter database and view names', 'error');
            return;
        }
        if (!query) {
            showToast('Please enter the SELECT query for the view', 'error');
            return;
        }

        let sql = 'CREATE ';
        if (orReplace) sql += 'OR REPLACE ';
        sql += 'VIEW ' + database + '.' + viewName + ' AS\n' + query;
        if (!query.endsWith(';')) sql += ';';

        showSqlPreview(sql);
    });

    document.getElementById('reset-view-query').addEventListener('click', function() {
        document.getElementById('view-database').value = '';
        document.getElementById('view-name').value = '';
        document.getElementById('or-replace').checked = false;
        document.getElementById('view-query-text').value = '';
        document.getElementById('sql-preview-section').style.display = 'none';
    });

    // ============================================
    // COPY TO CLIPBOARD
    // ============================================
    document.getElementById('copy-sql').addEventListener('click', function() {
        const sql = document.getElementById('sql-preview').textContent;
        navigator.clipboard.writeText(sql).then(() => {
            this.innerHTML = '<i class="fas fa-check"></i> Copied!';
            this.classList.add('copied');
            showToast('SQL copied to clipboard!');
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-copy"></i> Copy';
                this.classList.remove('copied');
            }, 2000);
        }).catch(() => {
            showToast('Failed to copy', 'error');
        });
    });

    console.log('SQL Builder initialized successfully!');
});
