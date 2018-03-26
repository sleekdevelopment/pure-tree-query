"use strict";
/**
 * Created by hailevi on 3/10/18.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var pluralize = require("pluralize");
/**
 * @Method: Returns the plural form of any noun.
 * @Param {string}
 * @Return {string}
 */
function getPlural(str) {
    return pluralize.plural(str);
}
exports.getPlural = getPlural;
/**
 * Rule types.
 * @type {{STRING: string; NUMBER: string; BOOLEAN: string; DATE: string}}
 */
var RULE_TYPES = {
    STRING: 'string',
    NUMBER: 'number',
    BOOLEAN: 'boolean',
    DATE: 'date'
};
/**
 * Tree actions
 * @type {{ADD: string; REMOVE: string; UPDATE: string}}
 */
var TREE_ACTIONS = {
    ADD: "TREE_ACTIONS:ADD",
    REMOVE: "TREE_ACTIONS:REMOVE",
    UPDATE: "TREE_ACTIONS:UPDATE"
};
/**
 * Operator.
 * @type {{AND: string; OR: string}}
 */
var OPERATOR = {
    AND: 'AND',
    OR: 'OR'
};
var TreeQuery = /** @class */ (function () {
    function TreeQuery(options, containerSelector, data) {
        if (data === void 0) { data = []; }
        this.options = options;
        this.tree = {};
        this.originData = data;
        this.containerSelector = containerSelector;
        this.initConditionOfTypes();
        this.treeQueryClickListener();
        this.treeQueryChangeListener();
        this.initTree();
        this.defaultFilter();
        this.containerRef = document.getElementById('criteria-container');
    }
    /**
     * Init tree. called on new Query and reset button clicked.
     */
    TreeQuery.prototype.initTree = function () {
        this.tree = {
            condition: OPERATOR.AND,
            id: '0',
            rules: [],
            valid: true
        };
    };
    /**
     * Get query tree
     * @returns {TreeQueryState|{}}
     */
    TreeQuery.prototype.getQuery = function () {
        return this.tree;
    };
    /**
     * Load new list to Query tree.
     * @param data properties need to be equal to criteria options.
     */
    TreeQuery.prototype.setData = function (data) {
        this.originData = data;
        this.filteredData = data;
    };
    /**
     * check if rule field exist on tested item.
     * @param label
     * @param item
     * @returns {any}
     */
    TreeQuery.prototype.checkIfLabelExist = function (label, item) {
        return item && item[label];
    };
    /**
     * Logic check of string operators.
     * @param rule
     * @param item
     * @returns {any}
     */
    TreeQuery.prototype.stringRuleHandler = function (rule, item) {
        switch (rule.operator) {
            case 'equal': {
                return this.checkIfLabelExist(rule.field, item) && item[rule.field] == rule.value;
            }
            case 'not equal': {
                return !this.checkIfLabelExist(rule.field, item) || item[rule.field] != rule.value;
            }
            case 'begins with': {
                return this.checkIfLabelExist(rule.field, item) && item[rule.field].startsWith(rule.value);
            }
            case 'not begins with': {
                return !this.checkIfLabelExist(rule.field, item) || !item[rule.field].startsWith(rule.value);
            }
            case 'contains': {
                return this.checkIfLabelExist(rule.field, item) && item[rule.field].includes(rule.value);
            }
            case 'not contains': {
                return !this.checkIfLabelExist(rule.field, item) || !item[rule.field].includes(rule.value);
            }
            case 'end with': {
                return this.checkIfLabelExist(rule.field, item) && item[rule.field].endsWith(rule.value);
            }
            case 'not end with': {
                return !this.checkIfLabelExist(rule.field, item) || !item[rule.field].endsWith(rule.value);
            }
            case 'is empty': {
                return this.checkIfLabelExist(rule.field, item) && item[rule.field].length == 0;
            }
            case 'is not empty': {
                return this.checkIfLabelExist(rule.field, item) && item[rule.field].length > 0;
            }
            default: return false;
        }
    };
    /**
     * Logic check of number operators.
     * @param rule
     * @param item
     * @returns {any}
     */
    TreeQuery.prototype.numberRuleHandler = function (rule, item) {
        try {
            switch (rule.operator) {
                case 'equal': {
                    return this.checkIfLabelExist(rule.field, item) && parseInt(item[rule.field]) == parseInt(rule.value);
                }
                case 'not equal': {
                    return !this.checkIfLabelExist(rule.field, item) || parseInt(item[rule.field]) != parseInt(rule.value);
                }
                case 'less': {
                    return this.checkIfLabelExist(rule.field, item) && parseInt(item[rule.field]) < parseInt(rule.value);
                }
                case 'less or equal': {
                    return this.checkIfLabelExist(rule.field, item) && parseInt(item[rule.field]) <= parseInt(rule.value);
                }
                case 'greater': {
                    return this.checkIfLabelExist(rule.field, item) && parseInt(item[rule.field]) > parseInt(rule.value);
                }
                case 'greater or equal': {
                    return this.checkIfLabelExist(rule.field, item) && parseInt(item[rule.field]) >= parseInt(rule.value);
                }
                case 'between': {
                    return this.checkIfLabelExist(rule.field, item) && parseInt(item[rule.field]) < parseInt(rule.value.max) && parseInt(item[rule.field]) > parseInt(rule.value.min);
                }
                case 'not between': {
                    return !this.checkIfLabelExist(rule.field, item) || !(parseInt(item[rule.field]) < parseInt(rule.value.max) && parseInt(item[rule.field]) > parseInt(rule.value.min));
                }
                case 'is empty': {
                    return this.checkIfLabelExist(rule.field, item) && item[rule.field].toString().trim().length == 0;
                }
                case 'is not empty': {
                    return this.checkIfLabelExist(rule.field, item) && item[rule.field].toString().trim().length > 0;
                }
                default: return false;
            }
        }
        catch (e) {
            console.log(e);
            return false;
        }
    };
    /**
     * Logic check of date operators.
     * @param rule
     * @param item
     * @returns {any}
     */
    TreeQuery.prototype.dateRuleHandler = function (rule, item) {
        var date = this.checkIfLabelExist(rule.field, item) && this.isDate(item[rule.field])
            ? Date.parse(item[rule.field]) / 1000 : null;
        switch (rule.operator) {
            case 'equal': {
                return this.checkIfLabelExist(rule.field, item) && item[rule.field] == rule.value;
            }
            case 'not equal': {
                return !this.checkIfLabelExist(rule.field, item) || !(item[rule.field] != rule.value);
            }
            case 'before': {
                return date && date < parseInt(rule.value);
            }
            case 'before or equal': {
                return date && date <= parseInt(rule.value);
            }
            case 'after': {
                return date && date > parseInt(rule.value);
            }
            case 'after or equal': {
                return date && date >= parseInt(rule.value);
            }
            case 'between': {
                return date && date < parseInt(rule.value.max) && date > parseInt(rule.value.min);
            }
            case 'not between': {
                return !date || !(date < parseInt(rule.value.max) && date > parseInt(rule.value.min));
            }
            case 'is empty': {
                return this.checkIfLabelExist(rule.field, item) && item[rule.field].toString().trim().length == 0;
            }
            case 'is not empty': {
                return this.checkIfLabelExist(rule.field, item) && item[rule.field].toString().trim().length > 0;
            }
            default: return false;
        }
    };
    /**
     * check if item pass boolean condition
     * @param rule
     * @param item
     * @returns {any|boolean}
     */
    TreeQuery.prototype.booleanRuleHandler = function (rule, item) {
        return this.checkIfLabelExist(rule.field, item) && item[rule.field] == rule.value;
    };
    /**
     * Select function by type to check if data pass rule
     * @param rule
     * @param data
     * @returns {boolean}
     */
    TreeQuery.prototype.validationRuleHandler = function (rule, data) {
        if (rule.type == 'string')
            return this.stringRuleHandler(rule, data);
        else if (rule.type == 'number')
            return this.numberRuleHandler(rule, data);
        else if (rule.type == 'date')
            return this.dateRuleHandler(rule, data);
        else if (rule.type == 'boolean')
            return this.booleanRuleHandler(rule, data);
        else
            return this.stringRuleHandler(rule, data);
    };
    /**
     * Recursive function for decide if item pass query.
     * @param item
     * @param condition
     * @param rules
     * @returns {boolean}
     */
    TreeQuery.prototype.filterData = function (item, condition, rules) {
        if (condition === void 0) { condition = "AND"; }
        if (rules === void 0) { rules = []; }
        var con = [];
        for (var i = 0; i < rules.length; i++) {
            if (rules[i].rules) {
                con.push(this.filterData(item, rules[i].condition, rules[i].rules));
            }
            else if (rules[i] && rules[i].field && rules[i].type && rules[i].operator) {
                con.push(this.validationRuleHandler(rules[i], item));
            }
        }
        console.log(con);
        return con.length == 0 || condition == "AND" ? con.every(function (c) { return c; }) : con.some(function (c) { return c; });
    };
    /**
     * Return rule group init by index.
     * @param index
     * @returns {{id: any, condition: string, rules: [{id: any, field: null, type: null, input: null, operator: null, value: null}]}}
     */
    TreeQuery.prototype.getDefaultGroupBranch = function (index) {
        return {
            id: index,
            condition: OPERATOR.AND,
            rules: [this.getDefaultRule(index + "_0")]
        };
    };
    /**
     * Return Default Rule init by index.
     * @param index
     * @returns {{id: any, field: null, type: null, input: null, operator: null, value: null}}
     */
    TreeQuery.prototype.getDefaultRule = function (index) {
        return {
            id: index,
            field: null,
            type: null,
            input: null,
            operator: null,
            value: null
        };
    };
    /**
     * Run once on new query created
     * Set default group with rule amd update the tree.
     */
    TreeQuery.prototype.defaultFilter = function () {
        document.querySelector('#criteria-container').insertAdjacentHTML('beforeend', "<ul class=\"root-ul\">" + this.addGroup('0') + "</ul>");
        this.updateTreeFilter(TREE_ACTIONS.ADD, '0', this.getDefaultRule('0_0'));
        this.renderResults(this.originData);
    };
    /**
     * Validation function for number/date type.
     * @param rule
     * @returns {any}
     */
    TreeQuery.prototype.validateNumberOrDate = function (rule) {
        switch (rule.operator) {
            case 'between':
            case 'not between': {
                return rule && rule.value && rule.value.min && rule.value.max &&
                    !isNaN(rule.value.min) && !isNaN(rule.value.max) && rule.value.min < rule.value.max;
            }
            case 'is empty':
            case 'is not empty': {
                return !rule.value || rule.value.length == 0;
            }
            default: return rule && rule.value && !isNaN(rule.value);
        }
    };
    /**
     * select validation for rule operator
     * @param rule
     * @returns {boolean}
     */
    TreeQuery.prototype.validateString = function (rule) {
        switch (rule.operator) {
            case 'is empty':
            case 'is not empty': {
                return !rule.value || rule.value.length == 0;
            }
            default: return rule.value && rule.value.length > 0;
        }
    };
    /**
     * Select validation function for rule type.
     * @param rule
     * @returns {any}
     */
    TreeQuery.prototype.checkIfRuleValid = function (rule) {
        switch (rule.type) {
            case RULE_TYPES.STRING:
            case RULE_TYPES.BOOLEAN: {
                return this.validateString(rule);
            }
            case RULE_TYPES.NUMBER:
            case RULE_TYPES.DATE: {
                return this.validateNumberOrDate(rule);
            }
        }
    };
    /**
     * Mark rule input value in red in case operator is set and value missing.
     * @param rule
     */
    TreeQuery.prototype.markAsError = function (rule) {
        var invalidRule = this.containerRef.querySelector("[data-index=\"" + rule.id + "\"]");
        this.addClass(invalidRule, 'invalid-rule');
    };
    /**
     * Remove invalid class from input in case input became valid.
     * @param rule
     */
    TreeQuery.prototype.markAsValid = function (rule) {
        var invalidRule = this.containerRef.querySelector("[data-index=\"" + rule.id + "\"]");
        this.removeClass(invalidRule, 'invalid-rule');
    };
    /**
     * Recursive function for check if filter valid.
     * @param branch
     * @returns {boolean}
     */
    TreeQuery.prototype.validateTree = function (branch) {
        var isRowsValid = [];
        for (var i = 0; i < branch.rules.length; i++) {
            if (branch.rules[i] && branch.rules[i].rules) {
                isRowsValid.push(this.validateTree(branch.rules[i]));
            }
            else if (branch[i] && branch[i].field && branch[i].type && branch[i].operator) {
                var isValid = this.checkIfRuleValid(branch.rules[i]);
                //if branch invalid(missing required value)
                if (!isValid)
                    this.markAsError(branch.rules[i]);
                else
                    this.markAsValid(branch.rules[i]);
                isRowsValid.push(isValid);
                isRowsValid.push(this.checkIfRuleValid(branch.rules[i]));
            }
        }
        return isRowsValid.every(function (e) { return e; });
    };
    /**
     * Get index of parent child.
     * We use this function on delete rule/group.
     * @param index
     * @returns {string}
     */
    TreeQuery.prototype.getParentIndex = function (index) {
        var tmpIndex = index.lastIndexOf('_');
        return index != '0' ? index.substring(0, tmpIndex) : '0';
    };
    /**
     * Recursive function for finding branch by id.
     * @param index
     * @param branch
     * @returns {TREE_RULE | TREE_RULE_GROUP}
     */
    TreeQuery.prototype.findBranchById = function (index, branch) {
        if (branch === void 0) { branch = null; }
        branch = !branch || index == 0 ? this.tree : branch;
        if (branch.id == index)
            return branch;
        else {
            var result = null;
            for (var i = 0; i < branch.rules.length; i++) {
                if (branch.rules[i].id == index) {
                    result = branch.rules[i];
                    break;
                }
                else if (branch.rules[i].rules && branch.rules[i].rules.length > 0) {
                    result = this.findBranchById(index, branch.rules[i]);
                }
            }
            return result;
        }
    };
    /**
     * Manage filter state. update on  every change in query builder.
     * @param action
     * @param index
     * @param child
     */
    TreeQuery.prototype.updateTreeFilter = function (action, index, child) {
        if (child === void 0) { child = null; }
        if (action == TREE_ACTIONS.ADD && child != null) {
            var target = this.findBranchById(index);
            target.rules.push(child);
        }
        else if (action == TREE_ACTIONS.REMOVE) {
            var parentIndex = this.getParentIndex(index);
            var target = this.findBranchById(parentIndex);
            for (var i = 0; i < target.rules.length; i++) {
                if (target.rules[i].id == index) {
                    target.rules.splice(i, 1);
                }
            }
        }
        else if (action == TREE_ACTIONS.UPDATE) {
            var parentIndex = this.getParentIndex(index);
            var target = this.findBranchById(parentIndex);
            if (index == "0") {
                target.condition = child.condition;
            }
            else {
                for (var i = 0; i < target.rules.length; i++) {
                    if (target.rules[i].id == index) {
                        target.rules[i] = Object.assign({}, target.rules[i], child);
                    }
                }
            }
        }
        console.log(this.tree);
    };
    /**
     * Remove all children from selected element.
     * @param node
     */
    TreeQuery.prototype.removeChilds = function (node) {
        var last;
        while (last = node.lastChild)
            node.removeChild(last);
    };
    /**
     * Init operator list by type.
     */
    TreeQuery.prototype.initConditionOfTypes = function () {
        this.conditionOfTypes = {};
        this.conditionOfTypes[RULE_TYPES.STRING] = ['equal', 'not equal', 'begins with', 'not begins with', 'contains', 'not contains', 'end with', 'not end with', 'is empty', 'is not empty'];
        this.conditionOfTypes[RULE_TYPES.NUMBER] = ['equal', 'not equal', 'less', 'less or equal', 'greater', 'greater or equal', 'between', 'not between', 'is empty', 'is not empty'];
        this.conditionOfTypes[RULE_TYPES.DATE] = ['between', 'not between', 'after', 'after or equal', 'before', 'before or equal', 'equal', 'not equal', 'is empty', 'is not empty'];
        this.conditionOfTypes[RULE_TYPES.BOOLEAN] = ['true', 'false'];
    };
    /**
     * Group Template. run on add Rule clicked.
     * @param index
     * @returns {string}
     */
    TreeQuery.prototype.addRule = function (index) {
        var labels = this.options.rules.map(function (rule) { return "<option value=\"" + rule.type + "\">" + rule.label + "</option>"; });
        return "<li class=\"rule\" data-index=\"" + index + "\">\n                    <div class=\"delete-rule\">\n                        <button type=\"button\" class=\"btn btn-xs btn-danger\" data-action=\"delete-rule\">\n                            Delete\n                        </button>\n                    </div>\n                    <div class=\"rule-filter-criteria\">\n                        <select class=\"listen-to-change form-control\" data-action=\"select-criteria\">\n                            <option value=\"---\">---</option>\n                            " + labels + "\n                        </select>\n                    </div>\n                    <div class=\"rule-filter-operator\"></div>\n                    <div class=\"rule-filter-value\"></div>\n                </li>";
    };
    /**
     * Group Template. run on add group clicked.
     * @param index
     * @returns {string}
     */
    TreeQuery.prototype.addGroup = function (index) {
        return "<li class=\"rule rule-group\" data-index=\"" + index + "\">\n                    <dl>\n                        <dt class=\"criteria-panel\">\n                            <div class=\"left\">\n                                <label data-id=\"" + index + "\" data-action=\"add-connection\" data-value=\"" + OPERATOR.AND + "\" class=\"btn active-operator operator btn-primary\">AND</label>\n                                <label data-id=\"" + index + "\" data-action=\"add-connection\" data-value=\"" + OPERATOR.OR + "\" class=\"btn operator btn-primary\">OR</label>\n                            </div>\n                            <div class=\"right\">\n                                <div class=\"btn-group pull-right group-actions\">\n                                    <button type=\"button\" class=\"btn btn-xs btn-success\" data-action=\"add-rule\">\n                                        Add rule\n                                    </button>\n                                    <button type=\"button\" class=\"btn btn-xs btn-success\" data-action=\"add-group\">\n                                        Add group\n                                    </button>\n                                     <button type=\"button\" class=\"btn btn-xs btn-danger\" data-action=\"delete-group\">\n                                        Delete\n                                    </button>\n                                </div>\n                            </div>\n                        </dt>\n                        <dd>\n                            <ul class=\"rules-list\">\n                                " + this.addRule(index + "_0") + "\n                            </ul>\n                        </dd>\n                    </dl>\n                </li>";
    };
    /**
     * Decide which inputs to render depend on type.
     * @param option
     * @param target
     */
    TreeQuery.prototype.renderInputsByTypes = function (option, target) {
        switch (option) {
            case RULE_TYPES.STRING: {
                this.renderSelectAndInput(target, this.conditionOfTypes[RULE_TYPES.STRING], 'text');
                return;
            }
            case RULE_TYPES.NUMBER: {
                this.renderSelectAndInput(target, this.conditionOfTypes[RULE_TYPES.NUMBER], 'number');
                return;
            }
            case RULE_TYPES.BOOLEAN: {
                this.renderInputsForBoolean(target);
                return;
            }
            case RULE_TYPES.DATE: {
                this.renderSelectAndInput(target, this.conditionOfTypes[RULE_TYPES.DATE], 'date');
                return;
            }
        }
    };
    /**
     * On type text/date/number render select box with operators and input depends on selected operator.
     * By default first operator in list will be selected.
     * @param target
     * @param typeOptions
     * @param type
     */
    TreeQuery.prototype.renderSelectAndInput = function (target, typeOptions, type) {
        if (type === void 0) { type = 'text'; }
        var options = typeOptions.map(function (operator) { return "<option value=\"" + operator + "\">" + operator + "</option>"; });
        var rowElem = target.closest('.rule');
        var operatorElem = rowElem.querySelector('.rule-filter-operator');
        var inputElem = rowElem.querySelector('.rule-filter-value');
        this.removeChilds(operatorElem);
        this.removeChilds(inputElem);
        operatorElem.insertAdjacentHTML('afterbegin', "<select class=\"listen-to-change form-control\" data-action=\"select-operator\">" + options + "</select>");
        inputElem.insertAdjacentHTML('afterbegin', "<input type=\"" + type + "\" value=\"\" data-action=\"select-value\" class=\"plugin-input form-control\" />");
    };
    /**
     * On select criteria of type boolean. render radio button with true/false
     * @param target
     */
    TreeQuery.prototype.renderInputsForBoolean = function (target) {
        var checkbox = this.conditionOfTypes[RULE_TYPES.BOOLEAN].map(function (value) { return "<label><input style=\"height: auto !important;\" class=\"plugin-input listen-to-change\" data-action=\"select-value\" type=\"radio\" name=\"boolean\" value=\"" + value + "\">" + value + "</label>"; }).join('');
        var rowElem = target.closest('.rule');
        var booleanElem = rowElem.querySelector('.rule-filter-operator');
        var valueElem = rowElem.querySelector('.rule-filter-value');
        this.removeChilds(booleanElem);
        this.removeChilds(valueElem);
        valueElem.insertAdjacentHTML('afterbegin', checkbox);
    };
    /**
     * Handle Add/Delete Group/Rule
     */
    TreeQuery.prototype.treeQueryClickListener = function () {
        var _this = this;
        var queryContainer = document.getElementById('criteria-container');
        queryContainer.addEventListener('click', function (el) {
            var target = el.target;
            var action = target.getAttribute('data-action');
            var parent = target.closest('.rule-group');
            //Add rule or group.
            if (action == 'add-rule' || action == 'add-group') {
                var rulesList = parent.querySelector('dd .rules-list');
                var index = parent.getAttribute('data-index');
                var template = action == 'add-group' ? _this.addGroup(index + "_" + rulesList.childElementCount) : _this.addRule(index + "_" + rulesList.childElementCount);
                rulesList.insertAdjacentHTML('beforeend', template);
                var branch = action == 'add-group'
                    ? _this.getDefaultGroupBranch(index + "_" + (rulesList.childElementCount - 1)) : _this.getDefaultRule(index + "_" + (rulesList.childElementCount - 1));
                _this.updateTreeFilter(TREE_ACTIONS.ADD, index, branch);
                //Delete rule or group.
            }
            else if (action == 'delete-rule' || action == 'delete-group') {
                var child = target.closest('li.rule');
                var id = child.getAttribute('data-index');
                _this.removeChilds(child);
                child.remove();
                _this.updateTreeFilter(TREE_ACTIONS.REMOVE, id);
                //Update condition on group of rules.
            }
            else if (action == 'add-connection') {
                var connections = parent.querySelector('.criteria-panel').querySelectorAll('.operator');
                console.log(connections);
                connections.forEach(function (con) { return _this.removeClass(con, 'active-operator'); });
                _this.addClass(target, 'active-operator');
                var index = target.getAttribute('data-id');
                var condition = target.getAttribute('data-value');
                _this.updateTreeFilter(TREE_ACTIONS.UPDATE, index, {
                    condition: condition
                });
                _this.updateResults();
            }
        });
    };
    /**
     * Handle change event on criteria and operator and value.
     * listener set on main container to reduce listeners and handle dynamic elements.
     */
    TreeQuery.prototype.treeQueryChangeListener = function () {
        var _this = this;
        var queryContainer = document.getElementById('criteria-container');
        queryContainer.addEventListener('change', function (el) {
            //changed element
            var target = el.target;
            var dataAction = target.getAttribute('data-action');
            //select parent child.
            var row = target.closest('li.rule');
            var index = row.getAttribute('data-index');
            var criteriaSelect = row.querySelector('.rule-filter-criteria select');
            var typeCriteria = criteriaSelect.options[criteriaSelect.selectedIndex].value;
            var labelCriteria = criteriaSelect.options[criteriaSelect.selectedIndex].label;
            if (dataAction == "select-criteria") {
                _this.updateTreeFilter(TREE_ACTIONS.UPDATE, index, {
                    field: labelCriteria,
                    type: typeCriteria,
                    input: null,
                    operator: _this.conditionOfTypes[typeCriteria][0],
                    value: null
                });
                _this.renderInputsByTypes(typeCriteria, target);
            }
            else if (dataAction == "select-operator") {
                var operatorValue = target.options[target.selectedIndex].value;
                _this.handleOperatorValue(row, operatorValue, index, typeCriteria);
                _this.updateResults();
            }
            else if (dataAction == "select-value") {
                var operatorValue = typeCriteria == 'boolean' ? 'equal' : _this.getSelectedOperator(row);
                _this.handleSelectValue(row, operatorValue, index);
                _this.updateResults();
            }
        });
    };
    /**
     * Add result list to selected element on dom.
     * @param list
     */
    TreeQuery.prototype.renderResults = function (list) {
        if (this.containerSelector) {
            var labels_1 = this.options.rules.map(function (rule) { return rule.label; });
            var container = document.querySelector(this.containerSelector);
            if (container) {
                var htmlList = list.map(function (data) {
                    var template = "<div class=\"item-row\">";
                    for (var i = 0; i < labels_1.length; i++) {
                        template = template + "<div class=\"item-label " + labels_1[i] + "\">" + data[labels_1[i]] + "</div>";
                    }
                    return template = template + "</div>";
                });
                this.removeChilds(container);
                container.insertAdjacentHTML('afterbegin', htmlList.join(''));
            }
        }
    };
    /**
     * Update results on filter change. results will update only if all branches valid.
     * validation run only on rules with defined operator.
     * rules without operator and value ignored.
     */
    TreeQuery.prototype.updateResults = function () {
        var _this = this;
        console.log(this.validateTree(this.tree));
        if (this.originData && this.originData.length > 0 && this.validateTree(this.tree)) {
            this.filteredData = this.originData.filter(function (data) { return _this.filterData(data, _this.tree.condition, _this.tree.rules); });
            this.renderResults(this.filteredData);
            if (this.options.onResultChange) {
                this.options.onResultChange(this.filteredData);
            }
        }
    };
    /**
     * Get operator value from HTML row.
     * @param row
     * @returns {null}
     */
    TreeQuery.prototype.getSelectedOperator = function (row) {
        var operatorSelector = row.querySelector('.rule-filter-operator select');
        return operatorSelector ? operatorSelector.options[operatorSelector.selectedIndex].value : null;
    };
    /**
     * Trigger on value change event.
     * update the query tree.
     * @param row: HTML ELEMENT
     * @param operatorValue: operator value(equal, between, ...)
     * @param index
     * @param type
     */
    TreeQuery.prototype.handleSelectValue = function (row, operatorValue, index) {
        switch (operatorValue) {
            case ('between' || 'not between'): {
                this.updateTreeFilter(TREE_ACTIONS.UPDATE, index, {
                    value: this.getBetweenValue(row)
                });
                return;
            }
            default: {
                this.updateTreeFilter(TREE_ACTIONS.UPDATE, index, {
                    value: this.getInputValue(row)
                });
                return;
            }
        }
    };
    /**
     * Trigger on operator change event.
     * 1.add input html to dom 2. update the query tree.
     * @param row: HTML ELEMENT
     * @param operatorValue: operator value(equal, between, ...)
     * @param index
     * @param type
     */
    TreeQuery.prototype.handleOperatorValue = function (row, operatorValue, index, type) {
        switch (operatorValue) {
            case 'between':
            case 'not between': {
                this.addBetweenHtml(row, type);
                this.updateTreeFilter(TREE_ACTIONS.UPDATE, index, {
                    operator: operatorValue,
                    value: { min: null, max: null }
                });
                return;
            }
            case 'is empty':
            case 'is not empty': {
                this.removeValueInputFromChild(row);
                this.updateTreeFilter(TREE_ACTIONS.UPDATE, index, {
                    operator: operatorValue,
                    value: ''
                });
                return;
            }
            default: {
                this.addValueInputToChild(row, type);
                this.updateTreeFilter(TREE_ACTIONS.UPDATE, index, {
                    operator: operatorValue
                });
                return;
            }
        }
    };
    /**
     * add Html with single input on operator change.
     * @param row: HTML ELEMENT
     * @param type: text/date/number
     */
    TreeQuery.prototype.addValueInputToChild = function (row, type) {
        var isBetween = row.querySelector('.rule-filter-value .min');
        var isNotEmpty = row.querySelector('.rule-filter-value .plugin-input');
        if (isBetween || !isNotEmpty) {
            this.removeValueInputFromChild(row);
            var typeAttr = type == 'number' ? 'number' : 'text';
            var inputElem = row.querySelector('.rule-filter-value');
            inputElem.insertAdjacentHTML('afterbegin', "<input type=\"" + typeAttr + "\" value=\"\" data-action=\"select-value\" class=\"plugin-input form-control\" />");
        }
    };
    /**
     * Remove inputs from value wrapper.
     * call for update the input in dom, on operator change.
     * @param row
     */
    TreeQuery.prototype.removeValueInputFromChild = function (row) {
        var target = row.querySelector('.rule-filter-value');
        if (target) {
            this.removeChilds(target);
        }
    };
    /**
     * add Html with two inputs in case between operator selected.
     * @param row
     * @param type
     */
    TreeQuery.prototype.addBetweenHtml = function (row, type) {
        if (type === void 0) { type = "number"; }
        this.removeValueInputFromChild(row);
        var htmlInput = "<input type=\"" + type + "\" value=\"\" data-action=\"select-value\"  class=\"min plugin-input form-control\" />\n                        <input type=\"" + type + "\" value=\"\" data-action=\"select-value\"  class=\"max plugin-input form-control\" />";
        var inputElem = row.querySelector('.rule-filter-value');
        inputElem.insertAdjacentHTML('afterbegin', htmlInput);
    };
    /**
     * get value from single input
     * @param row
     * @returns {any}
     */
    TreeQuery.prototype.getInputValue = function (row) {
        var inputElem = row.querySelector('.rule-filter-value .plugin-input');
        return this.isDate(inputElem.value) ? Date.parse(inputElem.value) : inputElem.value;
    };
    /**
     * get value form inputs in case between operator selected.
     * @param row
     * @returns {any}
     */
    TreeQuery.prototype.getBetweenValue = function (row) {
        var inputElem = row.querySelector('.rule-filter-value');
        var value = {};
        value.min = inputElem.querySelector('.plugin-input.min').value;
        value.max = inputElem.querySelector('.plugin-input.max').value;
        if (this.isDate(value.min) && this.isDate(value.max)) {
            value.min = Date.parse(value.min) / 1000;
            value.max = Date.parse(value.max) / 1000;
        }
        return value;
    };
    /**
     * check value valid date.
     * @param date
     * @returns {boolean}
     */
    TreeQuery.prototype.isDate = function (date) {
        return isNaN(date) && !isNaN(new Date(date));
    };
    /**
     * Check if has class.
     * @param element
     * @param className
     * @returns {boolean}
     */
    TreeQuery.prototype.hasClass = function (element, className) {
        if (element.classList) {
            return element.classList.contains(className);
        }
        else {
            return new RegExp('(^| )' + className + '( |$)', 'gi').test(element.className);
        }
    };
    /**
     * Add active class to opened element.
     * @param element
     * @param className
     */
    TreeQuery.prototype.addClass = function (element, className) {
        if (element && element.className && element.className.indexOf(className) == -1) {
            element.className += ' ' + className;
        }
    };
    /**
     * Remove class from selected element.
     * @param element
     * @param name
     */
    TreeQuery.prototype.removeClass = function (element, name) {
        if (this.hasClass(element, name)) {
            element.className = element.className.replace(new RegExp('(\\s|^)' + name + '(\\s|$)'), ' ').replace(/^\s+|\s+$/g, '');
        }
    };
    TreeQuery.TYPES = RULE_TYPES;
    return TreeQuery;
}());
exports.default = TreeQuery;
(module).exports = TreeQuery;
var options = {
    rules: [
        { type: RULE_TYPES.BOOLEAN, label: 'category' },
        { type: RULE_TYPES.STRING, label: 'name' },
        { type: RULE_TYPES.NUMBER, label: 'price' },
        { type: RULE_TYPES.NUMBER, label: 'age' },
        { type: RULE_TYPES.DATE, label: 'created' }
    ]
};
var haim = null;
document.addEventListener("DOMContentLoaded", function (event) {
    // haim.manageActionEvents();
    document.getElementById('add-row').addEventListener('click', function (e) {
        var arr = [{
                name: 'haim',
                category: 'true',
                price: 78,
                age: 44,
                created: '10/20/2018'
            }, {
                name: 'dan',
                category: 'true',
                price: 178,
                age: 440,
                created: '11/20/2018'
            },
            {
                name: 'ron',
                category: 'false',
                price: 17,
                age: 40,
                created: '11/21/2018'
            }];
        haim = new TreeQuery(options, '.results-con', arr);
        var filter = haim.tree;
    });
});
