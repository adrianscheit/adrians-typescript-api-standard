import {jsonExchangeCustomerAgent} from './api';
import {allJsonExchanges, Item, ItemPK, SubItem} from '../common/api';

const itemContentElement = document.getElementById('item-content');
const subItemContentElement = document.getElementById('subitem-content');

interface TableAction<T> {
    label: string;
    exec: (row: T) => void;
}

const generateActionButton = <T>(dataRow: T, action: TableAction<T>): HTMLButtonElement => {
    const button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.appendChild(document.createTextNode(action.label));
    button.addEventListener('click', () => action.exec(dataRow));
    return button;
};

const generateTable = <T>(data: T[], actions: TableAction<T>[]): HTMLElement => {
    const generateTableHead = (headers: string[]): HTMLTableRowElement => {
        const tr = document.createElement('tr');
        for (const header of headers) {
            const element = document.createElement('th');
            element.appendChild(document.createTextNode(header));
            tr.appendChild(element);
        }
        return tr;
    };
    const generateTableRow = (rowData: T, keys: (keyof T)[], actions: TableAction<T>[]): HTMLTableRowElement => {
        const tr = document.createElement('tr');
        for (const key of keys) {
            const element = document.createElement('td');
            element.appendChild(document.createTextNode(rowData[key]?.toString()));
            tr.appendChild(element);
        }
        for (const action of actions) {
            const element = document.createElement('td');
            element.appendChild(generateActionButton(rowData, action));
            tr.appendChild(element);
        }
        return tr;
    };

    const table = document.createElement('table');
    const tbody = document.createElement('tbody');
    const keys = [...new Set<keyof T>(data.flatMap((row) => <(keyof T)[]>Object.keys(row)))];
    tbody.appendChild(generateTableHead([...<string[]>keys, ...actions.map(() => '')]));
    for (const row of data) {
        const tr = generateTableRow(row, keys, actions);
        for (const action of actions) {
            tr.appendChild
        }
        tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    return table;
};

const getItems = async () => {
    const response = await jsonExchangeCustomerAgent.exchange(allJsonExchanges.item.readAll, undefined);
    console.log(response);
    const actions: TableAction<Item>[] = [
        {label: 'Load sub-items', exec: (row) => getSubItems(row)},
        {
            label: 'Update name', exec: async (row) => {
                const newValue = window.prompt('New name', row.name);
                if (newValue != null) {
                    try {
                        await jsonExchangeCustomerAgent.exchange(allJsonExchanges.item.update, {
                            ...row,
                            name: newValue
                        });
                        row.name = newValue;
                    } catch (e) {
                        alert('update failed');
                    }
                }
            }
        },
        {
            label: 'Update descritption', exec: async (row) => {
                const newValue = window.prompt('New description', row.description);
                if (newValue != null) {
                    try {
                        await jsonExchangeCustomerAgent.exchange(allJsonExchanges.item.update, {
                            ...row,
                            description: newValue
                        });
                        row.description = newValue;
                    } catch (e) {
                        alert('update failed');
                    }
                }
            }
        },
        {
            label: 'Delete', exec: async (row) => {
                try {
                    await jsonExchangeCustomerAgent.exchange(allJsonExchanges.item.delete, row);
                    getItems();
                } catch (e) {
                    alert('deletion failed');
                }
            }
        },
    ];
    itemContentElement.replaceChildren(generateTable(response, actions));
    itemContentElement.appendChild(generateActionButton(undefined, {
        label: 'Add', exec: async () => {
            const name = window.prompt('New name');
            if (name != null) {
                const description = window.prompt('New description');
                if (description != null) {
                    try {
                        await jsonExchangeCustomerAgent.exchange(allJsonExchanges.item.create, {
                            id: -1,
                            name,
                            description
                        });
                        getItems();
                    } catch (e) {
                        alert('add failed');
                    }
                }
            }
        }
    }));
    subItemContentElement.replaceChildren();
};
const getSubItems = async (itemPk: ItemPK) => {
    const response = await jsonExchangeCustomerAgent.exchange(allJsonExchanges.subItem.readByItem, itemPk);
    console.log(response);

    const actions: TableAction<SubItem>[] = [
        {
            label: 'Update name', exec: async (row) => {
                const newValue = window.prompt('New name', row.name);
                if (newValue != null) {
                    try {
                        await jsonExchangeCustomerAgent.exchange(allJsonExchanges.subItem.update, {
                            ...row,
                            name: newValue
                        });
                        row.name = newValue;
                    } catch (e) {
                        alert('update failed');
                    }
                }
            }
        },
        {
            label: 'Update descritption', exec: async (row) => {
                const newValue = window.prompt('New description', row.description);
                if (newValue != null) {
                    try {
                        await jsonExchangeCustomerAgent.exchange(allJsonExchanges.subItem.update, {
                            ...row,
                            description: newValue
                        });
                        row.description = newValue;
                    } catch (e) {
                        alert('update failed');
                    }
                }
            }
        },
        {
            label: 'Delete', exec: async (row) => {
                try {
                    await jsonExchangeCustomerAgent.exchange(allJsonExchanges.subItem.delete, row);
                    getSubItems(itemPk);
                } catch (e) {
                    alert('deletion failed');
                }
            }
        },
    ];
    subItemContentElement.replaceChildren(generateTable(response, actions));
    subItemContentElement.appendChild(generateActionButton(undefined, {
        label: 'Add', exec: async () => {
            const name = window.prompt('New name');
            if (name != null) {
                const description = window.prompt('New description');
                if (description != null) {
                    try {
                        await jsonExchangeCustomerAgent.exchange(allJsonExchanges.subItem.create, {
                            id: -1,
                            name,
                            description,
                            itemId: itemPk.id
                        });
                        getSubItems(itemPk);
                    } catch (e) {
                        alert('add failed');
                    }
                }
            }
        }
    }));
};

getItems();