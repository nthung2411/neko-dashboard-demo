$(function () {
    const bindDataToGrid = function (gridData) {
        var gridDataSource = new kendo.data.DataSource({
            data: gridData,
            schema: {
                model: {
                    fields: {
                        scholarId: { type: "number" },
                        scholarName: { type: "string" },
                        customerName: { type: "string" },
                        amount: { type: "number" },
                        day: { type: "string" },
                    },
                },
            },
            pageSize: 10,
            sort: {
                field: "day",
                dir: "desc",
            },
            // group on init
            // group: {
            //     field: "customerId", aggregates: [
            //         { field: "scholarId", aggregate: "count" },
            //         { field: "amount", aggregate: "sum" },
            //         { field: "amount", aggregate: "average" },
            //     ],
            //     field: "scholarId", aggregates: [
            //         { field: "customerId", aggregate: "count" },
            //         { field: "amount", aggregate: "sum" },
            //         { field: "amount", aggregate: "average" },
            //     ]
            // },
            aggregate: [
                { field: "scholarId", aggregate: "count" },
                { field: "customerName", aggregate: "count" },
                { field: "amount", aggregate: "average" },
                { field: "amount", aggregate: "sum" },
            ]
        });

        $("#ordersGrid").kendoGrid({
            dataSource: gridDataSource,
            pageable: true,
            sortable: true,
            filterable: true,
            columns: [
                {
                    field: "scholarId",
                    title: "Scholar ID",
                    width: 160,
                    aggregates: ["count"], groupHeaderColumnTemplate: "Scholars: #=count#"
                },
                {
                    field: "scholarName",
                    title: "Scholar Name",
                },
                {
                    field: "customerName",
                    title: "Customer Name",
                    width: 160,
                    aggregates: ["count"], groupHeaderColumnTemplate: "Customers: #=count#",
                },
                {
                    field: "amount",
                    title: "Amount",
                    width: 200,
                    aggregates: ["sum"], groupHeaderColumnTemplate: "Total SLP Amount: #=sum#"
                },
                {
                    field: "month",
                    title: "Month",
                    width: 200,
                    // format: "{0:dd MMMM yyyy}",
                },
                {
                    field: "day",
                    title: "Date",
                    width: 200,
                    // format: "{0:dd MMMM yyyy}",
                },
            ],
            toolbar: ["search", "excel"],
            excel: {
                fileName: "Kendo UI Grid Export.xlsx",
            },
            search: {
                fields: [
                    { name: "scholarId", operator: "eq" },
                    { name: "customerId", operator: "eq" },
                    { name: "amount", operator: "gte" },
                    { name: "scholarName", operator: "contains" },
                ],
            },
            groupable: true,
        });
    };

    const prepareGridData = function (data) {
        if (!Array.isArray(data)) {
            return [];
        }        
        return data;
    };

    const onGetScholarsSuccess = function (result) {
        console.log(result);
        if (!result.ok) {
            onGetScholarsFail(result);
            return;
        }
        const gridData = prepareGridData(result.data);
        bindDataToGrid(gridData);
    };

    const $errorMessage = $("#error-message").hide();
    const onGetScholarsFail = function (error) {
        console.error(error);
        $errorMessage.show();
    };
    $.getJSON('./env.json', function (result) {
        console.log(result)
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