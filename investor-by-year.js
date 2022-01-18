$(function () {
    let scholarsData; //global data
    let customerId;
    const $errorMessage = $("#error-message").hide();
    const $emptyMessage = $("#empty-message").hide();

    const onSelectInput = function (input) {
        const data = input['dataItem'];
        const filterData = scholarsData.data.filter(scholar => {
            return Number(scholar.customerId) === Number(data.id)
        });
        const grid = $('#grid').data('kendoGrid');
        grid.setDataSource(renderDataSourceForInvestor(filterData));
    };

    const onChangeInput = function (input) {
        if (input.sender._old !== '') { return; }
        const grid = $('#grid').data('kendoGrid');
        grid.setDataSource(renderDataSourceForInvestor(scholarsData.data));
    }

    const bindDataForInput = function (data) {
        const investors = [];
        const ids = data.map(item => item['customerId']);
        const uniqueIds = [...new Set(ids)];

        uniqueIds.forEach((id) => {
            const index = ids.indexOf(id);
            const existed = investors.filter(item => item['customerId']).length > 0;
            if (index > -1 && !existed) {
                investors.push({
                    name: `${data[index]['customerName']} - ${id}`,
                    id: id
                })
            }
        });
        $("#investor-input").kendoComboBox({
            placeholder: "Select investor...",
            dataTextField: "name",
            dataValueField: "id",
            dataSource: investors,
            filter: "contains",
            suggest: true,
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

        const preparedData = [...prepareGridData(result.data)];
        let gridData = preparedData;
        if (customerId !== undefined && Number(customerId) > 0) {
            gridData = gridData.filter(item => item['customerId'] === customerId);
        }
        if (gridData.length === 0) {
            $emptyMessage.show();
        }

        bindDataToGrid(renderDataSourceForInvestor(gridData));
        bindDataForInput(preparedData);
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
        customerId = params['id'];
    }

    readQueryStringParams();
    getScholars();
});