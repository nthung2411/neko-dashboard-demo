$(document).ready(function () {
    const prepareGridData = function (data) {
        if (!Array.isArray(data)) {
            return [];
        }
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
                { name: 'month', expand: false },
                { name: 'day', expand: true }
            ],
            rows: [
                { name: 'scholarName', expand: true },
                { name: 'customerName', expand: false },
            ],
            measures: ["Sum"],
            data: pivotData,
            schema: {
                cube: {
                    dimensions: {
                        scholarName: { caption: "All Scholars" },
                        customerName: { caption: "All Customers" },
                        day: { caption: "All days" },
                        month: { caption: "All months" },
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

        var paths = [
            //Expand CY 2005 - first dimension
            // ["[Date].[Calendar].[Calendar Year].&[2005]"],
            //Expand All Products under CY 2015 - second dimension
            // ["[Date].[Calendar].[Calendar Year].&[2005]", "[Product].[Category].[All Products]"]
            ['customerName']
        ];
        const pivotgrid = $("#pivotgrid")
            .kendoPivotGrid({
                filterable: true,
                sortable: true,
                columnWidth: 200,
                height: 600,
                dataSource: pivotDataSource,
                // dataBound: function () {
                //     const path = paths.shift();
                //     console.log(path, paths);
                //     if (path !== undefined) {
                //         this.dataSource.expandColumn(path);
                //     }
                // }
            })
            .data("kendoPivotGrid");

        $("#configurator").kendoPivotConfigurator({
            dataSource: pivotgrid.dataSource,
            filterable: true,
            sortable: true,
            height: 600,
        });
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