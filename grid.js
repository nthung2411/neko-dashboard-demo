const renderDataSourceForInvestor = function (gridData) {
    return new kendo.data.DataSource({
        data: gridData,
        schema: {
            model: {
                fields: {
                    scholarName: { type: "string" },
                    customerName: { type: "string" },
                    amount: { type: "number" },
                    day: { type: "string" },
                    month: { type: "string" },
                },
            },
        },
        sort: {
            field: "day",
            dir: "desc",
        },
        group: [
            {
                field: "customerName",
                aggregates: [
                    { field: "amount", aggregate: "sum" },
                    { field: "amount", aggregate: "count" },
                    { field: "amount", aggregate: "average" },
                ],
            },
            {
                field: "day",
                aggregates: [
                    { field: "amount", aggregate: "sum" },
                    { field: "amount", aggregate: "count" },
                    { field: "amount", aggregate: "average" },
                ],
                dir: 'desc'
            },
        ]
    });
}

const renderDataSourceForScholar = function (gridData) {
    return new kendo.data.DataSource({
        data: gridData,
        schema: {
            model: {
                fields: {
                    scholarName: { type: "string" },
                    customerName: { type: "string" },
                    amount: { type: "number" },
                    day: { type: "string" },
                    month: { type: "string" },
                },
            },
        },
        sort: {
            field: "day",
            dir: "desc",
        },
        group: [
            {
                field: "scholarName",
                aggregates: [
                    { field: "amount", aggregate: "sum" },
                    { field: "amount", aggregate: "count" },
                    { field: "amount", aggregate: "average" },
                ],
            },
            {
                field: "day",
                aggregates: [
                    { field: "amount", aggregate: "sum" },
                    { field: "amount", aggregate: "count" },
                    { field: "amount", aggregate: "average" },
                ],
                dir: 'desc'
            },
        ]
    });
}

const prepareGridData = function (data) {
    if (!Array.isArray(data)) {
        return [];
    }
    data.forEach(item => {
        if (!item['customerName'] || item['customerName'] === '') {
            item['customerName'] = 'N/A';
        }
        if (!item['customerId'] || item['customerId'] === '') {
            item['customerId'] = 0;
        }
        if (!item['scholarName'] || item['scholarName'] === '') {
            item['scholarName'] = 'N/A';
        }
        if (!item['scholarId'] || item['scholarId'] === '') {
            item['scholarId'] = 0;
        }
    })
    return data;
};

const columnsConfig = [
    {
        field: "scholarName",
        title: "Scholar",
    },
    {
        field: "customerName",
        title: "Investor",
        width: 160,
    },
    {
        field: "amount",
        title: "SLP",
        width: 400,
        format: "{0:n0}",
        groupable: false,
        aggregates: ["sum", "average", "count"],
        groupHeaderColumnTemplate: function (e) {
            const sum = kendo.toString(e.amount['sum'], "n0");
            const count = kendo.toString(e.amount['count'], "n0");
            const avg = kendo.toString(e.amount['average'], "n0");
            return `Total: ${sum}, Count: ${count}, AVG: ${avg}`;
        }
    },
    {
        field: "month",
        title: "Month",
        width: 100
    },
    {
        field: "day",
        title: "Date",
        width: 120,
        groupable: {
            sort: {
                dir: "desc"
            }
        },
    },
];

const bindDataToGrid = function (gridDataSource) {
    $("#grid").kendoGrid({
        dataSource: gridDataSource,
        pageable: false,
        sortable: true,
        scrollable: {
            virtual: true
        },
        filterable: {
            extra: false,
            operators: {
                string: {
                    contains: "Contains",
                }
            }
        },
        columns: columnsConfig,
        toolbar: ["search", "excel"],
        excel: {
            fileName: `${moment().format('DD.MM.yyyy')}.xlsx`,
        },
        search: {
            fields: [
                "scholarName", "customerName", "day", "month"
            ]
        },
        groupable: true,
        dataBound: function () {
            const grid = this;
            const groupRows = $(".k-grouping-row");
            groupRows.each(function () {
                const element = this;
                const nextSibling = element.nextSibling;
                if (nextSibling && nextSibling.classList.contains('k-master-row')) {
                    grid.collapseGroup(this);
                }
            });
            kendo.ui.progress($('#grid'), true);
            setTimeout(() => {
                kendo.ui.progress($('#grid'), false);
            }, 800);
        },
    });
};