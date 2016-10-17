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
        list:10,
        page:50
    },
    distance:5000,
    hasNoMoreFlag:-1,//作品、评论、资源等没有更多的标志,当没有更多的时候将其的loadId设置为-1
    messages:{  //错误提示
        errorTitle:"错误提示",
        successTitle:"成功提示",
        keywordNoResult:"搜索该地点无数据！",
        networkError:"网络连接失败，请稍后重试！",
        systemError:"系统发生错误，请稍后重试！"
    },
    menuName:{
        list:"list",
        map:"map"
    },
    scrollType:{
        article:"article",
        video:"video"
    },
    ajaxUrls:{
        baseUrl:"http://121.40.16.252/hnc/",//部署到服务器后这里是空
        getAllArticles:"articles_ajax/search_by_keyword",
        getAllArticlesInMap:"articles_ajax/search_by_geo",
        getArticle:"articles_ajax/:id"
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

        this.searchInArray=function(array,content,key){
            if(key){
                for(var i= 0,len=array.length;i<len;i++){
                    if(array[i][key]==content){
                        return array[i];
                    }
                }
            }

            return false;
        }


    }]);


services.service("Storage",function(){
    this.lastShowCount=0;
    this.scrollTimer=null;
    this.currentScrollType="";
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


services.factory("Article",["$rootScope","$resource","CFunctions","Config","Storage",
    function($rootScope,$resource,CFunctions,Config,Storage){
        return {
            resource:$resource(Config.ajaxUrls.baseUrl+Config.ajaxUrls.getAllArticles,{},{
                query:{method:"get",params:{limit:Config.perLoadCount.page,offset:0,keyword:"",category:"",content_type:1}},
                getAllInMap:{method:"get",params:{longitude:"",latitude:"",distance:Config.distance,content_type:1}},
                get:{method:"get",url:Config.ajaxUrls.baseUrl+Config.ajaxUrls.getArticle,params:{id:0}}
            })
        };
    }]);
services.factory("Music",["$rootScope","$resource","CFunctions","Config",
    function($rootScope,$resource,CFunctions,Config){
        return {
            resource:$resource(Config.ajaxUrls.baseUrl+Config.ajaxUrls.getAllArticles,{},{
                query:{method:"get",params:{limit:Config.perLoadCount.page,offset:0,keyword:"",category:"",content_type:3}},
                getAllInMap:{method:"get",params:{longitude:"",latitude:"",distance:Config.distance,content_type:3}}
            })
        };
    }]);


services.factory("Video",["$rootScope","$resource","Config",
    function($rootScope,$resource,Config){
        return {
            resource:$resource(Config.ajaxUrls.baseUrl+Config.ajaxUrls.getAllArticles,{},{
                query:{method:"get",params:{limit:Config.perLoadCount.page,offset:0,keyword:"",category:"",content_type:2}},
                getAllInMap:{method:"get",params:{longitude:"",latitude:"",distance:Config.distance,content_type:2}},
                get:{method:"get",url:Config.ajaxUrls.baseUrl+Config.ajaxUrls.getArticle,params:{id:0}}
            })
        };
    }]);



