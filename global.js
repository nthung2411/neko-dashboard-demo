$(document).ready(function () {
    $("#loader").kendoLoader({
        type: "infinite-spinner",
    });
    const $loading = $("#overlay").hide();
    $(document)
        .ajaxStart(function () {
            $loading.show();
        })
        .ajaxStop(function () {
            $loading.hide();
        });

    $("#menu").kendoMenu();
});