$(function () {
    const bindDataToGrid = function (gridData) {
        var gridDataSource = new kendo.data.DataSource({
            data: gridData,
            schema: {
                model: {
                    fields: {
                        scholarId: { type: "number" },
                        scholarName: { type: "string" },
                        customerId: { type: "number" },
                        amount: { type: "number" },
                        date: { type: "date" },
                    },
                },
            },
            pageSize: 10,
            sort: {
                field: "date",
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
                { field: "customerId", aggregate: "count" },
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
                    field: "customerId",
                    title: "Customer Id",
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
                    field: "date",
                    title: "Date",
                    width: 200,
                    format: "{0:dd MMMM yyyy}",
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
            item.date = new Date(item.date);
        });
        return gridData;
    };

    const onGetScholarsSuccess = function (result) {
        if (!result.ok) {
            onGetScholarsFail(result);
            return;
        }
        const gridData = prepareGridData(result.data);
        console.log(gridData);
        bindDataToGrid(gridData);
    };

    const $errorMessage = $("#error-message").hide();
    const onGetScholarsFail = function (error) {
        console.error(error);
        $errorMessage.show();
    };
    $.getJSON('./env.json', function (result) {
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