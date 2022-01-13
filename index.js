$(function () {
    const $errorMessage = $("#error-message").hide();
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
            }
        });
        $("#ordersGrid").kendoGrid({
            dataSource: gridDataSource,
            pageable: false,
            height: 600,
            scrollable: {
                virtual: true
            },
            sortable: true,
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
                    title: "Scholar Name",
                },
                {
                    field: "customerName",
                    title: "Customer Name",
                    width: 160,
                },
                {
                    field: "amount",
                    title: "SLP",
                    width: 200,
                    format: "{0:n0}",
                    groupable: false,
                    aggregates: ["sum"],
                    groupHeaderColumnTemplate: function (e) {
                        const format = kendo.toString(e.amount['sum'], "n0");
                        return `Total: ${format}`;
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

    const onGetScholarsSuccess = function (result) {
        if (!result.ok) {
            onGetScholarsFail(result);
            return;
        }
        const gridData = prepareGridData(result.data);
        bindDataToGrid(gridData);
    };

    const onGetScholarsFail = function (error) {
        console.error(error);
        $errorMessage.show();
    };
    $.getJSON('./env.json', function (result) {
        let url = result.useMockData
            ? "./mock/scholars.json"
            : result.API_URL;
        $.ajax({
            url,
            success: onGetScholarsSuccess,
            error: onGetScholarsFail,
        });
    });
});