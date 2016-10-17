var categoriesMgr=(function(config,functions){
    var loadedData={};

    /**
     * 创建datatable
     * @returns {*|jQuery}
     */
    function createTable(){

        var ownTable=$("#myTable").dataTable({
            "bServerSide": true,
            "bPaginate":false,
            "sAjaxSource": config.ajaxUrls.getAllCategories,
            "bInfo":true,
            "bLengthChange": false,
            "bFilter": false,
            "bSort":false,
            "bAutoWidth": false,
            "iDisplayLength":config.perLoadCounts.table,
            "sPaginationType":"full_numbers",
            "oLanguage": {
                "sUrl":config.dataTable.langLocation
            },
            "aoColumns": [
                { "mDataProp": "name"}
            ] ,
            "fnServerParams": function ( aoData ) {

            },
            "fnServerData": function(sSource, aoData, fnCallback) {

                //回调函数
                $.ajax({
                    "dataType":'json',
                    "type":"get",
                    "url":sSource,
                    "data":aoData,
                    "success": function (response) {
                        response=response.data;
                        if(response.success===false){
                            functions.ajaxReturnErrorHandler(response.error_code);
                        }else{
                            var json = {
                                "sEcho" : response.sEcho
                            };

                            json.aaData=response.aaData;
                            json.iTotalRecords = response.iTotalRecords;
                            json.iTotalDisplayRecords = response.iTotalDisplayRecords;
                            fnCallback(json);
                        }

                    }
                });
            },
            "fnFormatNumber":function(iIn){
                return iIn;
            }
        });

        return ownTable;
    }

    return {
        ownTable:null,
        createTable:function(){
            this.ownTable=createTable();
        },
        tableRedraw:function(){
            this.ownTable.fnSettings()._iDisplayStart=0;
            this.ownTable.fnDraw();
        },
        submitForm:function(form){
            var me=this;
            functions.showLoading();
            $(form).ajaxSubmit({
                dataType:"json",
                headers:{
                    "X-Requested-With":"XMLHttpRequest"
                },
                success:function(response){
                    if(response.data.success){
                        functions.hideLoading();
                        $().toastmessage("showSuccessToast",config.messages.optSuccess);
                        $(form).resetForm();
                        me.tableRedraw();
                    }else{
                        functions.ajaxReturnErrorHandler(response.data.error_code);
                    }
                },
                error:function(){
                    functions.ajaxErrorHandler();
                }
            });
        }
    }
})(config,functions);

$(document).ready(function(){

    categoriesMgr.createTable();

    $("#myForm").validate({
        ignore:[],
        rules:{
            name:{
                required:true,
                maxlength:32
            }
        },
        messages:{
            name:{
                required:config.validErrors.required,
                maxlength:config.validErrors.maxLength.replace("${max}",32)
            }
        },
        submitHandler:function(form) {
            categoriesMgr.submitForm(form);
        }
    });
});

