$(function () {
    let scholarsData; //global data

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
            // pageSize: 10,
            sort: {
                field: "day",
                dir: "desc",
            },
            group: {
                field: "customerName", aggregates: [
                    { field: "amount", aggregate: "sum" },
                ],
            },
        });
        $("#ordersGrid").kendoGrid({
            dataSource: gridDataSource,
            pageable: false,
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
                    title: "Amount",
                    width: 120,
                    format: "{0:n0}",
                    groupable: false,
                    aggregates: ["sum"],
                    groupHeaderColumnTemplate: function (e) {
                        const format = kendo.toString(e.amount['sum'], "n0");
                        return `Total SLP: ${format}`;
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
                    width: 120
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
            return scholar.customerName === data
        });
        bindDataToGrid(filterData);
    };

    const onChangeInput = function (input) {
        if (input.sender._old !== '') { return; }
        bindDataToGrid(scholarsData.data);
    }

    const bindDataForInput = function (data) {
        const raw = data.map(item => item.customerName);
        const unique = [...new Set(raw)];
        //create AutoComplete UI component
        $("#investor-input").kendoAutoComplete({
            dataSource: unique,
            filter: "contains",
            placeholder: "Select your investor...",
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

        const gridData = prepareGridData(result.data);
        bindDataToGrid(gridData);

        bindDataForInput(result.data);
    };

    const $errorMessage = $("#error-message").hide();
    const onGetScholarsFail = function (error) {
        console.error(error);
        $errorMessage.show();
    };

    const getScholars = function (investorId) {
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

    getScholars();
});