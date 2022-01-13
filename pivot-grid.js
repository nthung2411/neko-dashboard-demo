$(document).ready(function () {
    const prepareGridData = function (data) {
        if (!Array.isArray(data)) {
            return [];
        }
        data.forEach(function (item) { 
            item['Month'] = item.month;
            item['Day'] = item.day;
            item['Date'] = item.date;
            item['Scholar'] = item.scholarName;
            item['Investor'] = item.CustomerName;

            delete item.month;
            delete item.day;
            delete item.date;
            delete item.scholarName;
            delete item.customerName;
        })
        return data;
    };

    const onGetScholarsSuccess = function (result) {
        if (!result.ok) {
            onGetScholarsFail(result);
            return;
        }
        const pivotData = prepareGridData(result.data);

        const pivotDataSource = new kendo.data.PivotDataSource({
            columns: [
                { name: 'Month', expand: false },
                { name: 'Day', expand: true }
            ],
            rows: [
                { name: 'Scholar', expand: true },
                { name: 'Investor', expand: false },
            ],
            measures: ["Sum"],
            data: pivotData,
            schema: {
                cube: {
                    dimensions: {
                        Scholar: { caption: "All Scholars" },
                        Investor: { caption: "All Customers" },
                        Day: { caption: "All days" },
                        Month: { caption: "All months" },
                    },
                    measures: {
                        Sum: {
                            field: "amount",
                            format: "{0:n0}",
                            aggregate: function (value, state, context) {
                                return (state.accumulator || 0) + +value;
                            },
                        },
                    },
                },
            },
        });
        $("#configurator").kendoPivotConfigurator();
        $("#pivotgrid")
            .kendoPivotGrid({
                configurator: '#configurator',
                filterable: true,
                sortable: true,
                columnWidth: 200,
                height: 600,
                dataSource: pivotDataSource                
            })
            .data("kendoPivotGrid");        
    };

    const onGetScholarsFail = function (data) {
        console.error(error);
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