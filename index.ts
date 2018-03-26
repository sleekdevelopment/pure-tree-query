/**
 * Created by hailevi on 3/10/18.
 */

/**
 * Rule types.
 * @type {{STRING: string; NUMBER: string; BOOLEAN: string; DATE: string}}
 */
const RULE_TYPES = {
    STRING: 'string',
    NUMBER: 'number',
    BOOLEAN: 'boolean',
    DATE: 'date'
}

/**
 * Tree actions
 * @type {{ADD: string; REMOVE: string; UPDATE: string}}
 */
const TREE_ACTIONS = {
    ADD: "TREE_ACTIONS:ADD",
    REMOVE: "TREE_ACTIONS:REMOVE",
    UPDATE: "TREE_ACTIONS:UPDATE"
}

/**
 * Operator.
 * @type {{AND: string; OR: string}}
 */
const OPERATOR = {
    AND: 'AND',
    OR: 'OR'
};

/**
 * Rules to add to criteria select box.
 * rules label should match items list attributes.
 */
interface Rule {
    type: string,
    label: string
}


interface BRANCH {
    id?: string
}
/**
 * Rule type.
 */
interface TREE_RULE  extends BRANCH {
    id?: string,
    field?: string | null,
    type?: string | null
    input?: string | null,
    operator?: string | null,
    value?: any

}

/**
 * Group structure.
 */
interface TREE_RULE_GROUP extends BRANCH {
    condition: string,
    rules: (TREE_RULE_GROUP | TREE_RULE)[],
    id?: string
}

/**
 * Query Tree structure.
 */
interface TreeQueryState extends BRANCH {
    condition?: string | null;
    id?: string;
    rules?: (TREE_RULE_GROUP | TREE_RULE)[];
    valid?: boolean;
}

/**
 * Query Tree Options Structure.
 */
interface TreeQueryOptions {
    rules?: Rule[],
    onCreateRule?: Function,
    onCreateGroup?: Function,
    onDestroy?: Function,
    onResultChange?: Function
}

