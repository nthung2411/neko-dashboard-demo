$(function () {
    let scholarsData; //global data
    let scholarId;
    const $errorMessage = $("#error-message").hide();
    const $emptyMessage = $("#empty-message").hide();

    const onSelectInput = function (input) {
        const data = input['dataItem'];
        const filterData = scholarsData.data.filter(scholar => {
            return Number(scholar.scholarId) === Number(data.id)
        });
        const grid = $('#grid').data('kendoGrid');
        grid.setDataSource(renderDataSourceForScholar(filterData));
    };

    const onChangeInput = function (input) {
        if (input.sender._old !== '') { return; }
        const grid = $('#grid').data('kendoGrid');
        grid.setDataSource(renderDataSourceForScholar(scholarsData.data));
    }

    const bindDataForInput = function (data) {
        const inputData = [];
        const ids = data.map(item => item['scholarId']);
        const uniqueIds = [...new Set(ids)];

        uniqueIds.forEach((id) => {
            const index = ids.indexOf(id);
            const existed = inputData.filter(item => item['scholarId']).length > 0;
            if (index > -1 && !existed) {
                inputData.push({
                    name: `${data[index]['scholarName']} - ${id}`,
                    id: id
                })
            }
        });
        $("#scholar-input").kendoComboBox({
            placeholder: "Select scholar...",
            dataTextField: "name",
            dataValueField: "id",
            dataSource: inputData,
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
        if (scholarId !== undefined && Number(scholarId) > 0) {
            gridData = gridData.filter(item => item['scholarId'] === scholarId);
        }
        if (gridData.length === 0) {
            $emptyMessage.show();
        }

        bindDataToGrid(renderDataSourceForScholar(gridData));
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
        scholarId = params['id'];
    }

    readQueryStringParams();
    getScholars();
});