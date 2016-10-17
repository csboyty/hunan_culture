/**
 * Created with JetBrains WebStorm.
 * User: ty
 * Date: 14-7-23
 * Time: 下午3:38
 * To change this template use File | Settings | File Templates.
 */
var services=angular.module("services",["ngResource","toaster"]);

/* *
 * constant类型的service中的值不会被改变，value定义的service中的值可以被改变
 */
services.constant("Config",{
    perLoadCount:{
        list:10
    },
    distance:50000,
    hasNoMoreFlag:-1,//作品、评论、资源等没有更多的标志,当没有更多的时候将其的loadId设置为-1
    tabNames:{
        list:"list",
        map:"map"
    },
    scrollType:{
        post:"post",
        town:"town"
    },
    viewUrls:{
        "postList":"views/postList.html",
        "townDetail":"views/townDetail.html",
        "postDetail":"views/postDetail.html",
        "map":"views/map.html"
    },
    messages:{  //错误提示
        errorTitle:"错误提示",
        successTitle:"成功提示",
        keywordNoResult:"搜索该地点无数据！",
        networkError:"网络连接失败，请稍后重试！",
        systemError:"系统发生错误，请稍后重试！"
    },
    ajaxUrls:{
        baseUrl:"http://121.40.16.252/hnc/",
        //baseUrl:"http://192.168.2.104/hnc/",
        getAllPosts:"articles/search_by_keyword",
        getPostsByGeo:"articles/search_by_geo",
        getPost:"articles/:postId",
        getAllKeywords:"articles/keywords",
        getAllTown:"locations/search_by_geo"
    }
});
services.constant("App",{
    version:"1.0"
});
services.service("AjaxErrorHandler",["toaster","Config",function(toaster,Config){
    this.ajaxReturnErrorHandler=function(errorCode){
        var message="";
        switch(errorCode){

            case "UNEXPECTED_ERROR":
                message=Config.messages.systemError;
                break;
            default :
                message=Config.messages.loadDataError;
                break;
        }
        toaster.pop('error',Config.messages.errorTitle,message,null,null);
    };

    this.ajaxErrorHandler=function(){
        toaster.pop('error',Config.messages.errorTitle,Config.messages.networkError,null,null);
    };
}]);

services.service("CFunctions",["$rootScope","Config",
    function($rootScope,Config){

        this.checkMobile=function(){
            var result={
                isMobile:false,
                isPad:false
            };
            var userAgentList = new Array("2.0 MMP", "240320", "AvantGo","BlackBerry", "Blazer",
                "Cellphone", "Danger", "DoCoMo", "Elaine/3.0", "EudoraWeb", "hiptop", "IEMobile", "KYOCERA/WX310K", "LG/U990",
                "MIDP-2.0", "MMEF20", "MOT-V", "NetFront", "Newt", "Nintendo Wii", "Nitro", "Nokia",
                "Opera Mini", "Opera Mobi",
                "Palm", "Playstation Portable", "portalmmm", "Proxinet", "ProxiNet",
                "SHARP-TQ-GX10", "Small", "SonyEricsson", "Symbian OS", "SymbianOS", "TS21i-10", "UP.Browser", "UP.Link",
                "Windows CE", "WinWAP", "Android", "iPhone", "iPod",  "Windows Phone","iPad", "HTC");
            var padList=["iPad"];
            var appNameList = new Array("Microsoft Pocket Internet Explorer");

            var userAgent = navigator.userAgent.toString();
            var appName = navigator.appName.toString();
            var agentLength=userAgentList.length,appLength=appNameList.length,padLength=padList.length;
            var i= 0,j= 0,k=0;

            for (; i<agentLength; i++) {
                if (userAgent.indexOf(userAgentList[i]) >= 0) {
                    result.isMobile=true;
                }
            }

            for (; j<appLength; j++) {
                if (appName.indexOf(appNameList[j]) >= 0) {
                    result.isMobile=true;
                }
            }

            for(;k<padLength;k++){
                if(userAgent.indexOf(padList[k])>=0){
                    result.isPad=true;
                }
            }

            return result;
        };

        this.searchInArray=function(array,content){
            if(content==""){
                return true;
            }

            if(content.length==1){
                return false;
            }

            for(var i= 0,len=array.length;i<len;i++){
                if(array[i].indexOf(content)!==-1){
                    return true;
                }
            }

            return false;
        }


    }]);


services.service("Storage",function(){
    this.lastLoadedCount=0;
    this.currentTownId=0;
    this.currentPostId=0;
    this.currentScrollType="";
    this.map=null;
    this.keywords=[];
    this.towns=[];
    this.oldBodyScrollTop=0;
    this.scrollTimer=null;
});

services.factory('safeApply', ["$rootScope",function($rootScope) {
    return function(scope, fn) {
        fn = angular.isFunction(fn) ? fn : angular.noop;
        scope = scope && scope.$apply ? scope : $rootScope;
        fn();
        if (!scope.$$phase) {
            scope.$apply();
        }
    }
}]);


services.factory("Post",["$rootScope","$resource","CFunctions","Config","Storage",
    function($rootScope,$resource,CFunctions,Config,Storage){
        return {
            getListPosts:function(keyword,category){
                return this.resource.query({keyword:keyword,offset:Storage.lastLoadedCount,category:category},function(response){
                    if(response.data.articles.length<Config.perLoadCount.list){
                        Storage.lastLoadedCount=Config.hasNoMoreFlag;
                    }else{
                        Storage.lastLoadedCount+=Config.perLoadCount.list;
                    }
                });
            },
            resource:$resource(Config.ajaxUrls.baseUrl+Config.ajaxUrls.getAllPosts,{},{
                query:{method:"get",params:{limit:Config.perLoadCount.list,offset:0,keyword:"",category:""}},
                get:{method:"get",url:Config.ajaxUrls.baseUrl+Config.ajaxUrls.getPost,params:{postId:0}},
                getAllKeywords:{method:"get",url:Config.ajaxUrls.baseUrl+Config.ajaxUrls.getAllKeywords},
                getPostsByGeo:{method:"get",url:Config.ajaxUrls.baseUrl+Config.ajaxUrls.getPostsByGeo,
                    params:{latitude:"",longitude:"",distance:Config.distance}
                }
            })
        };
    }]);

services.factory("Town",["$rootScope","$resource","Config",
    function($rootScope,$resource,Config){
        return {
            resource:$resource(Config.ajaxUrls.baseUrl+Config.ajaxUrls.getAllTown,{},{
                query:{method:"get",params:{longitude:"",latitude:"",distance:Config.distance}}
            })
        };
    }]);


