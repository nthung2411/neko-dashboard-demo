$(document).ready(function () {
    $("#loader").kendoLoader({
        themeColor: "secondary",
        type: "infinite-spinner",
    });
    const $loading = $(".loader").hide(); // Hide it initially
    $(document)
        .ajaxStart(function () {
            $loading.show();
        })
        .ajaxStop(function () {
            $loading.hide();
        });

    $("#menu").kendoMenu();
});