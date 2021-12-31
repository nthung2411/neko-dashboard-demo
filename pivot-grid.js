$(document).ready(function () {
    const prepareGridData = function (data) {
        if (!Array.isArray(data)) {
            return;
        }
        const scholars = data;
        const gridData = [];
        for (let i = 0; i < scholars.length; i++) {
            const scholar = scholars[i];
            const dailySLPs = scholar["_dailySLP"];
            if (!Array.isArray(dailySLPs)) {
                continue;
            }
            gridData.push(...dailySLPs);
        }
        gridData.forEach(function (item) {
            item.scholarName = item["scholar"]["name"];
            const date = moment(item.date).format("DD MMM yyyy");
            item.date = date;
        });
        return gridData;
    };

    const onGetScholarsSuccess = function (result) {
        if (!result.ok) {
            onGetScholarsFail(result);
            return;
        }
        const pivotData = prepareGridData(result.data);

        const pivotDataSource = new kendo.data.PivotDataSource({
            columns: [
                'customerName',
                'date'
            ],
            rows: ["scholarName"],
            measures: ["Sum"],
            data: pivotData,
            schema: {
                cube: {
                    dimensions: {
                        scholarName: { caption: "All Scholars" },
                        customerName: { caption: "All Customers" },
                        date: { caption: "All days" },
                    },
                    measures: {
                        Sum: {
                            field: "amount",
                            format: "{0:d}",
                            aggregate: function (value, state, context) {
                                return (state.accumulator || 0) + value;
                            },
                        },
                    },
                },
            },
        });

        const pivotgrid = $("#pivotgrid")
            .kendoPivotGrid({
                filterable: true,
                sortable: true,
                columnWidth: 200,
                height: 720,
                dataSource: pivotDataSource,
            })
            .data("kendoPivotGrid");

        $("#configurator").kendoPivotConfigurator({
            dataSource: pivotgrid.dataSource,
            filterable: true,
            sortable: true,
            height: 720,
        });
    };

    const onGetScholarsFail = function (data) {
        console.error(error);
    };

    $.getJSON("./env.json", function (result) {
        let url = result.useMockData
            ? "./mock/scholars.json"
            : "http://34.124.189.18:8001/v1/scholars";
        $.ajax({
            url,
            success: onGetScholarsSuccess,
            error: onGetScholarsFail,
        });
    });
});