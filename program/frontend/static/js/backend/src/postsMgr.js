var postsMgr=(function(config,functions){
    var loadedData={};

    /**
     * 创建datatable
     * @returns {*|jQuery}
     */
    function createTable(){

        var ownTable=$("#myTable").dataTable({
            "bServerSide": true,
            "sAjaxSource": config.ajaxUrls.getAllPosts,
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
                { "mDataProp": "title"},
                { "mDataProp": "category",
                    "fnRender":function(oObj){
                        return oObj.aData.category.name;
                    }
                },
                { "mDataProp": "location",
                    "fnRender":function(oObj){
                        return oObj.aData.location.city+"/"+oObj.aData.location.name;
                    }
                },
                { "mDataProp": "longitude"},
                { "mDataProp": "latitude"},
                { "mDataProp": "opt",
                    "fnRender":function(oObj){
                        return '<a href="admin/article/'+oObj.aData.id+'/update">修改</a>&nbsp;'+
                            '<a href="'+oObj.aData.id+'" class="delete">删除</a>';
                    }
                }
            ] ,
            "fnServerParams": function ( aoData ) {
                aoData.push({
                    "name": "content_type",
                    "value":1
                },{
                    "name":"search_content",
                    "value":$("#searchContent").val()
                });
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
        deletePost:function(id){
            functions.showLoading();
            var me=this;
            $.ajax({
                url:config.ajaxUrls.deletePost.replace(":id",id),
                type:"post",
                dataType:"json",
                success:function(response){
                    if(response.data.success){
                        functions.hideLoading();
                        $().toastmessage("showSuccessToast",config.messages.optSuccess);
                        me.ownTable.fnDraw();
                    }else{
                        functions.ajaxReturnErrorHandler(response.data);
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

    postsMgr.createTable();

    $("#searchBtn").click(function(e){
        postsMgr.tableRedraw();
    });

    $("#myTable").on("click","a.delete",function(){
        postsMgr.deletePost($(this).attr("href"));
        return false;
    });
});

