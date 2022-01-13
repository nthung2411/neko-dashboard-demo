$(function () {
    let scholarsData; //global data
    let scholarId;
    const $errorMessage = $("#error-message").hide();
    const $emptyMessage = $("#empty-message").hide();

    const bindDataToGrid = function (gridData) {
        var gridDataSource = new kendo.data.DataSource({
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
        $("#ordersGrid").kendoGrid({
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
            columns: [
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
            ],
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
                kendo.ui.progress($('#ordersGrid'), true);
                setTimeout(() => {
                    kendo.ui.progress($('#ordersGrid'), false);
                }, 800);
            },
        });
    };

    const prepareGridData = function (data) {
        if (!Array.isArray(data)) {
            return [];
        }
        data.forEach(item => {
            if (!item['customerName'] || item['customerName'] === '') {
                item['customerName'] = 'N/A';
            }
            if (!item['scholarName'] || item['scholarName'] === '') {
                item['scholarName'] = 'N/A';
            }
        })
        return data;
    };

    const onSelectInput = function (input) {
        const data = input['dataItem'];
        const filterData = scholarsData.data.filter(scholar => {
            return scholar.scholarName === data
        });
        bindDataToGrid(filterData);
    };

    const onChangeInput = function (input) {
        if (input.sender._old !== '') { return; }
        bindDataToGrid(scholarsData.data);
    }

    const bindDataForInput = function (data) {
        const raw = data.map(item => item.scholarName);
        const unique = [...new Set(raw)];
        //create AutoComplete UI component
        $("#scholar-input").kendoAutoComplete({
            dataSource: unique,
            filter: "contains",
            placeholder: "Start typing the name...",
            select: onSelectInput,
            change: onChangeInput
        });
    }

    const onGetScholarsSuccess = function () {
        const result = scholarsData;
        if (!result.ok) {
            onGetScholarsFail(result);
            return;
        }

        let gridData = [...prepareGridData(result.data)];
        if (!Number.isNaN(scholarId) && scholarId > 0) {
            gridData = gridData.filter(item => item['scholarId'] === scholarId);
        }
        if (gridData.length === 0) {
            $emptyMessage.show();
        }

        bindDataToGrid(gridData);
        bindDataForInput(gridData);
    };

    const onGetScholarsFail = function (error) {
        console.error(error);
        $errorMessage.show();
    };

    const getScholars = function () {
        const getEnvJson = $.getJSON('./env.json');
        getEnvJson.done(function (result) {
            let url = result.useMockData
                ? "./mock/scholars.json"
                : result.API_URL;
            const getScholarsAjax = $.ajax({
                url
            });
            getScholarsAjax
                .done(function (result) {
                    scholarsData = result;
                    onGetScholarsSuccess();
                })
                .error(onGetScholarsFail);
        })
    }

    const readQueryStringParams = function () {
        const urlSearchParams = new URLSearchParams(window.location.search);
        const params = Object.fromEntries(urlSearchParams.entries());
        scholarId = params['id'];
    }

    readQueryStringParams();
    getScholars();
});