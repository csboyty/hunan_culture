/**
 * Created with JetBrains WebStorm.
 * User: ty
 * Date: 14-2-12
 * Time: 上午10:41
 * To change this template use File | Settings | File Templates.
 */
$(document).ready(function(){

    if(postId){
        zyup.getPostAssets(postId);
    }

    //拖拽事件
    zyup.drag();

    //创建上传句柄
    zyup.createThumbUploader();
    zyup.createImageUploader();
    zyup.createMediaThumbUploader();
    /*zyup.createMediaUploader({type:zyup.config.mediaTypes.localVideo,browseButton:"zyupUploadMp4",
        filter:zyup.config.mediaFilters.videoFilter});
    zyup.createMediaUploader({type:zyup.config.mediaTypes._3d,browseButton:"zyupUpload3D",
        filter:zyup.config.mediaFilters._3dFilter});*/



    //步骤控制
    $("#zyupTab a").click(function(){
        zyup.stepHandler($(this).attr("href"));

        return false;
    });


    //显示上传文件的菜单
    $("#zyupBindFile").hover(function(e){
        $("#zyupAddMediaMenu").addClass("zyupAddMediaMenuActive");
    },function(e){
        $("#zyupAddMediaMenu").removeClass("zyupAddMediaMenuActive");
    });
    $("#zyupAddMediaMenu").hover(function(e){
        $("#zyupAddMediaMenu").addClass("zyupAddMediaMenuActive");
    },function(e){
        $("#zyupAddMediaMenu").removeClass("zyupAddMediaMenuActive");
    });

    //删除文件
    $(document).on("click",".zyupDelete",function(){

        zyup.deleteUploadedFileHandler($(this));

        return false;
    });
    $("#zyupDeleteBindFile").click(function(){
        zyup.deleteBindFile();
    });

    //列表中每一项的点击事件，如果选中的列表没有填写完整，则不能选择其他列表
    $(document).on("click",".zyupMediaItem",function(){
        zyup.uploadedLiClickHandler($(this));

        return false;
    });
    $("#zyupMediaTitle").blur(function(){
        zyup.setMediaTitle($(this).val());
    });
    $("#zyupMediaMemo").blur(function(){
        zyup.setMediaMemo($(this).val());
    });

    //表单提交
    $("#zyupFormSubmitBtn").click(function(){

        //防止重复提交
        zyup.ajaxUploadFormHandler();

        return false;
    });

    //火狐里面阻止form提交
    $("input[type='text'],input[type='password']").keydown(function(e){
        if(e.keyCode==13){
            return false;
        }
    });

});
