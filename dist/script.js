"use strict";
;
;
class ListItem {
    constructor(text, status = 'pending') {
        this.text = text;
        this.status = status;
        this.id = ListItem.todoList.length + 1;
        this.liElement = this.createElement({ name: 'li', attrs: { 'dataset-id': this.id } });
        this.pElement = this.createElement({ name: 'p', attrs: { textContent: this.text } });
        this.optionList = [
            { className: 'btn cool move-up', text: 'Move item to the top', icon: 'fas fa-angle-double-up', clickEvent: 'top' },
            { className: 'btn cool move-up', text: 'Move item up', icon: 'fas fa-arrow-up', clickEvent: 'up' },
            { className: 'btn cool preview', text: 'Preview', icon: 'fas fa-book-open', clickEvent: 'preview' },
            { className: 'btn editor edit', text: 'Edit', icon: 'fas fa-edit', clickEvent: 'edit' },
            { className: `btn ${this.status === 'completed' || this.status === 'deleted' ? 'warning' : 'success'} complete`,
                text: this.status === 'completed' || this.status === 'deleted' ? 'Restore' : 'Complete',
                icon: this.status === 'completed' || this.status === 'deleted' ? 'fas fa-refresh' : 'fas fa-check', clickEvent: 'complete' },
            { className: `btn ${this.status === 'deleted' ? 'pure-danger' : 'danger'} delete`, text: this.status === 'deleted' ? 'Delete Permanently' : 'Move to trash', icon: 'fas fa-trash-can', clickEvent: 'delete' },
            { className: 'btn cool move-down', text: 'Move item down', icon: 'fas fa-arrow-down', clickEvent: 'down' }
        ];
        ListItem.todoList.push(this);
        ListItem.storeList();
        ListItem.renderAll();
    }
    createElement({ name, attrs, event, elementsToAppend }) {
        const element = document.createElement(name);
        const attrKeys = Object.keys(attrs);
        Object.entries(attrs).forEach(([key, value]) => {
            if (key === 'textContent')
                return element.textContent = value;
            if (key === 'innerHTML')
                return element.innerHTML = value;
            if (key === 'className')
                return element.classList.add(...value.split(' '));
            element.setAttribute(key, value);
        });
        if (event)
            element.addEventListener(event[0], e => event[1](e, event.slice(2)));
        if (elementsToAppend)
            element.append(...elementsToAppend);
        return element;
    }
    render() {
        this.liElement.classList.add(this.status);
        const options = document.createElement('div');
        options.classList.add('options');
        this.optionList.forEach(el => {
            const icon = this.createElement({ name: 'i', attrs: { className: el.icon } });
            const spanText = this.createElement({ name: 'span', attrs: { textContent: el.text } });
            if ((this.status === 'deleted' || this.status === 'completed') &&
                (el.clickEvent === 'up' || el.clickEvent === 'down' || el.clickEvent === 'edit'))
                return;
            const button = this.createElement({ name: 'button', attrs: { className: el.className, 'dataset-target-id': this.id }, elementsToAppend: [icon, spanText] });
            button.addEventListener('click', e => this.handleClickEvents(e, el.clickEvent));
            options.append(button);
        });
        this.liElement.append(this.pElement, options);
        ListItem.ulElement.append(this.liElement);
    }
    renderPreview() {
        const h2 = this.createElement({ name: 'h2', attrs: { textContent: 'List Item No: ' + this.id } });
        const p = this.createElement({ name: 'p', attrs: { textContent: this.text } });
        const options = this.createElement({ name: 'div', attrs: { className: 'options' } });
        this.optionList.filter(el => ['edit', 'complete', 'delete', 'restore'].includes(el.text.toLowerCase()))
            .forEach(el => {
            const icon = this.createElement({ name: 'i', attrs: { className: el.icon } });
            const button = this.createElement({ name: 'button', attrs: { className: el.className, 'data-target-id': this.id }, elementsToAppend: [icon, el.text] });
            button.addEventListener('click', e => this.handleClickEvents(e, el.clickEvent));
            options.append(button);
        });
        Array.from(ListItem.modalElement.children).forEach(child => child.remove());
        ListItem.modalElement.append(h2, p, options);
    }
    renderEditor() {
        const h2 = this.createElement({ name: 'h2', attrs: { textContent: `Editing List Item No: #${this.id}` } });
        const p = this.createElement({ name: 'p', attrs: { innerHTML: '<i>From: </i><br>' + this.text } });
        const toElement = this.createElement({ name: 'i', attrs: { textContent: 'To: ' } });
        const input = this.createElement({ name: 'input', attrs: { placeholder: 'Enter new todo list item', className: 'edit-input' } });
        const button = this.createElement({ name: 'button', attrs: { className: 'btn save-edit success', textContent: 'Save Changes', 'data-target-id': this.id, type: 'submit' } });
        const form = this.createElement({ name: 'form', attrs: { className: 'edit-form' }, elementsToAppend: [h2, p, toElement, input, button] });
        form.addEventListener('submit', e => {
            e.preventDefault();
            if (input.value) {
                this.edit(input.value);
                ListItem.toggleModal(false);
            }
            else
                alert('Invalid Todo List Item!');
        });
        Array.from(ListItem.modalElement.children).forEach(child => child.remove());
        ListItem.modalElement.append(form);
    }
    handleClickEvents(event, mode) {
        if (ListItem.toggleModal(true, true))
            ListItem.toggleModal(false);
        if (mode === 'preview') {
            this.renderPreview();
            ListItem.toggleModal();
        }
        else if (mode === 'edit') {
            this.renderEditor();
            ListItem.toggleModal();
        }
        else if (mode === 'top') {
            this.moveTop();
        }
        else if (mode === 'up') {
            this.moveUp();
        }
        else if (mode === 'down') {
            this.moveDown();
        }
        else if (mode === 'complete') {
            this.completeAndRestore();
        }
        else if (mode === 'delete') {
            this.delete();
        }
    }
    edit(newItem) {
        this.text = newItem;
        this.pElement.textContent = newItem;
        ListItem.update();
    }
    moveTop() {
        const ids = ListItem.todoList.map(todo => todo.id);
        ListItem.todoList = [this, ...ListItem.todoList.filter(todo => todo !== this)];
        ListItem.todoList.forEach((todo, index) => todo.id = ids[index]);
        ListItem.update();
    }
    moveUp() {
        let pos = ListItem.todoList.indexOf(this);
        if (pos === 0)
            return;
        [this.id, ListItem.todoList[pos - 1].id] = [ListItem.todoList[pos - 1].id, this.id];
        [ListItem.todoList[pos], ListItem.todoList[pos - 1]] = [ListItem.todoList[pos - 1], ListItem.todoList[pos]];
        ListItem.update();
    }
    moveDown() {
        let pos = ListItem.todoList.indexOf(this);
        if (pos === ListItem.todoList.length - 1)
            return;
        [this.id, ListItem.todoList[pos + 1].id] = [ListItem.todoList[pos + 1].id, this.id];
        [ListItem.todoList[pos], ListItem.todoList[pos + 1]] = [ListItem.todoList[pos + 1], ListItem.todoList[pos]];
        ListItem.update();
    }
    completeAndRestore() {
        this.status = this.status !== 'completed' && this.status !== 'deleted' ? 'completed' : 'pending';
        ListItem.update();
    }
    delete() {
        if (this.status === 'deleted') {
            let yesToDelete = confirm('Are you sure you want to delete this item(It can\'t be recovered)!');
            if (yesToDelete)
                ListItem.todoList = ListItem.todoList.filter(todo => todo !== this);
            this.liElement.remove();
        }
        else
            this.status = 'deleted';
        ListItem.update();
    }
    static init() {
        var _a, _b, _c, _d, _e, _f;
        (_a = document.querySelector('.add-item-form')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', e => {
            e.preventDefault();
            let addItemInput = document.querySelector('#add_item_input');
            if (addItemInput === null || addItemInput === void 0 ? void 0 : addItemInput.value) {
                new ListItem(addItemInput.value);
                addItemInput.value = '';
            }
            else
                alert('Invalid Todo List Item!');
        });
        (_b = document.querySelector('.close')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', e => {
            ListItem.toggleModal(false);
        });
        (_c = document.querySelector('#filter')) === null || _c === void 0 ? void 0 : _c.addEventListener('change', e => {
            const el = e.currentTarget;
            ListItem.filterMode = el.value;
            ListItem.renderAll();
        });
        (_d = document.querySelector('.clear-all-item')) === null || _d === void 0 ? void 0 : _d.addEventListener('click', e => ListItem.clearTodoList(true));
        (_e = document.querySelector('.empty-trash')) === null || _e === void 0 ? void 0 : _e.addEventListener('click', e => ListItem.emptyTrash(true));
        (_f = document.querySelector('.change-theme')) === null || _f === void 0 ? void 0 : _f.addEventListener('click', e => ListItem.SwitchTheme());
        ListItem.SwitchTheme();
        ListItem.update(false);
    }
    static SwitchTheme() {
        if (ListItem.currentTheme === 'light') {
            ListItem.switchThemeValues('--white-1', 'rgb(245, 245, 245)');
            ListItem.switchThemeValues('--white-2', 'rgb(235, 235, 235)');
            ListItem.switchThemeValues('--white-3', 'rgb(225, 225, 225)');
            ListItem.switchThemeValues('--black-1', 'rgb(25, 25, 25)');
            ListItem.switchThemeValues('--black-2', 'rgb(50, 50, 50)');
            ListItem.switchThemeValues('--black-3', 'rgb(75, 75, 75)');
            ListItem.currentTheme = 'dark';
        }
        else {
            ListItem.switchThemeValues('--black-1', 'rgb(245, 245, 245)');
            ListItem.switchThemeValues('--black-2', 'rgb(235, 235, 235)');
            ListItem.switchThemeValues('--black-3', 'rgb(225, 225, 225)');
            ListItem.switchThemeValues('--white-3', 'rgb(100, 100, 100)');
            ListItem.switchThemeValues('--white-2', 'rgb(50, 50, 50)');
            ListItem.switchThemeValues('--white-1', 'rgb(15, 15, 15)');
            ListItem.currentTheme = 'light';
        }
        console.log(ListItem.currentTheme);
    }
    static fetchList() {
        var _a;
        let todoList;
        try {
            todoList = JSON.parse((_a = localStorage.getItem('simpleTodoList')) !== null && _a !== void 0 ? _a : '[]');
        }
        catch (_b) {
            todoList = [];
        }
        ListItem.clearTodoList();
        todoList.forEach(todo => new ListItem(todo.text, todo.status));
    }
    static renderAll() {
        ListItem.todoList.forEach(todo => todo.liElement.remove());
        const filteredTodoList = ListItem.todoList.filter(todo => {
            if (ListItem.filterMode === 'all' || ListItem.filterMode === undefined) {
                return todo.status === 'completed' || todo.status === 'pending';
            }
            if (ListItem.filterMode === 'everything')
                return true;
            return todo.status === ListItem.filterMode;
        });
        filteredTodoList.sort((a, b) => {
            if (a.status === 'completed' && b.status !== 'completed')
                return -1;
            if (a.status !== 'completed' && b.status === 'completed')
                return 1;
            if (a.status === 'deleted' && b.status !== 'deleted')
                return 1;
            if (a.status !== 'deleted' && b.status === 'deleted')
                return -1;
            return 0;
        });
        filteredTodoList.forEach(todo => {
            todo.render();
        });
        ListItem.renderListInfo();
    }
    static storeList() {
        let todoList;
        todoList = ListItem.todoList
            .sort((a, b) => a.id - b.id)
            .map(todo => ({ text: todo.text, status: todo.status }));
        localStorage.setItem('simpleTodoList', JSON.stringify(todoList));
    }
    static update(store = true, fetch = true, render = true) {
        if (store)
            ListItem.storeList();
        if (fetch)
            ListItem.fetchList();
        if (render)
            ListItem.renderAll();
    }
    static toggleModal(show = true, check = false) {
        var _a;
        const modalElement = (_a = ListItem.modalElement.parentElement) === null || _a === void 0 ? void 0 : _a.parentElement;
        if (check)
            return !modalElement.classList.contains('hide');
        modalElement.style.transform = show ? 'scale(1)' : 'scale(0)';
    }
    static clearTodoList(safetyCheck = false) {
        if (safetyCheck) {
            let yesorno = confirm('Are you reaallly sure you want to clear EVERYTHING from the list. Once cleared, it CAN\'T BE RECOVERED!');
            if (yesorno)
                ListItem.todoList.forEach(todo => todo.liElement.remove());
            ListItem.todoList = [];
            ListItem.storeList();
            alert('Refresh to see changes');
        }
        else {
            ListItem.todoList.forEach(todo => todo.liElement.remove());
            ListItem.todoList = [];
            ListItem.storeList();
        }
        ListItem.renderListInfo();
    }
    static emptyTrash(safetyCheck = false) {
        if (safetyCheck) {
            let yesorno = confirm('You are about to empty the trash, proceed');
            if (yesorno)
                ListItem.todoList.forEach(todo => todo.status === 'deleted' ? todo.liElement.remove() : '');
            ListItem.todoList = ListItem.todoList.filter(todo => todo.status !== 'deleted');
            ListItem.storeList();
        }
        else {
            ListItem.todoList.forEach(todo => todo.liElement.remove());
            ListItem.todoList = [];
            ListItem.storeList();
        }
        ListItem.renderListInfo();
    }
    static renderListInfo() {
        const infoArea = document.querySelector('.status');
        if (ListItem.todoList.length === 0) {
            infoArea.innerHTML = '<p>You currently have no item in your todos</p>';
        }
        else {
            infoArea.style.fontSize = '.85rem';
            infoArea.innerHTML = `Pending Tasks - <b>${ListItem.todoList.filter(todo => todo.status === 'pending').length}</b>, Completed Tasks - <b>${ListItem.todoList.filter(todo => todo.status === 'completed').length}</b>, Tasks in Trash - <b>${ListItem.todoList.filter(todo => todo.status === 'deleted').length}</b>, <b>Total = ${ListItem.todoList.length}</b><br>Currently displaying list count - <b>${ListItem.ulElement.children.length}</b>`;
        }
    }
}
ListItem.todoList = [];
ListItem.ulElement = document.querySelector('#list');
ListItem.modalElement = document.querySelector('#show_area .render-area');
ListItem.filterMode = document.querySelector('#filter').value;
ListItem.currentTheme = 'light';
ListItem.switchThemeValues = (a, b, force = false) => {
    const root = document.querySelector(':root');
    const styles = getComputedStyle(root);
    if (force) {
        let temp = styles.getPropertyValue(a);
        root.style.setProperty(a, styles.getPropertyValue(b));
        root.style.setProperty(b, temp);
    }
    else
        root.style.setProperty(a, b);
};
ListItem.init();
