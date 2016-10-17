/**
 * Created with JetBrains WebStorm.
 * User: ty
 * Date: 14-10-5
 * Time: 下午5:34
 * To change this template use File | Settings | File Templates.
 */
var config={
    qiNiu:{
        swfUrl:"#",
        upTokenUrl:"qiniu/uptoken",
        uploadDomain:"http://qiniu-plupload.qiniudn.com/",
        bucketDomain:"http://7u2fft.com1.z0.glb.clouddn.com/"
    },
    ajaxUrls:{
        getAllAddress:"admin/location/list",
        getAllCategories:"admin/category/list",
        getAllPosts:"admin/article/list",
        getPostAssets:"admin/article/",
        deletePost:"admin/article/:id/delete"
    },
    dataTable:{
        langLocation:"static/js/backend/de_DE.txt"
    },
    perLoadCounts:{
        table:10
    },
    uploader:{
        swfUrl:"#",
        sizes:{
            all:"5120m",
            img:"2m"
        },
        filters:{
            all:"*",
            img:"jpg,JPG,jpeg,JPEG,png,PNG"
        }
    },
    validErrors:{
        required:"请输入此字段！",
        email:"请输入正确的邮箱格式！",
        emailExist:"邮箱已经存在！",
        uploadImg:"请上传图片！",
        number:"请输入数字",
        maxLength:"此字段最多输入${max}个字！",
        minLength:"此字段最少输入${min}个字！",
        rangLength:"此字段只能输入${min}-${max}个字！",
        pwdNotEqual:"两次输入的密码不一样！"
    },
    messages:{
        successTitle:"成功提示",
        errorTitle:"错误提示",
        optSuccess:"操作成功！",
        noData:"没有数据",
        progress:"处理中...",
        uploaded:"上传完成！",
        confirmDelete:"确定删除吗？",
        noSelected:"没有选中任何记录！",
        notFound:"资源丢失！",
        loadDataError:"请求数据失败！",
        networkError:"网络异常，请稍后重试！",
        systemError:"系统错误，请稍后重试或者联系mail@lotusprize.com！",
        optSuccRedirect:"操作成功,3秒后跳转到管理页！",
        timeout:"登录超时，3秒后自动跳到登陆页！",
        optError:"服务器端异常，请稍后重试！",
        uploadSizeError:"最大文件大小${value}！",
        uploadExtensionError:"只允许上传${value}！",
        uploadIOError:"上传出错，请稍后重试！",
        imageError300x200:"图片尺寸不是300x200px",
        imageError200x200:"图片尺寸不是200x200px"
    }
};
$(document).ready(function(){

    $("input[type='text'],input[type='email']").blur(function(){
        $(this).val($(this).val().trim());
    });

    //火狐里面阻止form提交
    $("input[type='text'],input[type='password']").keydown(function(e){
        if(e.keyCode==13){
            return false;
        }
    });
});