class TreeQuery {
    static TYPES = RULE_TYPES;
    private tree: TreeQueryState;
    public conditionOfTypes:{[key: string] : string[]};
    public options: TreeQueryOptions;
    public originData: any[];
    public filteredData: any[];
    public containerSelector: string;
    public containerRef: HTMLElement;
    constructor(options: TreeQueryOptions, containerSelector?: string, data: any[] = []) {
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
    initTree() {
        this.tree = {
            condition: OPERATOR.AND,
            id: '0',
            rules: [],
            valid: true
        }
    }

    /**
     * Get query tree
     * @returns {TreeQueryState|{}}
     */
    getQuery() {
        return this.tree
    }

    /**
     * Load new list to Query tree.
     * @param data properties need to be equal to criteria options.
     */
    setData(data: any[]) {
        this.originData = data;
        this.filteredData = data;
    }

    /**
     * check if rule field exist on tested item.
     * @param label
     * @param item
     * @returns {any}
     */
    checkIfLabelExist(label: string, item: any) {
        return item && item[label];
    }

    /**
     * Logic check of string operators.
     * @param rule
     * @param item
     * @returns {any}
     */
    stringRuleHandler(rule: TREE_RULE, item: any) {
        switch (rule.operator) {
            case 'equal': {
                return this.checkIfLabelExist(rule.field, item) && item[rule.field] == rule.value;
            }
            case 'not equal' : {
                return !this.checkIfLabelExist(rule.field, item) || item[rule.field] != rule.value;
            }
            case 'begins with' : {
                return this.checkIfLabelExist(rule.field, item) && item[rule.field].startsWith(rule.value);
            }
            case 'not begins with' : {
                return !this.checkIfLabelExist(rule.field, item) || !item[rule.field].startsWith(rule.value);
            }
            case 'contains' : {
                return this.checkIfLabelExist(rule.field, item) && item[rule.field].includes(rule.value);
            }
            case 'not contains' : {
                return !this.checkIfLabelExist(rule.field, item) || !item[rule.field].includes(rule.value);
            }
            case 'end with' : {
                return this.checkIfLabelExist(rule.field, item) && item[rule.field].endsWith(rule.value);
            }
            case 'not end with' : {
                return !this.checkIfLabelExist(rule.field, item) || !item[rule.field].endsWith(rule.value);
            }
            case 'is empty' : {
                return this.checkIfLabelExist(rule.field, item) && item[rule.field].length == 0;
            }
            case 'is not empty' : {
                return this.checkIfLabelExist(rule.field, item) && item[rule.field].length > 0;
            }

            default: return false;
        }
    }

    /**
     * Logic check of number operators.
     * @param rule
     * @param item
     * @returns {any}
     */
    numberRuleHandler(rule: TREE_RULE, item: any) {
        try {
            switch (rule.operator) {
                case 'equal': {
                    return this.checkIfLabelExist(rule.field, item) && parseInt(item[rule.field]) == parseInt(rule.value);
                }
                case 'not equal' : {
                    return !this.checkIfLabelExist(rule.field, item) || parseInt(item[rule.field]) != parseInt(rule.value);
                }
                case 'less' : {
                    return this.checkIfLabelExist(rule.field, item) && parseInt(item[rule.field]) < parseInt(rule.value);
                }
                case 'less or equal' : {
                    return this.checkIfLabelExist(rule.field, item) && parseInt(item[rule.field]) <= parseInt(rule.value);
                }
                case 'greater' : {
                    return this.checkIfLabelExist(rule.field, item) && parseInt(item[rule.field]) > parseInt(rule.value);
                }
                case 'greater or equal' : {
                    return this.checkIfLabelExist(rule.field, item) && parseInt(item[rule.field]) >= parseInt(rule.value);
                }
                case 'between' : {
                    return this.checkIfLabelExist(rule.field, item) && parseInt(item[rule.field]) < parseInt(rule.value.max) && parseInt(item[rule.field]) > parseInt(rule.value.min);
                }
                case 'not between' : {
                    return !this.checkIfLabelExist(rule.field, item) || !(parseInt(item[rule.field]) < parseInt(rule.value.max) && parseInt(item[rule.field]) > parseInt(rule.value.min));
                }
                case 'is empty' : {
                    return this.checkIfLabelExist(rule.field, item) && item[rule.field].toString().trim().length == 0;
                }
                case 'is not empty' : {
                    return this.checkIfLabelExist(rule.field, item) && item[rule.field].toString().trim().length > 0;
                }
                default: return false;
            }
        } catch (e) {
            console.log(e);
            return false;
        }
    }

    /**
     * Logic check of date operators.
     * @param rule
     * @param item
     * @returns {any}
     */
    dateRuleHandler(rule: TREE_RULE, item: any) {
        let date = this.checkIfLabelExist(rule.field, item) && this.isDate(item[rule.field])
            ? Date.parse(item[rule.field]) / 1000 : null;

        switch (rule.operator) {
            case 'equal': {
                return this.checkIfLabelExist(rule.field, item) && item[rule.field] == rule.value;
            }
            case 'not equal' : {
                return !this.checkIfLabelExist(rule.field, item) || !(item[rule.field] != rule.value);
            }
            case 'before' : {
                return date && date < parseInt(rule.value);
            }
            case 'before or equal' : {
                return date && date <= parseInt(rule.value);
            }
            case 'after' : {
                return date && date > parseInt(rule.value);
            }
            case 'after or equal' : {
                return date && date >= parseInt(rule.value);
            }
            case 'between' : {
                return date && date < parseInt(rule.value.max) && date > parseInt(rule.value.min);
            }
            case 'not between' : {
                return !date || !(date < parseInt(rule.value.max) && date > parseInt(rule.value.min));
            }
            case 'is empty' : {
                return this.checkIfLabelExist(rule.field, item) && item[rule.field].toString().trim().length == 0;
            }
            case 'is not empty' : {
                return this.checkIfLabelExist(rule.field, item) && item[rule.field].toString().trim().length > 0;
            }
            default: return false;
        }
    }

    /**
     * check if item pass boolean condition
     * @param rule
     * @param item
     * @returns {any|boolean}
     */
    booleanRuleHandler(rule: TREE_RULE, item: any) {
        return this.checkIfLabelExist(rule.field, item) && item[rule.field] == rule.value;
    }

    /**
     * Select function by type to check if data pass rule
     * @param rule
     * @param data
     * @returns {boolean}
     */
    validationRuleHandler(rule: TREE_RULE, item: any[]) {
        if(rule.type == 'string') return this.stringRuleHandler(rule, item);
        else if(rule.type == 'number') return this.numberRuleHandler(rule, item);
        else if(rule.type == 'date') return this.dateRuleHandler(rule, item);
        else if(rule.type == 'boolean') return this.booleanRuleHandler(rule, item);
        else return this.stringRuleHandler(rule, item);
    }


    /**
     * Recursive function for decide if item pass query.
     * @param item
     * @param condition
     * @param rules
     * @returns {boolean}
     */
    filterData(item: any, condition: string = "AND", rules: any[] = []):boolean  {
        let con = [];
            for(let i = 0; i < rules.length; i++) {
                if(rules[i].rules) {
                    con.push(this.filterData(item, rules[i].condition, rules[i].rules));
                } else if(rules[i] && rules[i].field && rules[i].type && rules[i].operator) {
                    con.push(this.validationRuleHandler(rules[i], item));
                }
            }
        console.log(con);
        return con.length == 0 ||condition == "AND"  ? con.every((c)=> c) : con.some((c)=> c);
    }

    /**
     * Return rule group init by index.
     * @param index
     * @returns {{id: any, condition: string, rules: [{id: any, field: null, type: null, input: null, operator: null, value: null}]}}
     */
    getDefaultGroupBranch(index: string) : TREE_RULE_GROUP {
        return {
            id: index,
            condition: OPERATOR.AND,
            rules: [this.getDefaultRule(`${index}_0`)]
        }
    }

    /**
     * Return Default Rule init by index.
     * @param index
     * @returns {{id: any, field: null, type: null, input: null, operator: null, value: null}}
     */
    getDefaultRule(index: string): TREE_RULE {
        return {
            id: index,
            field: null,
            type: null,
            input: null,
            operator: null,
            value: null
        }
    }

    /**
     * Run once on new query created
     * Set default group with rule amd update the tree.
     */
    defaultFilter(): void {
        document.querySelector('#criteria-container').insertAdjacentHTML('beforeend', `<ul class="root-ul">${this.addGroup('0')}</ul>`);
        this.updateTreeFilter(TREE_ACTIONS.ADD, '0', this.getDefaultRule('0_0'));
        this.renderResults(this.originData);
    }


    /**
     * Validation function for number/date type.
     * @param rule
     * @returns {any}
     */
    validateNumberOrDate(rule: TREE_RULE): boolean {
        switch (rule.operator) {
            case 'between': case 'not between': {
                return rule && rule.value && rule.value.min && rule.value.max &&
                    !isNaN(rule.value.min) && !isNaN(rule.value.max) && rule.value.min < rule.value.max;
            }
            case 'is empty':
            case 'is not empty': {
                return !rule.value || rule.value.length == 0;
            }
           default: return rule && rule.value && !isNaN(rule.value);
        }
    }

    /**
     * select validation for rule operator
     * @param rule
     * @returns {boolean}
     */
    validateString(rule: TREE_RULE): boolean {
        switch (rule.operator) {
            case 'is empty':
            case 'is not empty': {
                return !rule.value || rule.value.length == 0;
            }
            default: return rule.value && rule.value.length > 0;
        }
    }

    /**
     * Select validation function for rule type.
     * @param rule
     * @returns {any}
     */
    checkIfRuleValid(rule: TREE_RULE): boolean {
        switch (rule.type) {
            case RULE_TYPES.STRING:
            case RULE_TYPES.BOOLEAN: {
              return this.validateString(rule)
            }
            case RULE_TYPES.NUMBER:
            case RULE_TYPES.DATE: {
               return this.validateNumberOrDate(rule);
            }
        }
    }

    /**
     * Mark rule input value in red in case operator is set and value missing.
     * @param rule
     */
    markAsError(rule: TREE_RULE): void {
       let invalidRule = this.containerRef.querySelector(`[data-index="${rule.id}"]`);
       this.addClass(invalidRule, 'invalid-rule');
    }

    /**
     * Remove invalid class from input in case input became valid.
     * @param rule
     */
    markAsValid(rule: TREE_RULE): void {
        let invalidRule = this.containerRef.querySelector(`[data-index="${rule.id}"]`);
        this.removeClass(invalidRule, 'invalid-rule');
    }

    /**
     * Recursive function for check if filter valid.
     * @param branch
     * @returns {boolean}
     */
    validateTree(branch: any): boolean {
        let isRowsValid = [];
        for(let i = 0; i < branch.rules.length; i++) {
            if(branch.rules[i] && branch.rules[i].rules) {
                isRowsValid.push(this.validateTree(branch.rules[i]));
            } else if(branch[i] && branch[i].field && branch[i].type && branch[i].operator) {
                let isValid = this.checkIfRuleValid(branch.rules[i]);
                   //if branch invalid(missing required value)
                   if(!isValid) this.markAsError(branch.rules[i]);
                   else this.markAsValid(branch.rules[i]);
                isRowsValid.push(isValid);
                isRowsValid.push(this.checkIfRuleValid(branch.rules[i]));
            }
        }
        return isRowsValid.every((e) => e);
    }

    /**
     * Get index of parent child.
     * We use this function on delete rule/group.
     * @param index
     * @returns {string}
     */
    getParentIndex(index: string): string {
        let tmpIndex = index.lastIndexOf('_');
        return index != '0'  ? index.substring(0, tmpIndex) : '0';

    }

    /**
     * Recursive function for finding branch by id.
     * @param index
     * @param branch
     * @returns {TREE_RULE | TREE_RULE_GROUP}
     */
    findBranchById(index: string, branch: any = null): TREE_RULE_GROUP | TREE_RULE  {
        branch = !branch || index == '0' ? this.tree : branch;
        if (branch.id == index) return branch;
        else {
            let result = null;
            for (let i = 0; i < branch.rules.length; i++) {
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
    }

    /**
     * Manage filter state. update on  every change in query builder.
     * @param action
     * @param index
     * @param child
     */
    updateTreeFilter(action: string, index: string, child: any = null): void {
        if (action == TREE_ACTIONS.ADD && child != null) {
            let target: any = this.findBranchById(index);
            target.rules.push(child);
        } else if (action == TREE_ACTIONS.REMOVE) {
            let parentIndex = this.getParentIndex(index);
            let target: any = this.findBranchById(parentIndex);
            for (let i = 0; i < target.rules.length; i++) {
                if (target.rules[i].id == index) {
                    target.rules.splice(i, 1);
                }
            }
        } else if (action == TREE_ACTIONS.UPDATE) {
            let parentIndex = this.getParentIndex(index);
            let target: any = this.findBranchById(parentIndex);
            if(index == "0") {
                target.condition = child.condition;
            } else {
                for (let i = 0; i < target.rules.length; i++) {
                    if (target.rules[i].id == index) {
                        target.rules[i] = (<any>Object).assign({}, target.rules[i], child)
                    }
                }
            }
        }
        console.log(this.tree);
    }

    /**
     * Remove all children from selected element.
     * @param node
     */
    removeChilds(node : Element): void {
        let last;
        while (last = node.lastChild) node.removeChild(last);
    }

    /**
     * Init operator list by type.
     */
    initConditionOfTypes(): void {
        this.conditionOfTypes = {};
        this.conditionOfTypes[RULE_TYPES.STRING] = ['equal', 'not equal', 'begins with', 'not begins with', 'contains', 'not contains', 'end with', 'not end with', 'is empty', 'is not empty'];
        this.conditionOfTypes[RULE_TYPES.NUMBER] = ['equal', 'not equal', 'less', 'less or equal', 'greater', 'greater or equal', 'between', 'not between', 'is empty', 'is not empty'];
        this.conditionOfTypes[RULE_TYPES.DATE]   = ['between', 'not between', 'after', 'after or equal', 'before','before or equal', 'equal', 'not equal', 'is empty', 'is not empty'];
        this.conditionOfTypes[RULE_TYPES.BOOLEAN] = ['true', 'false'];
    }

    /**
     * Group Template. run on add Rule clicked.
     * @param index
     * @returns {string}
     */
    addRule(index: string): string {
        let labels = this.options.rules.map((rule) => `<option value="${rule.type}">${rule.label}</option>`);
        return `<li class="rule" data-index="${index}">
                    <div class="delete-rule">
                        <button type="button" class="btn btn-xs btn-danger" data-action="delete-rule">
                            Delete
                        </button>
                    </div>
                    <div class="rule-filter-criteria">
                        <select class="listen-to-change form-control" data-action="select-criteria">
                            <option value="---">---</option>
                            ${labels}
                        </select>
                    </div>
                    <div class="rule-filter-operator"></div>
                    <div class="rule-filter-value"></div>
                </li>`;
    }

    /**
     * Group Template. run on add group clicked.
     * @param index
     * @returns {string}
     */
    addGroup(index: string): string {
        return `<li class="rule rule-group" data-index="${index}">
                    <dl>
                        <dt class="criteria-panel">
                            <div class="left">
                                <label data-id="${index}" data-action="add-connection" data-value="${OPERATOR.AND}" class="btn active-operator operator btn-primary">AND</label>
                                <label data-id="${index}" data-action="add-connection" data-value="${OPERATOR.OR}" class="btn operator btn-primary">OR</label>
                            </div>
                            <div class="right">
                                <div class="btn-group pull-right group-actions">
                                    <button type="button" class="btn btn-xs btn-success" data-action="add-rule">
                                        Add rule
                                    </button>
                                    <button type="button" class="btn btn-xs btn-success" data-action="add-group">
                                        Add group
                                    </button>
                                     <button type="button" class="btn btn-xs btn-danger" data-action="delete-group">
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </dt>
                        <dd>
                            <ul class="rules-list">
                                ${this.addRule(`${index}_0`)}
                            </ul>
                        </dd>
                    </dl>
                </li>`;
    }

    /**
     * Decide which inputs to render depend on type.
     * @param option
     * @param target
     */
    renderInputsByTypes(option: string, target: HTMLElement): any {
        switch (option) {
            case RULE_TYPES.STRING : {
                this.renderSelectAndInput(target, this.conditionOfTypes[RULE_TYPES.STRING], 'text');
                return;
            }
            case RULE_TYPES.NUMBER : {
                this.renderSelectAndInput(target, this.conditionOfTypes[RULE_TYPES.NUMBER], 'number');
                return;
            }
            case RULE_TYPES.BOOLEAN : {
                this.renderInputsForBoolean(target);
                return;
            }
            case RULE_TYPES.DATE: {
                this.renderSelectAndInput(target, this.conditionOfTypes[RULE_TYPES.DATE], 'date');
                return;
            }
        }
    }

    /**
     * On type text/date/number render select box with operators and input depends on selected operator.
     * By default first operator in list will be selected.
     * @param target
     * @param typeOptions
     * @param type
     */
    renderSelectAndInput(target: HTMLElement, typeOptions: any, type: string = 'text'): void {
        const options: string[] = typeOptions.map((operator: string) => `<option value="${operator}">${operator}</option>`);
        let rowElem = target.closest('.rule');
        let operatorElem = rowElem.querySelector('.rule-filter-operator');
        let inputElem = rowElem.querySelector('.rule-filter-value');
        this.removeChilds(operatorElem);
        this.removeChilds(inputElem);
        operatorElem.insertAdjacentHTML('afterbegin', `<select class="listen-to-change form-control" data-action="select-operator">${options.join('')}</select>`);
        inputElem.insertAdjacentHTML('afterbegin', `<input type="${type}" value="" data-action="select-value" class="plugin-input form-control" />`);
    }

    /**
     * On select criteria of type boolean. render radio button with true/false
     * @param target
     */
    renderInputsForBoolean(target: HTMLElement): void {
        let checkbox = this.conditionOfTypes[RULE_TYPES.BOOLEAN].map((value) => `<label><input style="height: auto !important;" class="plugin-input listen-to-change" data-action="select-value" type="radio" name="boolean" value="${value}">${value}</label>`).join('');
        let rowElem = target.closest('.rule');
        let booleanElem = rowElem.querySelector('.rule-filter-operator');
        let valueElem = rowElem.querySelector('.rule-filter-value');
        this.removeChilds(booleanElem);
        this.removeChilds(valueElem);
        valueElem.insertAdjacentHTML('afterbegin', checkbox);
    }


    /**
     * Handle Add/Delete Group/Rule
     */
    treeQueryClickListener(): void {
        let queryContainer = document.getElementById('criteria-container');
        queryContainer.addEventListener('click', (el) => {
            let target = <any>el.target;
            let action = target.getAttribute('data-action');
            let parent = target.closest('.rule-group');
            //Add rule or group.
            if (action == 'add-rule' || action == 'add-group') {
                let rulesList = parent.querySelector('dd .rules-list');
                let index = parent.getAttribute('data-index');
                let template = action == 'add-group' ? this.addGroup(`${index}_${rulesList.childElementCount}`) : this.addRule(`${index}_${rulesList.childElementCount}`);
                rulesList.insertAdjacentHTML('beforeend', template);
                let branch = action == 'add-group'
                    ? this.getDefaultGroupBranch(`${index}_${rulesList.childElementCount - 1}`) : this.getDefaultRule(`${index}_${rulesList.childElementCount - 1}`);
                this.updateTreeFilter(TREE_ACTIONS.ADD, index, branch);

                //Delete rule or group.
            } else if (action == 'delete-rule' || action == 'delete-group') {
                let child = target.closest('li.rule');
                let id = child.getAttribute('data-index');
                this.removeChilds(child);
                child.remove();
                this.updateTreeFilter(TREE_ACTIONS.REMOVE, id);
            //Update condition on group of rules.
            } else if(action == 'add-connection') {
                let connections: any[] = parent.querySelector('.criteria-panel').querySelectorAll('.operator');
                console.log(connections);
                connections.forEach((con) => this.removeClass(con, 'active-operator'));
                this.addClass(target, 'active-operator');
                let index = target.getAttribute('data-id');
                let condition = target.getAttribute('data-value');
                this.updateTreeFilter(TREE_ACTIONS.UPDATE, index, {
                    condition: condition
                });
                this.updateResults();
            }
        });
    }

    /**
     * Handle change event on criteria and operator and value.
     * listener set on main container to reduce listeners and handle dynamic elements.
     */
    treeQueryChangeListener(): void {
        let queryContainer = document.getElementById('criteria-container');
        queryContainer.addEventListener('change', (el) => {

            //changed element
            let target: any = el.target;

            let dataAction = target.getAttribute('data-action');

            //select parent child.
            let row = target.closest('li.rule');
            let index = row.getAttribute('data-index');

            let criteriaSelect = row.querySelector('.rule-filter-criteria select');
            let typeCriteria = criteriaSelect.options[criteriaSelect.selectedIndex].value;
            let labelCriteria = criteriaSelect.options[criteriaSelect.selectedIndex].label;


            if (dataAction == "select-criteria") {

                this.updateTreeFilter(TREE_ACTIONS.UPDATE, index, {
                    field: labelCriteria,
                    type: typeCriteria,
                    input: null,
                    operator: this.conditionOfTypes[typeCriteria][0],
                    value: null
                });
                this.renderInputsByTypes(typeCriteria, target);

            } else if(dataAction == "select-operator") {

                let operatorValue = target.options[target.selectedIndex].value;
                this.handleOperatorValue(row, operatorValue, index, typeCriteria);
                this.updateResults();

            } else if(dataAction == "select-value") {

                let operatorValue = typeCriteria == 'boolean' ? 'equal' : this.getSelectedOperator(row);
                this.handleSelectValue(row, operatorValue, index);
                this.updateResults();
            }
        });
    }

    /**
     * Add result list to selected element on dom.
     * @param list
     */
    renderResults(list: any[]): void {
        if(this.containerSelector) {
            let labels = this.options.rules.map((rule)=> rule.label);
            let container = document.querySelector(this.containerSelector);
            if(container) {
                let htmlList = list.map((data)=> {
                    let template = `<div class="item-row">`;
                    for(let i = 0; i < labels.length; i++) {
                        template = `${template}<div class="item-label ${labels[i]}">${data[labels[i]]}</div>`;
                    }
                    return template = `${template}</div>`;
                });
                this.removeChilds(container);
                container.insertAdjacentHTML('afterbegin', htmlList.join(''));
            }
        }
    }

    /**
     * Update results on filter change. results will update only if all branches valid.
     * validation run only on rules with defined operator.
     * rules without operator and value ignored.
     */
    updateResults(): void {
        console.log(this.validateTree(this.tree));
        if(this.originData && this.originData.length > 0 && this.validateTree(this.tree)) {
            this.filteredData = this.originData.filter((data)=> this.filterData(data, this.tree.condition, this.tree.rules));
            this.renderResults(this.filteredData);
            if(this.options.onResultChange) {
                this.options.onResultChange(this.filteredData);
            }
        }
    }

    /**
     * Get operator value from HTML row.
     * @param row
     * @returns {null}
     */
    getSelectedOperator(row : HTMLElement): any {
      let operatorSelector: any = row.querySelector('.rule-filter-operator select');
       return operatorSelector ?  operatorSelector.options[operatorSelector.selectedIndex].value : null;
    }

    /**
     * Trigger on value change event.
     * update the query tree.
     * @param row: HTML ELEMENT
     * @param operatorValue: operator value(equal, between, ...)
     * @param index
     * @param type
     */
    handleSelectValue(row: HTMLElement, operatorValue: string, index: string): any {
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
    }

    /**
     * Trigger on operator change event.
     * 1.add input html to dom 2. update the query tree.
     * @param row: HTML ELEMENT
     * @param operatorValue: operator value(equal, between, ...)
     * @param index
     * @param type
     */
    handleOperatorValue(row: HTMLElement, operatorValue: string, index?: string, type?: string): any {
        switch (operatorValue) {
            case 'between':
            case 'not between' :{
                this.addBetweenHtml(row, type);
                this.updateTreeFilter(TREE_ACTIONS.UPDATE, index, {
                    operator: operatorValue,
                    value: {min: null, max: null}
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
    }

    /**
     * add Html with single input on operator change.
     * @param row: HTML ELEMENT
     * @param type: text/date/number
     */
    addValueInputToChild(row: HTMLElement, type: string): void {
        let isBetween = row.querySelector('.rule-filter-value .min');
        let isNotEmpty = row.querySelector('.rule-filter-value .plugin-input');
        if(isBetween || !isNotEmpty) {
            this.removeValueInputFromChild(row);
            let typeAttr = type == 'number' ? 'number' : 'text';
            let inputElem = row.querySelector('.rule-filter-value');
            inputElem.insertAdjacentHTML('afterbegin', `<input type="${typeAttr}" value="" data-action="select-value" class="plugin-input form-control" />`);
        }
    }

    /**
     * Remove inputs from value wrapper.
     * call for update the input in dom, on operator change.
     * @param row
     */
    removeValueInputFromChild(row: HTMLElement): void {
       let target: any =  row.querySelector('.rule-filter-value');
       if(target) {
           this.removeChilds(target);
       }
    }


    /**
     * add Html with two inputs in case between operator selected.
     * @param row
     * @param type
     */
    addBetweenHtml(row: HTMLElement, type: string = "number"): void {
      this.removeValueInputFromChild(row);
      let  htmlInput = `<input type="${type}" value="" data-action="select-value"  class="min plugin-input form-control" />
                        <input type="${type}" value="" data-action="select-value"  class="max plugin-input form-control" />`;
        let inputElem = row.querySelector('.rule-filter-value');
        inputElem.insertAdjacentHTML('afterbegin', htmlInput);
    }

    /**
     * get value from single input
     * @param row
     * @returns {any}
     */
    getInputValue(row: HTMLElement): any {
        let inputElem: any = row.querySelector('.rule-filter-value .plugin-input');
        return this.isDate(inputElem.value) ? Date.parse(inputElem.value) : inputElem.value;
    }

    /**
     * get value form inputs in case between operator selected.
     * @param row
     * @returns {any}
     */
    getBetweenValue(row: HTMLElement): any {
        let inputElem: any = row.querySelector('.rule-filter-value');
        let value: any = {};
        value.min = inputElem.querySelector('.plugin-input.min').value;
        value.max = inputElem.querySelector('.plugin-input.max').value;
        if(this.isDate(value.min) && this.isDate(value.max)) {
            value.min = Date.parse(value.min) / 1000;
            value.max = Date.parse(value.max) / 1000;
        }
        return value;
    }

    /**
     * check value valid date.
     * @param date
     * @returns {boolean}
     */
    isDate(date: any): boolean {
        return isNaN(date) && !isNaN(<any>new Date(date));
    }


    /**
     * Check if has class.
     * @param element
     * @param className
     * @returns {boolean}
     */
    hasClass(element: Element, className: string): boolean {
        if (element.classList) {
            return element.classList.contains(className);
        } else {
            return new RegExp('(^| )' + className + '( |$)', 'gi').test(element.className);
        }
    }

    /**
     * Add active class to opened element.
     * @param element
     * @param className
     */
    addClass(element: Element, className: string): void {
        if (element && element.className && element.className.indexOf(className) == -1) {
            element.className += ' ' + className;
        }
    }

    /**
     * Remove class from selected element.
     * @param element
     * @param name
     */
    removeClass(element: Element, name: string): void {
        if (this.hasClass(element, name)) {
            element.className = element.className.replace(new RegExp('(\\s|^)' + name + '(\\s|$)'), ' ').replace(/^\s+|\s+$/g, '');
        }
    }
}

export default TreeQuery
declare var module: any;
(module).exports = TreeQuery;

// let options: any = {
//     rules: [
//         {type: RULE_TYPES.BOOLEAN,label: 'category'},
//         {type: RULE_TYPES.STRING, label: 'name'},
//         {type: RULE_TYPES.NUMBER, label: 'price'},
//         {type: RULE_TYPES.NUMBER, label: 'age'},
//         {type: RULE_TYPES.DATE,   label: 'created'}
//     ]
// };
// let haim = null;
// document.addEventListener("DOMContentLoaded", function (event) {
//     // haim.manageActionEvents();
//     document.getElementById('add-row').addEventListener('click', (e)=> {
//        let arr =[{
//            name: 'haim',
//            category: 'true',
//            price: 78,
//            age: 44,
//            created: '10/20/2018'
//        }, {
//            name: 'dan',
//            category: 'true',
//            price: 178,
//            age: 440,
//            created: '11/20/2018'
//        },
//        {
//            name: 'ron',
//            category: 'false',
//            price: 17,
//            age: 40,
//            created: '11/21/2018'
//        }];
//         haim = new TreeQuery(options, '.results-con', arr);
//         let filter = haim.tree;
//     })
// });
