var addressMgr=(function(config,functions){
    var loadedData={};

    /**
     * 创建datatable
     * @returns {*|jQuery}
     */
    function createTable(){

        var ownTable=$("#myTable").dataTable({
            "bServerSide": true,
            "sAjaxSource": config.ajaxUrls.getAllAddress,
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
                { "mDataProp": "name"},
                { "mDataProp": "province",
                    "fnRender":function(oObj){
                        return oObj.aData.city;
                    }
                },
                { "mDataProp": "opt",
                    "fnRender":function(oObj){
                        return '<a href="'+oObj.aData.id+'" class="update">修改</a>';
                    }
                }
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

                            for (var i = 0, iLen = response.aaData.length; i < iLen; i++) {
                                response.aaData[i].opt="opt";
                                loadedData[response.aaData[i].id]=response.aaData[i];
                            }

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
        updateAddress:function(id){
            var data=loadedData[id];
            $("#locationId").val(id);
            $("#name").val(data.name);
            $("#city").val(data.city);
            $("#updateAddressModal").modal("show");
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
                        $("#updateAddressModal").modal("hide");
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

    addressMgr.createTable();

    $("#myTable").on("click","a.update",function(){
        addressMgr.updateAddress($(this).attr("href"));
        return false;
    });

    $("#myForm").validate({
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
            addressMgr.submitForm(form);
        }
    });
    $("#updateForm").validate({
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
            addressMgr.submitForm(form);
        }
    });
});

